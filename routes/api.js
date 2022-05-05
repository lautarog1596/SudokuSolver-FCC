'use strict';

const SudokuSolver = require('../controllers/sudoku-solver.js');

module.exports = function(app) {

    let solver = new SudokuSolver();

    app.route('/api/check')
        .post((req, res) => {
            const { puzzle, coordinate, value } = req.body;
            if (!puzzle || !coordinate || !value) {
                res.json({ error: 'Required field(s) missing' });
                return;
            }
            const row = coordinate.split('')[0];
            const col = coordinate.split('')[1];
            if (coordinate.length !== 2 || !/[a-i]/i.test(row) || !/[1-9]/.test(col)) {
                res.json({ error: 'Invalid coordinate' });
                return;
            }
            if (!/[1-9]/.test(value)) {
                res.json({ error: 'Invalid value' });
                return;
            }
            if (puzzle.length !== 81) {
                res.json({ error: 'Expected puzzle to be 81 characters long' });
                return;
            }
            if (/[^0-9.]/g.test(puzzle)) {
                res.json({ error: 'Invalid characters in puzzle' });
                return;
            }

            let validCol = solver.checkColPlacement(puzzle, row, col, value);
            let validReg = solver.checkRegionPlacement(puzzle, row, col, value);
            let validRow = solver.checkRowPlacement(puzzle, row, col, value);
            let conflicts = []
            if (validCol && validReg && validRow) {
                res.json({ valid: true })
                return
            } else {
                if (!validCol) conflicts.push('column')
                if (!validReg) conflicts.push('region')
                if (!validRow) conflicts.push('row')
                res.json({ valid: false, conflicts })
                return
            }
        });


    app.route('/api/solve')
        .post((req, res) => {
            const { puzzle } = req.body;
            if (!puzzle) {
                res.json({ error: 'Required field missing' })
                return
            }
            if (puzzle.length !== 81) {
                res.json({ error: 'Expected puzzle to be 81 characters long' })
                return
            }
            if (/[^0-9.]/g.test(puzzle)) {
                res.json({ error: 'Invalid characters in puzzle' })
                return
            }
            let solved = solver.solve(puzzle);
            if (!solved) {
                res.json({ error: 'Puzzle cannot be solved' })
                return
            } else {
                res.json({ solution: solved })
                return
            }

        });
};