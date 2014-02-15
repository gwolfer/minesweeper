var scripts = document.getElementsByTagName("script")
var currentScriptPath = scripts[scripts.length-1].src;

angular.module('wolfer.minesweeper', ['pascalprecht.translate']);

angular.module('wolfer.minesweeper').directive('ngRightClick', function($parse) {
    return function(scope, element, attrs) {
        var fn = $parse(attrs.ngRightClick);
        element.bind('contextmenu', function(event) {
            scope.$apply(function() {
                event.preventDefault();
                fn(scope, {$event:event});
            });
        });
    };
});

angular.module('wolfer.minesweeper').directive("ngMinesweeper", ['$translate', function($translate) {
    return {
        restrict: "A",
        replace: true,
        scope: { defaultLevel: '=' },
        templateUrl: currentScriptPath.replace('.js', '.html'),
        controller: ["$scope", "$element", "$attrs",
		function($scope, $element, $attrs) {
						
			// Generate the grid
			function Grid(rowCount, colCount, mineCount) {
				
				// Parameters
				var _rowCount = rowCount;
				var _colCount = colCount;
				var _mineCount = mineCount;
				var _size = rowCount * colCount;
				var _state;
				
				// Time
				var _time = 0;
				var _interval;
				var _start = function() {
					_time = 0;
					_interval = setInterval(function(){
						if( _state == 'playing') {
							_time++;
							$scope.$apply();
						}
					}, 1000);
				};
				
				// Structure
				var _grid;
			
				// Random integer generator
				var _randInt = function(randIntMin, randIntMax) {
					return Math.floor(Math.random() * (randIntMax - randIntMin + 1)) + randIntMin;
				};
				
				// Indices of cells around
				var _surrounding = function(n) {
					var s = [];
					if(n > 0 && (n % colCount != 0)) s.push(n - 1);
					if(n + 1 < _size && ((n + 1) % colCount != 0)) s.push(n + 1);
					if(n - _colCount >= 0) s.push(n - _colCount);
					if(n + _colCount < _size) s.push(n + _colCount);				
					if((n - _colCount - 1 > 0) && (n % colCount != 0)) s.push(n - _colCount - 1);
					if((n - _colCount + 1 > 0) && ((n + 1) % colCount != 0)) s.push(n - _colCount + 1);
					if((n + _colCount - 1 < _size) && (n % colCount != 0)) s.push(n + _colCount - 1);
					if((n + _colCount + 1 < _size) && ((n + 1) % colCount != 0)) s.push(n + _colCount + 1);
					return s;
				}				
				
				// Unveil cells
				var _unveiledCount;
				
				var _unveilCell = function(n) {
					_grid[n].unveiled = true;
					_unveiledCount++;
				};
				
				var _defuseCell = function(n) {
					_grid[n].defused = true;
				};
				
				var _unveilSurroundingRec = function(n) {
					var s = _surrounding(n);
					var k;
					for (k = 0; k < s.length; k++) {
						if(!_grid[s[k]].unveiled) {
							if(_grid[s[k]].flagged) {
								_grid[s[k]].flagged = false;
							}
							_unveilCell(s[k]);
							if(_grid[s[k]].value == 0)
							{
								_unveilSurroundingRec(s[k]);
							}
						}
					}
				}
				
				var _unveilMines = function(defuse) {
					var n;
					for(n = 0; n < _size; n++) {
						if(_grid[n].value == 9) {
							_unveilCell(n);
							if(defuse) {
								_defuseCell(n);
							}
						}
					}
				};
				
				// Convert row, col into index
				var _index = function(i, j) {
					return i * _colCount + j;
				};
				
				
				// Public methods
				this.init = function() {
					
					// Reset parameters
					_state = 'pending';
					_unveiledCount = 0;
					_flaggedCount = 0;

					// Structure
					_grid = [];
					var n;
					for (n = 0; n < _size; n++) _grid.push({unveiled: false, flagged: false});

					// Mines
					var placedMines = 0;
					var r, c;
					while (placedMines < _mineCount) {
						r = _randInt(0, _size - 1);
						c = _grid[r];
						if(c.value != 9) {
							c.value = 9;
							placedMines++;
						}
					}		

					// Hints
					var k, m, n, s;
					for(n = 0; n < _size; n++) {
						if (!_grid[n].value)
						{
							m = 0;
							s = _surrounding(n);
							for(k = 0; k < s.length; k++) {
								if (_grid[s[k]].value && (_grid[s[k]].value == 9)) {
									m++;
								}
							}
							_grid[n].value = m;
						}
					}
				}
				
				this.cell = function(i, j) {
					return _grid[i * _colCount + j];
				};
				
				this.play = function(i, j) {
					var n = _index(i, j);
					if((_state == 'playing' || _state == 'pending') && !_grid[n].flagged && !_grid[n].unveiled) {
						_unveilCell(n);
						if(_grid[n].value == 9) {
							_state = 'lost';
							_unveilMines(false);
						} else if(_grid[n].value == 0) {
							_unveilSurroundingRec(n);
						}
						if(_state == 'pending') {
							_state = 'playing';
							if(_interval) {
								clearInterval(_interval); // this does not work
							}
							_start();
						}
						if(_unveiledCount === _size - _mineCount) {
							_state = 'won';
							_unveilMines(true);
						}
					}
				}
				
				var _flaggedCount;				
				this.flag = function(i, j) {
					var n = _index(i, j);
					if(!_grid[n].unveiled) {
						if(_grid[n].flagged) {
							_grid[n].flagged = false;
							_flaggedCount--;
						} else {
							_grid[n].flagged = true;
							_flaggedCount++;
						}						
					}
				}
				
				this.flaggedCount = function(){
					return _flaggedCount;
				};
				
				this.unveiledCount = function(){
					return _unveiledCount;
				};
				
				this.mineCount = function(){
					return _mineCount;
				};	
						
				this.state = function() {
					return _state;
				};
				
				this.rows = function() {
					return Lazy.range(_rowCount).toArray();
				};
				
				this.cols = function() {
					return Lazy.range(_colCount).toArray();
				};			
				
				this.time = function() {
					return _time;
				};
													
				return {cell: this.cell,
						play: this.play,
						flag: this.flag,
						state: this.state,
						init: this.init,
						rows: this.rows,
						cols: this.cols,
						flaggedCount: this.flaggedCount,
						unveiledCount: this.unveiledCount,
						mineCount: this.mineCount,
						time: this.time};
			}
			
			// Level
			function setLevel(level){
				var options = {};
				switch(level) {
					case 'beginner':
						options.rowCount = 8;
						options.colCount = 8;
						options.mineCount = 10;
						break;
					case 'medium':
						options.rowCount = 16;
						options.colCount = 16;
						options.mineCount = 40;
						break;
					case 'expert':
						options.rowCount = 16;
						options.colCount = 30;
						options.mineCount = 99;
						break;
					default:
						options.rowCount = 8;
						options.colCount = 8;
						options.mineCount = 10;
						break;
				}
				return options;	
			}
			$scope.level = $scope.defaultLevel ? $scope.defaultLevel : 'beginner';
			
			// Game
			$scope.init = function(){
				var options = setLevel($scope.level);
				$scope.grid = new Grid(options.rowCount, 
									   options.colCount, 
									   options.mineCount);
				$scope.grid.init();
			};
        }]
    };
}]);

angular.module('wolfer.minesweeper').filter('cellDisplay', function() {
  return function(cell) {
	if(!cell.unveiled || cell.value == 9) {
		return '';
	} else {
		return cell.value;
	}
  };
});

angular.module('wolfer.minesweeper').filter('cellClass', function() {
  return function(cell) {
	if (cell.defused) {
		return 'icon-asterisk';
	} else if(cell.unveiled && cell.value == 9) {
		return 'icon-fire';
	} else if (cell.flagged) {
		return 'icon-flag';
	} else {
		return 'minesweeper-value-' + cell.value;
	}
  };
});

angular.module('wolfer.minesweeper').filter('buttonClass', function() {
  return function(cell) {
	if(cell.unveiled && cell.value == 9 && !cell.defused) {
		return 'btn-danger';
	}
	if(cell.flagged) {
		return 'btn-info';
	}
	if(cell.defused) {
		return 'btn-success';
	}
  };
});
