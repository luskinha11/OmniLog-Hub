class Queue {
  #items = [];
  #head = 0;

  enqueue(item) {
    this.#items.push(item);
    return this.size();
  }

  dequeue() {
    if (this.isEmpty()) return undefined;
    const item = this.#items[this.#head];
    this.#items[this.#head] = undefined;
    this.#head += 1;
    if (this.#head > 32 && this.#head * 2 >= this.#items.length) {
      this.#items = this.#items.slice(this.#head);
      this.#head = 0;
    }
    return item;
  }

  front() { return this.#items[this.#head]; }
  isEmpty() { return this.size() === 0; }
  size() { return this.#items.length - this.#head; }
  clear() { this.#items = []; this.#head = 0; }
}

module.exports = Queue;
