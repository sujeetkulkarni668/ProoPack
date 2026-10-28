// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title ProofPackSettlement
 * @notice Layer 2 Transaction Optimization Settlement Contract for MST Blockchain.
 * @dev Stores deterministic batch commitments, enforces sequential ordering,
 * verifies inclusion proofs, and publishes compressed data availability on MST L1.
 */
contract ProofPackSettlement is Ownable, Pausable, ReentrancyGuard {
    struct BatchRecord {
        bytes32 batchRoot;
        bytes32 stateCommitment;
        uint32 txCount;
        uint256 settledAtBlock;
        uint256 timestamp;
    }

    /// @notice Next sequential batch ID expected
    uint32 public nextBatchId;

    /// @notice Most recent settled batch Merkle root
    bytes32 public latestBatchRoot;

    /// @notice Authorized sequencer operators permitted to settle batches
    mapping(address => bool) public isOperator;

    /// @notice Storage mapping of settled batches: batchId => BatchRecord
    mapping(uint32 => BatchRecord) public batches;

    // Events
    event BatchSettled(
        uint32 indexed batchId,
        bytes32 indexed batchRoot,
        bytes32 stateCommitment,
        uint32 txCount,
        uint256 settledAtBlock,
        uint256 timestamp
    );

    event OperatorUpdated(address indexed operator, bool authorized);

    // Custom Errors
    error UnauthorizedOperator(address caller);
    error InvalidBatchSequence(uint32 expected, uint32 provided);
    error PreviousBatchRootMismatch(bytes32 expected, bytes32 provided);
    error EmptyBatchRoot();
    error ZeroTransactionCount();
    error BatchAlreadySettled(uint32 batchId);
    error InvalidProof();

    modifier onlyOperator() {
        if (!isOperator[msg.sender] && msg.sender != owner()) {
            revert UnauthorizedOperator(msg.sender);
        }
        _;
    }

    constructor(address initialOwner, address initialOperator) Ownable(initialOwner) {
        nextBatchId = 1;
        latestBatchRoot = bytes32(0);

        if (initialOperator != address(0)) {
            isOperator[initialOperator] = true;
            emit OperatorUpdated(initialOperator, true);
        }
    }

    /**
     * @notice Sets or revokes operator permissions
     */
    function setOperator(address operator, bool authorized) external onlyOwner {
        require(operator != address(0), "Zero address operator");
        isOperator[operator] = authorized;
        emit OperatorUpdated(operator, authorized);
    }

    /**
     * @notice Settles an off-chain transaction batch on MST Blockchain
     * @param batchId Sequential ID of the batch
     * @param prevBatchRoot The cryptographic root of the immediately preceding batch
     * @param batchRoot Merkle root of all valid transactions included in this batch
     * @param txCount Number of bundled transactions
     * @param compressedPayload Byte-level compressed binary data for Data Availability
     */
    function settleBatch(
        uint32 batchId,
        bytes32 prevBatchRoot,
        bytes32 batchRoot,
        uint32 txCount,
        bytes calldata compressedPayload
    ) external onlyOperator whenNotPaused nonReentrant {
        if (batchId != nextBatchId) {
            revert InvalidBatchSequence(nextBatchId, batchId);
        }
        if (prevBatchRoot != latestBatchRoot) {
            revert PreviousBatchRootMismatch(latestBatchRoot, prevBatchRoot);
        }
        if (batchRoot == bytes32(0)) {
            revert EmptyBatchRoot();
        }
        if (txCount == 0) {
            revert ZeroTransactionCount();
        }
        if (batches[batchId].settledAtBlock != 0) {
            revert BatchAlreadySettled(batchId);
        }
        require(compressedPayload.length > 0, "Empty payload");

        // Calculate cryptographic state commitment binding sequence & roots
        bytes32 stateCommitment = keccak256(
            abi.encodePacked(batchId, prevBatchRoot, batchRoot, txCount)
        );

        batches[batchId] = BatchRecord({
            batchRoot: batchRoot,
            stateCommitment: stateCommitment,
            txCount: txCount,
            settledAtBlock: block.number,
            timestamp: block.timestamp
        });

        nextBatchId = batchId + 1;
        latestBatchRoot = batchRoot;

        emit BatchSettled(
            batchId,
            batchRoot,
            stateCommitment,
            txCount,
            block.number,
            block.timestamp
        );
    }

    /**
     * @notice Verifies whether a specific transaction leaf is included in a settled batch
     * @param batchId The batch ID to verify against
     * @param leaf The computed leaf hash of the transaction
     * @param proof The Merkle sibling path
     * @param index Leaf index within the batch tree
     */
    function verifyTransactionInBatch(
        uint32 batchId,
        bytes32 leaf,
        bytes32[] calldata proof,
        uint256 index
    ) external view returns (bool) {
        bytes32 root = batches[batchId].batchRoot;
        if (root == bytes32(0)) {
            return false;
        }

        bytes32 computedHash = leaf;
        uint256 currentIndex = index;

        for (uint256 i = 0; i < proof.length; i++) {
            bytes32 sibling = proof[i];
            if (currentIndex % 2 == 1) {
                computedHash = keccak256(abi.encodePacked(sibling, computedHash));
            } else {
                computedHash = keccak256(abi.encodePacked(computedHash, sibling));
            }
            currentIndex = currentIndex / 2;
        }

        return computedHash == root;
    }

    /**
     * @notice Pauses contract in emergency
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @notice Resumes contract settlement
     */
    function unpause() external onlyOwner {
        _unpause();
    }
}
