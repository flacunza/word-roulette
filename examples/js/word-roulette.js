var WordRoulette = function (options) {
	this._options = options || {};
	this.target = document.getElementById(this._options.target);
	this._dataSource = this._options.dataSource;
	this.render();
};

WordRoulette.classNames = {
	ROULETTE: "wr-roulette",
	TERM: "wr-term",
	DEFINITION: "wr-def",
	HINT: "wr-hint",
	HAS_HINT: "wr-has-hint",
	HINT_BUTTON: "wr-hint-btn",
	HINT_SHOWN: "wr-hint-shown",
	GUESSING: "wr-guessing"
};

var WRBuilder = function (options) {
	this._options = options || {};
	this.target = document.getElementById(this._options.target);
	this._dataSource = this._options.dataSource;
	this.render();
};

WRBuilder.classNames = {
	BUILDER: "wr-builder",
	TERM: "wr-term",
	DEFINITION: "wr-def",
	HINT: "wr-hint",
	ADD_BUTTON: "wr-add-btn",
	EXPORT_BUTTON: "wr-export-btn"
};

(function () {
	
	WordRoulette.prototype.render = function () {
		var self = this;
		if (self.target) {
			self.target.classList.add(WordRoulette.classNames.ROULETTE);
			self._termSection = document.createElement('section');
			self._termSection.classList.add(WordRoulette.classNames.TERM);
			self.target.appendChild(self._termSection);
			self._definitionSection = document.createElement('section');
			self._definitionSection.classList.add(WordRoulette.classNames.DEFINITION);
			self.target.appendChild(self._definitionSection);
			self._hintSection = document.createElement('section');
			self._hintSection.classList.add(WordRoulette.classNames.HINT);
			var button = document.createElement('button');
			button.classList.add(WordRoulette.classNames.HINT_BUTTON);
			button.innerHTML = "i";
			self.target.appendChild(button);
			button.addEventListener('click', function(e) {
				self.showHint();
				e.stopPropagation();
			});
			self.target.appendChild(self._hintSection);
			self.target.addEventListener('click', function () {
				self.nextStep();
			});
		}
	};
	
	WordRoulette.prototype.getTermSection = WRBuilder.prototype.getTermSection = function () {
		return this._termSection;
	};

	WordRoulette.prototype.updateTermSection = WRBuilder.prototype.updateTermSection = function (term) {
		updateSection.call(this, this.getTermSection(), term);
	};
	
	WordRoulette.prototype.getDefinitionSection = WRBuilder.prototype.getDefinitionSection = function () {
		return this._definitionSection;
	};
	
	WordRoulette.prototype.updateDefinitionSection = WRBuilder.prototype.updateDefinitionSection = function (definition) {
		updateSection.call(this, this.getDefinitionSection(), definition);
	};
	
	WordRoulette.prototype.getHintSection = WRBuilder.prototype.getHintSection = function () {
		return this._hintSection;
	};
	
	WordRoulette.prototype.updateHintSection = WRBuilder.prototype.getHintSection = function (hint) {
		var self = this;
		updateSection.call(self, self.getHintSection(), hint);
		self.target.classList.remove(WordRoulette.classNames.HINT_SHOWN);
		if (hint) {
			self.target.classList.add(WordRoulette.classNames.HAS_HINT);
		}
		else {
			self.target.classList.remove(WordRoulette.classNames.HAS_HINT);
		}
	};

	WordRoulette.prototype.getRandomIndex = function (length) {
		return Math.floor(Math.random() * length);
	};
	
	WordRoulette.prototype.setGuessing = function (value) {
		var self = this;
		self._guessing = value;
		if (self._guessing) {
			self.target.classList.add(WordRoulette.classNames.GUESSING);
		}
		else {
			self.target.classList.remove(WordRoulette.classNames.GUESSING);
			self.target.classList.remove(WordRoulette.classNames.HINT_SHOWN);
		}
	};
	
	WordRoulette.prototype.getEntry = function (term) {
		var self = this;
		if (term) {
			var filterFunction = function (elm) {
				return (elm.term === term);
			}
			var entry = self.remainingEntries.filter(filterFunction)[0];
			if (!entry) {
				entry = self.reviewedEntries.filter(filterFunction)[0];
			}
			self.currentEntry = entry;
		}
		else {
			var idx = self.getRandomIndex(self.remainingEntries.length);
			self.currentEntry = self.remainingEntries[idx];
			self.remainingEntries.splice(idx, 1);
			self.reviewedEntries.push(self.currentEntry);
		}
		self.target.classList.remove(WordRoulette.classNames.HINT_SHOWN);
		self.updateTermSection(self.currentEntry.term);
		self.updateDefinitionSection(self.currentEntry.def);
		self.updateHintSection(self.currentEntry.hint || "");
		self.setGuessing(true);
	};
	
	WordRoulette.prototype.resolve = function () {
		var self = this;
		self.setGuessing(false);
		if (!self.remainingEntries.length) {
			self.reset();
		}
	};
	
	WordRoulette.prototype.reset = function () {
		this.init();
	};
	
	WordRoulette.prototype.nextStep = function () {
		if (this._ready) {
			if (this._guessing) {
				this.resolve();
			}
			else {
				this.getEntry();
			}
		}
	};
	
	WordRoulette.prototype.showHint = function () {
		var self = this;
		if (self.currentEntry.hint) {
			self.target.classList.add(WordRoulette.classNames.HINT_SHOWN);
		}
	};

	
	WordRoulette.prototype.init = WRBuilder.prototype.init = function () {
		var self = this;
		var req = new XMLHttpRequest();
		req.open('GET', self._dataSource, true);
		req.onreadystatechange = function (e) {
			if (req.readyState == 4) {
				if (req.status == 200) {
					self.data = JSON.parse(req.responseText);
					self.remainingEntries = [];
					self.reviewedEntries = [];
					for (var i = 0, ii = self.data.length; i < ii; i++) {
						var letter = self.data[i];
						for (var j = 0, jj = letter.entries.length; j < jj; j++) {
							var entry = letter.entries[j];
							
							self.remainingEntries[self.remainingEntries.length] = entry;
						}
					}
					self._ready = true;
					self.getEntry();
				}
				else {
					console.log("Error loading page");
				}
			}
		};
		req.send(null);
	}
	
	WordRoulette.prototype.setHint = function (entry, hint) {
		entry.hint = hint;
	};
	
	var updateSection = function (section, text) {
		if (this instanceof WRBuilder) {
			var input = section.getElementsByTagName("input")[0];
			if (input) {
				input.value = text;
			}
		}
		else {
			section.innerHTML = text;
		}
	};
	
	var getSectionValue = function (section) {
		if (this instanceof WRBuilder) {
			var input = section.getElementsByTagName("input")[0];
			if (input) {
				return input.value;
			}
		}
		else {
			return section.innerHTML;
		}
	};

	WRBuilder.prototype.render = function () {
		var self = this;
		if (self.target) {
			self.target.classList.add(WRBuilder.classNames.BUILDER);
			self._termSection = document.createElement('section');
			self._termSection.classList.add(WRBuilder.classNames.TERM);
			self.target.appendChild(self._termSection);
			self._definitionSection = document.createElement('section');
			self._definitionSection.classList.add(WRBuilder.classNames.DEFINITION);
			self.target.appendChild(self._definitionSection);
			self._hintSection = document.createElement('section');
			self._hintSection.classList.add(WRBuilder.classNames.HINT);
			self.target.appendChild(self._hintSection);

			var input = document.createElement('input');
			input.setAttribute("type", "text");
			self._termSection.appendChild(input);
			input = document.createElement('input');
			input.setAttribute("type", "text");
			self._definitionSection.appendChild(input);
			input = document.createElement('input');
			input.setAttribute("type", "text");
			self._hintSection.appendChild(input);

			var button = document.createElement('button');
			button.innerHTML = "Añadir";
			button.classList.add(WRBuilder.classNames.ADD_BUTTON);
			self.target.appendChild(button);
			button.addEventListener('click', function () {
				self.addEntry({
					term: getSectionValue.call(self, self._termSection), 
					def: getSectionValue.call(self, self._definitionSection)
				});
				self.clear();
			});
			button = document.createElement('button');
			button.innerHTML = "Exportar";
			button.classList.add(WRBuilder.classNames.EXPORT_BUTTON);
			self.target.appendChild(button);
			button.addEventListener('click', function () {
				self.exportData();
			});
		}
	};
	
	WRBuilder.prototype.getEntry = function () {};
	
	WRBuilder.prototype.clear = function () {
		var self = this;
		self.updateTermSection('');
		self.updateDefinitionSection('');
		self.updateHintSection('');
	};

	WRBuilder.prototype.addEntry = function (entry) {
		var self = this;
		var term = entry.term.toUpperCase();
		var initial = term.substr(0, 1);
		var def = entry.def.toLowerCase();
		for (var i = 0, ii = self.data.length; i < ii; i++) {
			var letterSection = self.data[i];
			if (letterSection.letter === initial) {
				if (!letterSection.entries.filter(function (elm) {
					return elm.term === term;
				}).length) {
					letterSection.entries.push({
						term: term,
						def: def
					});
					letterSection.entries.sort(function (a, b) {
						return a.term.localeCompare(b.term);
					});
				}
				break;
			}
		}
	};
	
	WRBuilder.prototype.exportData = function () {
		var self = this;
		var blob = new Blob([JSON.stringify(self.data)], { type: 'application/jsonl; charset=utf-8' });
		var fileName = self._dataSource.substr(self._dataSource.lastIndexOf('/') + 1);
		if (navigator.msSaveBlob) { // IE 10+
			navigator.msSaveBlob(blob, fileName);
		} else {
			var link = document.createElement("a");
			if (link.download !== undefined) { // feature detection
				// Browsers that support HTML5 download attribute
				var url = URL.createObjectURL(blob);
				link.setAttribute("href", url);
				link.setAttribute("download", fileName);
				link.style.visibility = 'hidden';
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);
			}
		}
	};
})();