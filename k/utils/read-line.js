import { createReadStream } from 'fs';
import { createInterface } from 'readline';

const createLineReader = (filePath) => {
  const fileStream = createReadStream(filePath);
  const rl = createInterface({ input: fileStream, crlfDelay: Infinity });

  const lineIterator = rl[Symbol.asyncIterator]();

  let currentLine = null;

  const readNextLine = async () => {
    if (currentLine) {
      return currentLine;
    }

    const { value, done } = await lineIterator.next();
    if (done) {
      return null;
    }

    currentLine = value;
    return currentLine;
  };

  const moveToNextLine = async () => {
    const { value, done } = await lineIterator.next();
    if (done) {
      currentLine = null;
      return null;
    }

    currentLine = value;
    return currentLine;
  };

  return { readNextLine, moveToNextLine };
};

export default createLineReader;
