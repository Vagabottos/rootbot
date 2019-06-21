
import test from 'ava-ts';
import { Container } from 'typescript-ioc';

import { CommandParser } from '../helpers/command-parser';

test.beforeEach((t) => {
  (t.context as any).commandParser = Container.get(CommandParser);
});

test('Command Parser registers executable commands correctly', (t) => {
  const commandParser = (t.context as any).commandParser;

  t.true(Object.keys(commandParser.executableCommands).length === 0, 'the command parser does not have any commands by default');

  class TestCommand {
    aliases = ['test'];
    execute() {}
  }

  commandParser.registerCommand(new TestCommand());
  t.truthy(commandParser.executableCommands.test, 'the command parser has a test command');
});

test('Command Parser registers message handler commands correctly', (t) => {
  const commandParser = (t.context as any).commandParser;

  t.true(commandParser.messageCommands.length === 0, 'the command parser does not have any commands by default');

  class TestCommand {
    onMessage() {}
  }

  commandParser.registerCommand(new TestCommand());
  t.truthy(commandParser.messageCommands[0], 'the command parser has a test command');
});

test('Command Parser registers emoji add commands correctly', (t) => {
  const commandParser = (t.context as any).commandParser;

  t.true(commandParser.emojiAddCommands.length === 0, 'the command parser does not have any commands by default');

  class TestCommand {
    onEmojiAdd() {}
  }

  commandParser.registerCommand(new TestCommand());
  t.truthy(commandParser.emojiAddCommands[0], 'the command parser has a test command');
});

test('Command Parser registers emoji remove commands correctly', (t) => {
  const commandParser = (t.context as any).commandParser;

  t.true(commandParser.emojiRemoveCommands.length === 0, 'the command parser does not have any commands by default');

  class TestCommand {
    onEmojiRemove() {}
  }

  commandParser.registerCommand(new TestCommand());
  t.truthy(commandParser.emojiRemoveCommands[0], 'the command parser has a test command');
});
