import React from 'react';
import Puzzle1 from './Puzzle1';

/** The recovery puzzles, in the order the jobs refer to them (0 = Puzzle1). */
const puzzles: React.ComponentType<{ onSolve: () => void }>[] = [Puzzle1];

export default puzzles;
