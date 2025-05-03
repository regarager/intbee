export interface Pair<T1, T2> {
  first: T1;
  second: T2;
}

export function make_pair<T1, T2>(first: T1, second: T2): Pair<T1, T2> {
  return { first, second };
}

interface QueueNode<T> {
  value: T;
  next: QueueNode<T> | null;
}

export class Queue<T> {
  private head: QueueNode<T> | null;
  private tail: QueueNode<T> | null;
  private length: number;

  constructor() {
    this.head = null;
    this.tail = null;
    this.length = 0;
  }

  enqueue(value: T) {
    const node: QueueNode<T> = { value, next: null };

    if (this.head === null) {
      this.head = node;
      this.tail = this.head;
    } else {
      this.tail!.next = node;
      this.tail = node;
    }

    this.length++;
  }

  dequeue() {
    if (this.head === null) {
      throw new Error("attempted to dequeue empty queue");
    }

    const res = this.head.value;

    this.head = this.head.next;

    if (this.length === 1) {
      this.tail = null;
    }

    this.length--;

    return res;
  }

  slice(length: number) {
    const res = [];
    let curr = this.head;

    for (let i = 0; i < length; i++) {
      if (curr === null) break;
      res.push(curr.value);
      curr = curr.next;
    }

    return res;
  }

  size() {
    return this.length;
  }
}
