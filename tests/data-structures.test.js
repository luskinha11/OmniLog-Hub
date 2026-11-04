const Stack = require('../src/models/Stack');
const Queue = require('../src/models/Queue');

test('Stack trabalha em LIFO', () => {
  const stack = new Stack();
  stack.push('primeiro'); stack.push('segundo');
  expect(stack.pop()).toBe('segundo');
  expect(stack.peek()).toBe('primeiro');
  expect(stack.size()).toBe(1);
});

test('Queue trabalha em FIFO', () => {
  const queue = new Queue();
  queue.enqueue('primeiro'); queue.enqueue('segundo');
  expect(queue.dequeue()).toBe('primeiro');
  expect(queue.front()).toBe('segundo');
  expect(queue.size()).toBe(1);
});

test('Queue vazia retorna undefined', () => {
  expect(new Queue().dequeue()).toBeUndefined();
});
