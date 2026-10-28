import { keccak256, encodePacked, Hex, isHex } from 'viem';

export class MerkleTree {
  private leaves: Hex[];
  private layers: Hex[][];

  constructor(leaves: Hex[]) {
    this.leaves = leaves.map(l => (isHex(l) ? l : (`0x${l}` as Hex)));
    this.layers = [this.leaves];
    this.buildTree();
  }

  private buildTree(): void {
    if (this.leaves.length === 0) {
      this.layers = [[('0x' + '0'.repeat(64)) as Hex]];
      return;
    }

    let currentLayer = this.leaves;
    while (currentLayer.length > 1) {
      const nextLayer: Hex[] = [];
      for (let i = 0; i < currentLayer.length; i += 2) {
        const left = currentLayer[i];
        const right = i + 1 < currentLayer.length ? currentLayer[i + 1] : left;
        
        // Standard sorted or ordered pair hashing
        const combined = encodePacked(['bytes32', 'bytes32'], [left, right]);
        nextLayer.push(keccak256(combined));
      }
      this.layers.push(nextLayer);
      currentLayer = nextLayer;
    }
  }

  public getRoot(): Hex {
    if (this.layers.length === 0 || this.layers[this.layers.length - 1].length === 0) {
      return ('0x' + '0'.repeat(64)) as Hex;
    }
    return this.layers[this.layers.length - 1][0];
  }

  public getProof(index: number): Hex[] {
    if (index < 0 || index >= this.leaves.length) {
      throw new Error(`Invalid leaf index: ${index}`);
    }

    const proof: Hex[] = [];
    let currentIndex = index;

    for (let i = 0; i < this.layers.length - 1; i++) {
      const layer = this.layers[i];
      const isRight = currentIndex % 2 === 1;
      const pairIndex = isRight ? currentIndex - 1 : currentIndex + 1;

      if (pairIndex < layer.length) {
        proof.push(layer[pairIndex]);
      } else {
        proof.push(layer[currentIndex]);
      }

      currentIndex = Math.floor(currentIndex / 2);
    }

    return proof;
  }

  public static verify(leaf: Hex, proof: Hex[], root: Hex, index: number): boolean {
    let hash = leaf;
    let currentIndex = index;

    for (const sibling of proof) {
      const isRight = currentIndex % 2 === 1;
      const left = isRight ? sibling : hash;
      const right = isRight ? hash : sibling;

      const combined = encodePacked(['bytes32', 'bytes32'], [left, right]);
      hash = keccak256(combined);
      currentIndex = Math.floor(currentIndex / 2);
    }

    return hash.toLowerCase() === root.toLowerCase();
  }
}
