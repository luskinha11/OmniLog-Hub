class Stack {
  #items = [];

  push(item) { this.#items.push(item); return this.size(); }
  pop() { return this.#items.pop(); }
  peek() { return this.#items[this.#items.length - 1]; }
  isEmpty() { return this.#items.length === 0; }
  size() { return this.#items.length; }
  clear() { this.#items.length = 0; }
}

module.exports = Stack;
