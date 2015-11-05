/**
 * pickle-jumper - Pickle Jumper!
 * @version v0.0.1
 * @link https://github.com/zzolo/pickle-jumper#readme
 * @license MIT
 */
(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/* global _:false, $:false, Phaser:false */

/**
 * Main JS for Pickle Jumper
 */

(function() {
  "use strict";

  // Dependencies
  var states = {
    Gameover: require("./pickle-jumper/state-gameover.js"),
    Play: require("./pickle-jumper/state-play.js"),
    Menu: require("./pickle-jumper/state-menu.js"),
  };

  // Constructore for Pickle
  var Pickle = window.Pickle = function(options) {
    this.options = options;
    this.el = this.options.el;
    this.$el = $(this.options.el);
    this.$ = function() {
      return $(options.el).find;
    };

    this.width = this.$el.width();
    this.height = $(window).height();

    // Start
    this.start();
  };

  // Add properties
  _.extend(Pickle.prototype, {
    // Start everything
    start: function() {
      // Create Phaser game
      this.game = new Phaser.Game(
        this.width,
        this.height,
        Phaser.AUTO,
        this.el.replace("#", ""));

      // Add reference to game, since most parts have this reference
      // already
      this.game.pickle = this;

      // Register states
      this.game.state.add("menu", states.Menu);
      this.game.state.add("play", states.Play);
      this.game.state.add("gameover", states.Gameover);

      // Highscore
      this.highscoreLimit = 10;
      this.getHighscores();

      // Start with menu
      this.game.state.start("menu");

      // Debug
      if (this.options.debug && this.game.camera) {
        this.game.debug.cameraInfo(this.game.camera, 10, 10);
      }

      if (this.options.debug) {
        this.resetHighscores();
        this.getHighscores();
      }
    },

    // Get high scores
    getHighscores: function() {
      var s = window.localStorage.getItem("highscores");
      s = (s) ? JSON.parse(s) : [];
      this.highscores = s;
      this.sortHighscores();
      return this.highscores;
    },

    // Get highest score
    getHighscore: function() {
      return _.max(this.highscores, "score");
    },

    // Set single highscore
    setHighscore: function(score, name) {
      if (this.isHighscore(score)) {
        this.sortHighscores();

        // Remove lowest one if needed
        if (this.highscores.length >= this.highscoreLimit) {
          this.highscores.shift();
        }

        // Add new score
        this.highscores.push({
          name: name,
          score: score
        });

        // Sort and set
        this.sortHighscores();
        this.setHighscores();
      }
    },

    // Sort highscores
    sortHighscores: function() {
      this.highscores = _.sortBy(this.highscores, "score");
    },

    // Is highscore.  Is the score higher than the lowest
    // recorded score
    isHighscore: function(score) {
      var min = _.min(this.highscores, "score").score;
      return (score > min || this.highscores.length < this.highscoreLimit);
    },

    // Check if score is highest score
    isHighestScore: function(score) {
      var max = _.max(this.highscores, "score").score || 0;
      return (score > max);
    },

    // Set highscores
    setHighscores: function() {
      window.localStorage.setItem("highscores", JSON.stringify(this.highscores));
    },

    // Reset highschores
    resetHighscores: function() {
      window.localStorage.removeItem("highscores");
    }
  });

  // Create app
  var p;
  p = new Pickle({
    el: "#pickle-jumper",
    debug: false
  });
})();

},{"./pickle-jumper/state-gameover.js":7,"./pickle-jumper/state-menu.js":8,"./pickle-jumper/state-play.js":9}],2:[function(require,module,exports){
/* global _:false, Phaser:false */

/**
 * Prefab (objects) boost for platforms
 */

(function() {
  "use strict";

  // Constructor for Boost
  var Boost = function(game, x, y) {
    // Call default sprite
    Phaser.Sprite.call(this, game, x, y, "game-sprites", "dill.png");

    // Size
    this.anchor.setTo(0.5, 0.5);
    this.scale.setTo((this.game.width / 9) / this.width);

    // Physics
    this.game.physics.arcade.enableBody(this);
    this.body.allowGravity = false;
    this.body.immovable = true;
  };

  // Extend from Sprite
  Boost.prototype = Object.create(Phaser.Sprite.prototype);
  Boost.prototype.constructor = Boost;

  // Add methods
  _.extend(Boost.prototype, {
    update: function() {

    }
  });

  // Export
  module.exports = Boost;
})();

},{}],3:[function(require,module,exports){
/* global _:false, Phaser:false */

/**
 * Prefab for Botulism, the bad dudes
 */

(function() {
  "use strict";

  // Constructor
  var Botulism = function(game, x, y) {
    // Call default sprite
    Phaser.Sprite.call(this, game, x, y, "game-sprites", "botchy.png");

    // Size
    this.anchor.setTo(0.5, 0.5);
    this.scale.setTo((this.game.width / 10) / this.width);

    // Configure
    this.hover = true;
    this.setHoverSpeed(100);
    this.hoverRange = 100;

    // Physics
    this.game.physics.arcade.enableBody(this);
    this.body.allowGravity = false;
    this.body.immovable = true;

    // Determine anchor x bounds
    this.paddingX = 10;
    this.resetPlacement(x, y);
  };

  // Extend from Sprite
  Botulism.prototype = Object.create(Phaser.Sprite.prototype);
  Botulism.prototype.constructor = Botulism;

  // Add methods
  _.extend(Botulism.prototype, {
    update: function() {
      // Do hover
      if (this.hover) {
        this.body.velocity.x = this.body.velocity.x || this.hoverSpeed;
        this.body.velocity.x = (this.x <= this.minX) ? this.hoverSpeed :
          (this.x >= this.maxX) ? -this.hoverSpeed : this.body.velocity.x;
      }
    },

    // Set hover speed.  Add a bit of variance
    setHoverSpeed: function(speed) {
      this.hoverSpeed = speed + this.game.rnd.integerInRange(-25, 25);
    },

    // Get anchor bounds.  This is relative to where the platform is
    getAnchorBoundsX: function() {
      this.minX = Math.max(this.x - this.hoverRange, this.paddingX + (this.width / 2));
      this.maxX = Math.min(this.x + this.hoverRange, this.game.width - (this.paddingX + (this.width / 2)));
      return [this.minX, this.maxX];
    },

    // Reset things
    resetPlacement: function(x, y) {
      this.reset(x, y);
      this.body.velocity.x = 0;
      this.getAnchorBoundsX();
    }
  });

  // Export
  module.exports = Botulism;
})();

},{}],4:[function(require,module,exports){
/* global _:false, Phaser:false */

/**
 * Prefab Coin type item
 */

(function() {
  "use strict";

  // Constructor for coin
  var Coin = function(game, x, y) {
    // Call default sprite
    Phaser.Sprite.call(this, game, x, y, "game-sprites", "magicdill.png");

    // Configure
    this.anchor.setTo(0.5, 0.5);
    this.scale.setTo((this.game.width / 20) / this.width);

    // Physics
    this.game.physics.arcade.enableBody(this);
    this.body.allowGravity = false;
    this.body.immovable = true;
  };

  // Extend from Sprite
  Coin.prototype = Object.create(Phaser.Sprite.prototype);
  Coin.prototype.constructor = Coin;

  // Add methods
  _.extend(Coin.prototype, {
    update: function() {

    }
  });

  // Export
  module.exports = Coin;
})();

},{}],5:[function(require,module,exports){
/* global _:false, Phaser:false */

/**
 * Prefab Hero/character
 */

(function() {
  "use strict";

  // Constructor
  var Hero = function(game, x, y) {
    // Call default sprite
    Phaser.Sprite.call(this, game, x, y, "pickle-sprites", "pickle-default.png");

    // Configure
    this.anchor.setTo(0.5);
    this.scale.setTo((this.game.width / 25) / this.width);
    this.game.physics.arcade.enableBody(this);

    // Track where the hero started and how much the distance
    // has changed from that point
    this.yOrig = this.y;
    this.yChange = 0;
  };

  // Extend from Sprite
  Hero.prototype = Object.create(Phaser.Sprite.prototype);
  Hero.prototype.constructor = Hero;

  // Add methods
  _.extend(Hero.prototype, {
    update: function() {
      // Track the maximum amount that the hero has travelled
      this.yChange = Math.max(this.yChange, Math.abs(this.y - this.yOrig));

      // Wrap around edges left/tight edges
      this.game.world.wrap(this, this.width / 2, false, true, false);
    },

    // Reset placement custom
    resetPlacement: function(x, y) {
      this.reset(x, y);
      this.yOrig = this.y;
      this.yChange = 0;
    }
  });

  // Export
  module.exports = Hero;
})();

},{}],6:[function(require,module,exports){
/* global _:false, Phaser:false */

/**
 * Prefab platform
 */

(function() {
  "use strict";

  // Constructor
  var Platform = function(game, x, y) {
    // Call default sprite
    Phaser.Sprite.call(this, game, x, y, "game-sprites", "dillybean.png");

    // Configure
    this.anchor.setTo(0.5, 0.5);
    this.scale.setTo((this.game.width / 5) / this.width);
    this.hover = false;
    this.setHoverSpeed(100);

    // Physics
    this.game.physics.arcade.enableBody(this);
    this.body.allowGravity = false;
    this.body.immovable = true;

    // Only allow for collission up
    this.body.checkCollision.down = false;
    this.body.checkCollision.left = false;
    this.body.checkCollision.right = false;

    // Determine anchor x bounds
    this.paddingX = 10;
    this.getAnchorBoundsX();
  };

  // Extend from Sprite
  Platform.prototype = Object.create(Phaser.Sprite.prototype);
  Platform.prototype.constructor = Platform;

  // Add methods
  _.extend(Platform.prototype, {
    update: function() {
      if (this.hover) {
        this.body.velocity.x = this.body.velocity.x || this.hoverSpeed;
        this.body.velocity.x = (this.x <= this.minX) ? this.hoverSpeed :
          (this.x >= this.maxX) ? -this.hoverSpeed : this.body.velocity.x;
      }
    },

    // Set hover speed.  Add a bit of variance
    setHoverSpeed: function(speed) {
      this.hoverSpeed = speed + this.game.rnd.integerInRange(-50, 50);
    },

    // Get anchor bounds
    getAnchorBoundsX: function() {
      this.minX = this.paddingX + (this.width / 2);
      this.maxX = this.game.width - (this.paddingX + (this.width / 2));
      return [this.minX, this.maxX];
    },

    // Reset things
    resetSettings: function() {
      this.reset(0, 0);
      this.body.velocity.x = 0;
      this.hover = false;
      this.getAnchorBoundsX();
    }
  });

  // Export
  module.exports = Platform;
})();

},{}],7:[function(require,module,exports){
/* global _:false, Phaser:false */

/**
 * Gameover state
 */

(function() {
  "use strict";

  // Constructor
  var Gameover = function() {
    Phaser.State.call(this);

    // Configure
    this.padding = 10;
  };

  // Extend from State
  Gameover.prototype = Object.create(Phaser.State.prototype);
  Gameover.prototype.constructor = Gameover;

  // Add methods
  _.extend(Gameover.prototype, Phaser.State.prototype, {
    // Preload
    preload: function() {
      // Load up game images
      this.game.load.atlas("gameover-sprites", "assets/gameover-sprites.png", "assets/gameover-sprites.json");
    },

    // Create
    create: function() {
      // Set background
      this.game.stage.backgroundColor = "#8cc63f";

      // Place title
      this.titleImage = this.game.add.sprite(this.game.width / 2, this.padding * 3, "gameover-sprites", "gameover.png");
      this.titleImage.anchor.setTo(0.5, 0);
      this.titleImage.scale.setTo((this.game.width - (this.padding * 8)) / this.titleImage.width);
      this.game.add.existing(this.titleImage);

      // Highscore list.  Can't seem to find a way to pass the score
      // via a state change.
      this.score = this.game.pickle.score;

      // Show score
      this.showScore();

      // Show input if new highscore, otherwise show list
      if (this.game.pickle.isHighscore(this.score)) {
        this.highscoreInput();
      }
      else {
        this.highscoreList();
      }

      // Place re-play
      this.replayImage = this.game.add.sprite(this.game.width - this.padding * 2,
        this.game.height - this.padding * 2, "gameover-sprites", "title-play.png");
      this.replayImage.anchor.setTo(1, 1);
      this.replayImage.scale.setTo((this.game.width * 0.25) / this.replayImage.width);
      this.game.add.existing(this.replayImage);

      // Add hover for mouse
      this.replayImage.inputEnabled = true;
      this.replayImage.events.onInputOver.add(function() {
        this.replayImage.originalTint = this.replayImage.tint;
        this.replayImage.tint = 0.5 * 0xFFFFFF;
      }, this);

      this.replayImage.events.onInputOut.add(function() {
        this.replayImage.tint = this.replayImage.originalTint;
      }, this);

      // Add interactions for starting
      this.replayImage.events.onInputDown.add(this.replay, this);

      // Input
      this.leftButton = this.game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
      this.rightButton = this.game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
      this.upButton = this.game.input.keyboard.addKey(Phaser.Keyboard.UP);
      this.downButton = this.game.input.keyboard.addKey(Phaser.Keyboard.DOWN);
      this.actionButton = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

      this.leftButton.onDown.add(function() {
        if (this.hInput) {
          this.moveCursor(-1);
        }
      }, this);

      this.rightButton.onDown.add(function() {
        if (this.hInput) {
          this.moveCursor(1);
        }
      }, this);

      this.upButton.onDown.add(function() {
        if (this.hInput) {
          this.moveLetter(1);
        }
      }, this);

      this.downButton.onDown.add(function() {
        if (this.hInput) {
          this.moveLetter(-1);
        }
      }, this);

      this.actionButton.onDown.add(function() {
        var saved;

        if (this.hInput) {
          saved = this.saveHighscore();
          if (saved) {
            this.highscoreList();
          }
        }
        else {
          this.replay();
        }
      }, this);
    },

    // Update
    update: function() {
    },

    // Shutdown, clean up on state change
    shutdown: function() {
      ["titleText", "replayText"].forEach(_.bind(function(item) {
        if (this[item] && this[item].destroy) {
          this[item].destroy();
          this[item] = null;
        }
      }, this));
    },

    // Handle replay
    replay: function() {
      this.game.state.start("menu");
    },

    // Show highscore
    showScore: function() {
      this.scoreGroup = this.game.add.group();

      // Place label
      this.yourScoreImage = this.game.add.sprite(
        this.game.width / 2 + (this.padding * 3),
        this.titleImage.height + (this.padding * 7.5), "gameover-sprites", "your-score.png");
      this.yourScoreImage.anchor.setTo(1, 0);
      this.yourScoreImage.scale.setTo(((this.game.width / 2) - (this.padding * 6)) / this.yourScoreImage.width);

      // Score
      this.scoreText = new Phaser.Text(
        this.game,
        this.game.width / 2 + (this.padding * 5),
        this.titleImage.height + (this.padding * 6),
        this.score.toLocaleString(), {
          font: "bold " + (this.game.world.height / 15) + "px Dosis",
          fill: "#39b54a",
          align: "left",
        });
      this.scoreText.anchor.setTo(0, 0);

      // Font loading thing
      _.delay(_.bind(function() {
        this.scoreGroup.add(this.yourScoreImage);
        this.scoreGroup.add(this.scoreText);
      }, this), 1000);
    },

    // Make highest score input
    highscoreInput: function() {
      this.hInput = true;
      this.hInputIndex = 0;
      this.hInputs = this.game.add.group();
      var y = this.game.world.height * 0.7;

      // First input
      var one = new Phaser.Text(
        this.game,
        this.game.world.width * 0.33333,
        y,
        "A", {
          font: "bold " + (this.game.world.height / 15) + "px Dosis",
          fill: "#FFFFFF",
          align: "center",
        });
      one.anchor.set(0.5);
      this.hInputs.add(one);

      // Second input
      var second = new Phaser.Text(
        this.game,
        this.game.world.width * 0.5,
        y,
        "A", {
          font: "bold " + (this.game.world.height / 15) + "px Dosis",
          fill: "#FFFFFF",
          align: "center",
        });
      second.anchor.set(0.5);
      this.hInputs.add(second);

      // Second input
      var third = new Phaser.Text(
        this.game,
        this.game.world.width * 0.66666,
        y,
        "A", {
          font: "bold " + (this.game.world.height / 15) + "px Dosis",
          fill: "#FFFFFF",
          align: "center",
        });
      third.anchor.set(0.5);
      this.hInputs.add(third);

      // Cursor
      this.hCursor = this.game.add.text(
        one.x,
        one.y - (this.game.world.height / 20),
        "_", {
          font: "bold " + (this.game.world.height / 5) + "px Arial",
          fill: "#FFFFFF",
          align: "center",
        });
      this.hCursor.anchor.set(0.5);

      // Handle inital cursor
      this.moveCursor(0);
    },

    // Move cursor
    moveCursor: function(amount) {
      var newIndex = this.hInputIndex + amount;
      this.hInputIndex = (newIndex < 0) ? this.hInputs.length - 1 :
        (newIndex >= this.hInputs.length) ? 0 : newIndex;
      var i = this.hInputs.getChildAt(this.hInputIndex);

      // Move cursor
      this.hCursor.x = i.x;
      this.hInputs.forEach(function(input) {
        input.fill = "#FFFFFF";
      });

      i.fill = "#FFDDBB";

      // TODO: Highlight input.
    },

    // Move letter
    moveLetter: function(amount) {
      var i = this.hInputs.getChildAt(this.hInputIndex);
      var t = i.text;
      var n = (t === "A" && amount === -1) ? "Z" :
        (t === "Z" && amount === 1) ? "A" :
        String.fromCharCode(t.charCodeAt(0) + amount);

      i.text = n;
    },

    // Save highscore
    saveHighscore: function() {
      // Get name
      var name = "";
      this.hInputs.forEach(function(input) {
        name = name + input.text;
      });

      // Don't allow AAA
      if (name === "AAA") {
        return false;
      }

      // Save highscore
      this.game.pickle.setHighscore(this.score, name);

      // Remove input
      this.hInput = false;
      this.hInputs.destroy();
      this.hCursor.destroy();

      return true;
    },

    // Highscore list
    highscoreList: function() {
      this.highscoreLimit = 3;
      this.highscoreListGroup = this.game.add.group();
      this.game.pickle.sortHighscores();
      var fontSize = this.game.world.height / 17.5;

      if (this.game.pickle.highscores.length > 0) {
        _.each(this.game.pickle.highscores.reverse().slice(0, 3), _.bind(function(h, i) {
          // Name
          var name = new Phaser.Text(
            this.game,
            this.game.width / 2 + (this.padding * 3),
            (this.game.height * 0.6) + ((fontSize + this.padding) * i),
            h.name, {
              font: "bold " + (this.game.world.height / 15) + "px Dosis",
              fill: "#b8f4bc",
              align: "right",
            });
          name.anchor.setTo(1, 0);

          // Score
          var score = new Phaser.Text(
            this.game,
            this.game.width / 2 + (this.padding * 5),
            (this.game.height * 0.6) + ((fontSize + this.padding) * i),
            h.score.toLocaleString(), {
              font: "bold " + (this.game.world.height / 15) + "px Dosis",
              fill: "#39b54a",
              align: "left",
            });
          score.anchor.setTo(0, 0);

          // Font loading thing
          _.delay(_.bind(function() {
            this.highscoreListGroup.add(name);
            this.highscoreListGroup.add(score);
          }, this), 1000);
        }, this));
      }
    }
  });

  // Export
  module.exports = Gameover;
})();

},{}],8:[function(require,module,exports){
/* global _:false, Phaser:false */

/**
 * Menu state
 */

(function() {
  "use strict";

  // Constructor
  var Menu = function() {
    Phaser.State.call(this);

    // Config
    this.padding = 20;
  };

  // Extend from State
  Menu.prototype = Object.create(Phaser.State.prototype);
  Menu.prototype.constructor = Menu;

  // Add methods
  _.extend(Menu.prototype, Phaser.State.prototype, {
    // Preload
    preload: function() {
      // Load up game images
      this.game.load.atlas("title-sprites", "assets/title-sprites.png", "assets/title-sprites.json");
    },

    // Create
    create: function() {
      // Set background
      this.game.stage.backgroundColor = "#b8f4bc";

      // Place title
      this.titleImage = this.game.add.sprite(this.game.width / 2, this.padding * 3, "title-sprites", "title.png");
      this.titleImage.anchor.setTo(0.5, 0);
      this.titleImage.scale.setTo((this.game.width - (this.padding * 2)) / this.titleImage.width);
      this.game.add.existing(this.titleImage);

      // Place play
      this.playImage = this.game.add.sprite(this.game.width / 2, this.game.height - this.padding * 3, "title-sprites", "title-play.png");
      this.playImage.anchor.setTo(0.4, 1);
      this.playImage.scale.setTo((this.game.width * 0.75) / this.titleImage.width);
      this.game.add.existing(this.playImage);

      // Add hover for mouse
      this.playImage.inputEnabled = true;
      this.playImage.events.onInputOver.add(function() {
        this.playImage.originalTint = this.playImage.tint;
        this.playImage.tint = 0.5 * 0xFFFFFF;
      }, this);

      this.playImage.events.onInputOut.add(function() {
        this.playImage.tint = this.playImage.originalTint;
      }, this);

      // Add mouse interaction
      this.playImage.events.onInputDown.add(this.go, this);

      // Add keyboard interaction
      this.actionButton = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
      this.actionButton.onDown.add(function() {
        this.go();
      }, this);
    },

    // Start playing
    go: function() {
      this.game.state.start("play");
    },

    // Update
    update: function() {
    }
  });

  // Export
  module.exports = Menu;
})();

},{}],9:[function(require,module,exports){
/* global _:false, Phaser:false */

/**
 * Play state
 */

(function() {
  "use strict";

  // Dependencies
  var prefabs = {
    Boost: require("./prefab-boost.js"),
    Botulism: require("./prefab-botulism.js"),
    Coin: require("./prefab-coin.js"),
    Hero: require("./prefab-hero.js"),
    Platform: require("./prefab-platform.js")
  };

  // Constructor
  var Play = function() {
    Phaser.State.call(this);
  };

  // Extend from State
  Play.prototype = Object.create(Phaser.State.prototype);
  Play.prototype.constructor = Play;

  // Add methods
  _.extend(Play.prototype, Phaser.State.prototype, {
    // Preload
    preload: function() {
      // Load up game images
      this.game.load.atlas("game-sprites", "assets/game-sprites.png", "assets/game-sprites.json");
      this.game.load.atlas("pickle-sprites", "assets/pickle-sprites.png", "assets/pickle-sprites.json");
      this.game.load.atlas("carrot-sprites", "assets/carrot-sprites.png", "assets/carrot-sprites.json");
    },

    // Create
    create: function() {
      // Set background
      this.game.stage.backgroundColor = "#b8f4bc";

      // Set initial difficulty
      this.setDifficulty();

      // Scoring
      this.scoreCoin = 100;
      this.scoreBoost = 500;
      this.scoreBot = 1000;

      // Spacing
      this.padding = 10;

      // Initialize tracking variables
      this.resetViewTracking();

      // Scaling
      this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
      this.game.scale.maxWidth = this.game.width;
      this.game.scale.maxHeight = this.game.height;
      this.game.scale.pageAlignHorizontally = true;
      this.game.scale.pageAlignVertically = true;

      // Physics
      this.game.physics.startSystem(Phaser.Physics.ARCADE);
      this.game.physics.arcade.gravity.y = 1000;

      // Determine where first platform and hero will be
      this.startY = this.game.height - 5;
      this.hero = new prefabs.Hero(this.game, 0, 0);
      this.hero.resetPlacement(this.game.width * 0.5, this.startY - this.hero.height);
      this.game.add.existing(this.hero);

      // Containers
      this.coins = this.game.add.group();
      this.boosts = this.game.add.group();
      this.bots = this.game.add.group();

      // Platforms
      this.addPlatforms();

      // Initialize score
      this.resetScore();
      this.updateScore();

      // Cursors, input
      this.cursors = this.game.input.keyboard.createCursorKeys();
      this.actionButton = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    },

    // Update
    update: function() {
      // This is where the main magic happens
      // the y offset and the height of the world are adjusted
      // to match the highest point the hero has reached
      this.world.setBounds(0, -this.hero.yChange, this.game.world.width,
        this.game.height + this.hero.yChange);

      // The built in camera follow methods won't work for our needs
      // this is a custom follow style that will not ever move down, it only moves up
      this.cameraYMin = Math.min(this.cameraYMin, this.hero.y - this.game.height / 2);
      this.camera.y = this.cameraYMin;

      // If hero falls below camera
      if (this.hero.y > this.cameraYMin + this.game.height + 200) {
        this.gameOver();
      }

      // Move hero
      this.hero.body.velocity.x =
        (this.cursors.left.isDown) ? -(this.game.physics.arcade.gravity.y / 5) :
        (this.cursors.right.isDown) ? (this.game.physics.arcade.gravity.y / 5) : 0;

      // Platform collisions
      this.game.physics.arcade.collide(this.hero, this.platforms, this.updateHeroPlatform, null, this);
      this.game.physics.arcade.collide(this.hero, this.base, this.updateHeroPlatform, null, this);

      // Coin collisions
      this.game.physics.arcade.overlap(this.hero, this.coins, function(hero, coin) {
        coin.kill();
        this.updateScore(this.scoreCoin);
      }, null, this);

      // Boosts collisions
      this.game.physics.arcade.overlap(this.hero, this.boosts, function(hero, boost) {
        boost.kill();
        this.updateScore(this.scoreBoost);
        hero.body.velocity.y = this.game.physics.arcade.gravity.y * -1 * 1.5;
      }, null, this);

      // Botulism collisions.  If herok jumps on top, then kill, otherwise die
      this.game.physics.arcade.collide(this.hero, this.bots, function(hero, bot) {
        if (hero.body.touching.down) {
          bot.kill();
          this.updateScore(this.scoreBot);
          hero.body.velocity.y = this.game.physics.arcade.gravity.y * -1 * 0.5;
        }
        else {
          this.gameOver();
        }
      }, null, this);

      // For each platform, find out which is the highest
      // if one goes below the camera view, then create a new
      // one at a distance from the highest one
      // these are pooled so they are very performant.
      this.platforms.forEachAlive(function(p) {
        var platform;
        this.platformYMin = Math.min(this.platformYMin, p.y);

        // Check if this one is of the screen
        if (p.y > this.camera.y + this.game.height) {
          p.kill();
          platform = this.platforms.getFirstDead();
          this.placePlatform(this.platforms.getFirstDead(), this.platforms.getTop());
        }
      }, this);

      // Remove any fluff
      ["coins", "boosts", "bots"].forEach(_.bind(function(pool) {
        this[pool].forEachAlive(function(p) {
          // Check if this one is of the screen
          if (p.y > this.camera.y + this.game.height) {
            p.kill();
          }
        }, this);
      }, this));

      // Update score
      this.updateScore();

      // Update difficult
      this.setDifficulty();
    },

    // Platform collision
    updateHeroPlatform: function(hero) {
      hero.body.velocity.y = this.game.physics.arcade.gravity.y * -1 * 0.7;
    },

    // Shutdown
    shutdown: function() {
      // Reset everything, or the world will be messed up
      this.world.setBounds(0, 0, this.game.width, this.game.height);
      this.cursor = null;
      this.resetViewTracking();
      this.resetScore();

      ["hero", "platforms", "coins", "boosts", "scoreGroup"].forEach(_.bind(function(item) {
        this[item].destroy();
        this[item] = null;
      }, this));
    },

    // Game over
    gameOver: function() {
      // Can't seem to find a way to pass the score
      // via a state change.
      this.game.pickle.score = this.score;
      this.game.state.start("gameover");
    },

    // Add platform pool and create initial one
    addPlatforms: function() {
      this.platforms = this.game.add.group();

      // Add first platform.  TODO: Change to its own prefab, sprite
      this.base = new prefabs.Platform(this.game, this.game.width * 0.5, this.startY, this.game.width * 2);
      this.game.add.existing(this.base);

      // Add some base platforms
      var previous;
      _.each(_.range(20), _.bind(function(i) {
        var p = new prefabs.Platform(this.game, 0, 0);
        this.placePlatform(p, previous, this.world.height - this.platformSpaceY - this.platformSpaceY * i);
        this.platforms.add(p);
        previous = p;
      }, this));
    },

    // Place platform
    placePlatform: function(platform, previousPlatform, overrideY) {
      platform.resetSettings();
      var y = overrideY || this.platformYMin - this.platformSpaceY;
      var minX = platform.minX;
      var maxX = platform.maxX;

      // Determine x based on previousPlatform
      var x = this.rnd.integerInRange(minX, maxX);
      if (previousPlatform) {
        x = this.rnd.integerInRange(previousPlatform.x - this.platformGapMax, previousPlatform.x + this.platformGapMax);

        // Some logic to try to wrap
        x = (x < 0) ? Math.min(maxX, this.world.width + x) : Math.max(x, minX);
        x = (x > this.world.width) ? Math.max(minX, x - this.world.width) : Math.min(x, maxX);
      }

      // Place
      platform.reset(x, y);

      // Add some fluff
      this.fluffPlatform(platform);
    },

    // Add possible fluff to platform
    fluffPlatform: function(platform) {
      var x = platform.x;
      var y = platform.y - platform.height / 2 - 30;

      // Add fluff
      if (Math.random() <= this.hoverChance) {
        platform.hover = true;
      }
      else if (Math.random() <= this.coinChance) {
        this.addWithPool(this.coins, "Coin", x, y);
      }
      else if (Math.random() <= this.boostChance) {
        this.addWithPool(this.boosts, "Boost", x, y);
      }
      else if (Math.random() <= this.botChance) {
        this.addWithPool(this.bots, "Botulism", x, y);
      }
    },

    // Generic add with pooling functionallity
    addWithPool: function(pool, prefab, x, y) {
      var o = pool.getFirstDead();
      o = o || new prefabs[prefab](this.game, x, y);

      // Use custom reset if available
      if (o.resetPlacement) {
        o.resetPlacement(x, y);
      }
      else {
        o.reset(x, y);
      }

      pool.add(o);
    },

    // Update score.  Score is the score without how far they have gone up.
    updateScore: function(addition) {
      addition = addition || 0;
      this.scoreUp = (-this.cameraYMin >= 9999999) ? 0 :
        Math.min(Math.max(0, -this.cameraYMin), 9999999 - 1);
      this.scoreCollect = (this.scoreCollect || 0) + addition;
      this.score = Math.round(this.scoreUp + this.scoreCollect);

      // Score text
      if (!this.scoreGroup) {
        this.scoreGroup = this.game.add.group();

        // Score label
        this.scoreLabelImage = this.game.add.sprite(
          this.padding,
          this.padding * 0.85, "game-sprites", "your-score.png");
        this.scoreLabelImage.anchor.setTo(0, 0);
        this.scoreLabelImage.scale.setTo((this.game.width / 6) / this.scoreLabelImage.width);
        this.scoreGroup.add(this.scoreLabelImage);

        // Score text
        this.scoreText = this.game.add.text(
          this.scoreLabelImage.width + (this.padding * 2),
          this.padding * 0.25,
          this.score.toLocaleString(), {
            font: "bold " + (this.game.world.height / 40) + "px Dosis",
            fill: "#39b54a",
            align: "left",
          });
        this.scoreText.anchor.setTo(0, 0);
        this.scoreGroup.add(this.scoreText);

        this.scoreGroup.fixedToCamera = true;
        this.scoreGroup.cameraOffset.setTo(this.padding, this.padding);
      }
      else {
        this.scoreText.text = this.score.toLocaleString();
      }
    },

    // Reset score
    resetScore: function() {
      this.scoreUp = 0;
      this.scoreCollect = 0;
      this.score = 0;
    },

    // Reset view tracking
    resetViewTracking: function() {
      // Camera and platform tracking vars
      this.cameraYMin = 9999999;
      this.platformYMin = 9999999;
    },

    // General touching
    isTouching: function(body) {
      if (body && body.touch) {
        return (body.touching.up || body.touching.down ||
          body.touching.left || body.touching.right);
      }

      return false;
    },

    // Determine difficulty
    setDifficulty: function() {
      // Initial state
      this.platformSpaceY = 110;
      this.platformGapMax = 200;
      this.hoverChance = 0.1;
      this.coinChance = 0.3;
      this.boostChance = 0.3;
      this.botChance = 0.0;

      // Initila physics time
      //this.game.time.slowMotion = 1;

      // Default
      if (this.cameraYMin > -this.game.height) {
        return true;
      }

      // First level
      else if (this.cameraYMin > -10000) {
        this.hoverChance = 0.2;
        this.coinChance = 0.3;
        this.boostChance = 0.3;
        this.botChance = 0.1;
      }

      // Second level
      else if (this.cameraYMin > -20000) {
        this.hoverChance = 0.3;
        this.coinChance = 0.3;
        this.boostChance = 0.4;
        this.botChance = 0.2;
        this.game.stage.backgroundColor = "#8CEE94";
      }

      // Third level
      else if (this.cameraYMin > -30000) {
        this.hoverChance = 0.4;
        this.coinChance = 0.2;
        this.boostChance = 0.4;
        this.botChance = 0.3;
        this.game.stage.backgroundColor = "#5FE76B";
      }
    }
  });

  // Export
  module.exports = Play;
})();

},{"./prefab-boost.js":2,"./prefab-botulism.js":3,"./prefab-coin.js":4,"./prefab-hero.js":5,"./prefab-platform.js":6}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy96em9sby9Db2RlL3BlcnNvbmFsL3BpY2tsZS1qdW1wZXIvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIi9Vc2Vycy96em9sby9Db2RlL3BlcnNvbmFsL3BpY2tsZS1qdW1wZXIvanMvZmFrZV85NWNjNTVhMi5qcyIsIi9Vc2Vycy96em9sby9Db2RlL3BlcnNvbmFsL3BpY2tsZS1qdW1wZXIvanMvcGlja2xlLWp1bXBlci9wcmVmYWItYm9vc3QuanMiLCIvVXNlcnMvenpvbG8vQ29kZS9wZXJzb25hbC9waWNrbGUtanVtcGVyL2pzL3BpY2tsZS1qdW1wZXIvcHJlZmFiLWJvdHVsaXNtLmpzIiwiL1VzZXJzL3p6b2xvL0NvZGUvcGVyc29uYWwvcGlja2xlLWp1bXBlci9qcy9waWNrbGUtanVtcGVyL3ByZWZhYi1jb2luLmpzIiwiL1VzZXJzL3p6b2xvL0NvZGUvcGVyc29uYWwvcGlja2xlLWp1bXBlci9qcy9waWNrbGUtanVtcGVyL3ByZWZhYi1oZXJvLmpzIiwiL1VzZXJzL3p6b2xvL0NvZGUvcGVyc29uYWwvcGlja2xlLWp1bXBlci9qcy9waWNrbGUtanVtcGVyL3ByZWZhYi1wbGF0Zm9ybS5qcyIsIi9Vc2Vycy96em9sby9Db2RlL3BlcnNvbmFsL3BpY2tsZS1qdW1wZXIvanMvcGlja2xlLWp1bXBlci9zdGF0ZS1nYW1lb3Zlci5qcyIsIi9Vc2Vycy96em9sby9Db2RlL3BlcnNvbmFsL3BpY2tsZS1qdW1wZXIvanMvcGlja2xlLWp1bXBlci9zdGF0ZS1tZW51LmpzIiwiL1VzZXJzL3p6b2xvL0NvZGUvcGVyc29uYWwvcGlja2xlLWp1bXBlci9qcy9waWNrbGUtanVtcGVyL3N0YXRlLXBsYXkuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM1VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyogZ2xvYmFsIF86ZmFsc2UsICQ6ZmFsc2UsIFBoYXNlcjpmYWxzZSAqL1xuXG4vKipcbiAqIE1haW4gSlMgZm9yIFBpY2tsZSBKdW1wZXJcbiAqL1xuXG4oZnVuY3Rpb24oKSB7XG4gIFwidXNlIHN0cmljdFwiO1xuXG4gIC8vIERlcGVuZGVuY2llc1xuICB2YXIgc3RhdGVzID0ge1xuICAgIEdhbWVvdmVyOiByZXF1aXJlKFwiLi9waWNrbGUtanVtcGVyL3N0YXRlLWdhbWVvdmVyLmpzXCIpLFxuICAgIFBsYXk6IHJlcXVpcmUoXCIuL3BpY2tsZS1qdW1wZXIvc3RhdGUtcGxheS5qc1wiKSxcbiAgICBNZW51OiByZXF1aXJlKFwiLi9waWNrbGUtanVtcGVyL3N0YXRlLW1lbnUuanNcIiksXG4gIH07XG5cbiAgLy8gQ29uc3RydWN0b3JlIGZvciBQaWNrbGVcbiAgdmFyIFBpY2tsZSA9IHdpbmRvdy5QaWNrbGUgPSBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcbiAgICB0aGlzLmVsID0gdGhpcy5vcHRpb25zLmVsO1xuICAgIHRoaXMuJGVsID0gJCh0aGlzLm9wdGlvbnMuZWwpO1xuICAgIHRoaXMuJCA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuICQob3B0aW9ucy5lbCkuZmluZDtcbiAgICB9O1xuXG4gICAgdGhpcy53aWR0aCA9IHRoaXMuJGVsLndpZHRoKCk7XG4gICAgdGhpcy5oZWlnaHQgPSAkKHdpbmRvdykuaGVpZ2h0KCk7XG5cbiAgICAvLyBTdGFydFxuICAgIHRoaXMuc3RhcnQoKTtcbiAgfTtcblxuICAvLyBBZGQgcHJvcGVydGllc1xuICBfLmV4dGVuZChQaWNrbGUucHJvdG90eXBlLCB7XG4gICAgLy8gU3RhcnQgZXZlcnl0aGluZ1xuICAgIHN0YXJ0OiBmdW5jdGlvbigpIHtcbiAgICAgIC8vIENyZWF0ZSBQaGFzZXIgZ2FtZVxuICAgICAgdGhpcy5nYW1lID0gbmV3IFBoYXNlci5HYW1lKFxuICAgICAgICB0aGlzLndpZHRoLFxuICAgICAgICB0aGlzLmhlaWdodCxcbiAgICAgICAgUGhhc2VyLkFVVE8sXG4gICAgICAgIHRoaXMuZWwucmVwbGFjZShcIiNcIiwgXCJcIikpO1xuXG4gICAgICAvLyBBZGQgcmVmZXJlbmNlIHRvIGdhbWUsIHNpbmNlIG1vc3QgcGFydHMgaGF2ZSB0aGlzIHJlZmVyZW5jZVxuICAgICAgLy8gYWxyZWFkeVxuICAgICAgdGhpcy5nYW1lLnBpY2tsZSA9IHRoaXM7XG5cbiAgICAgIC8vIFJlZ2lzdGVyIHN0YXRlc1xuICAgICAgdGhpcy5nYW1lLnN0YXRlLmFkZChcIm1lbnVcIiwgc3RhdGVzLk1lbnUpO1xuICAgICAgdGhpcy5nYW1lLnN0YXRlLmFkZChcInBsYXlcIiwgc3RhdGVzLlBsYXkpO1xuICAgICAgdGhpcy5nYW1lLnN0YXRlLmFkZChcImdhbWVvdmVyXCIsIHN0YXRlcy5HYW1lb3Zlcik7XG5cbiAgICAgIC8vIEhpZ2hzY29yZVxuICAgICAgdGhpcy5oaWdoc2NvcmVMaW1pdCA9IDEwO1xuICAgICAgdGhpcy5nZXRIaWdoc2NvcmVzKCk7XG5cbiAgICAgIC8vIFN0YXJ0IHdpdGggbWVudVxuICAgICAgdGhpcy5nYW1lLnN0YXRlLnN0YXJ0KFwibWVudVwiKTtcblxuICAgICAgLy8gRGVidWdcbiAgICAgIGlmICh0aGlzLm9wdGlvbnMuZGVidWcgJiYgdGhpcy5nYW1lLmNhbWVyYSkge1xuICAgICAgICB0aGlzLmdhbWUuZGVidWcuY2FtZXJhSW5mbyh0aGlzLmdhbWUuY2FtZXJhLCAxMCwgMTApO1xuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5vcHRpb25zLmRlYnVnKSB7XG4gICAgICAgIHRoaXMucmVzZXRIaWdoc2NvcmVzKCk7XG4gICAgICAgIHRoaXMuZ2V0SGlnaHNjb3JlcygpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICAvLyBHZXQgaGlnaCBzY29yZXNcbiAgICBnZXRIaWdoc2NvcmVzOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBzID0gd2luZG93LmxvY2FsU3RvcmFnZS5nZXRJdGVtKFwiaGlnaHNjb3Jlc1wiKTtcbiAgICAgIHMgPSAocykgPyBKU09OLnBhcnNlKHMpIDogW107XG4gICAgICB0aGlzLmhpZ2hzY29yZXMgPSBzO1xuICAgICAgdGhpcy5zb3J0SGlnaHNjb3JlcygpO1xuICAgICAgcmV0dXJuIHRoaXMuaGlnaHNjb3JlcztcbiAgICB9LFxuXG4gICAgLy8gR2V0IGhpZ2hlc3Qgc2NvcmVcbiAgICBnZXRIaWdoc2NvcmU6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIF8ubWF4KHRoaXMuaGlnaHNjb3JlcywgXCJzY29yZVwiKTtcbiAgICB9LFxuXG4gICAgLy8gU2V0IHNpbmdsZSBoaWdoc2NvcmVcbiAgICBzZXRIaWdoc2NvcmU6IGZ1bmN0aW9uKHNjb3JlLCBuYW1lKSB7XG4gICAgICBpZiAodGhpcy5pc0hpZ2hzY29yZShzY29yZSkpIHtcbiAgICAgICAgdGhpcy5zb3J0SGlnaHNjb3JlcygpO1xuXG4gICAgICAgIC8vIFJlbW92ZSBsb3dlc3Qgb25lIGlmIG5lZWRlZFxuICAgICAgICBpZiAodGhpcy5oaWdoc2NvcmVzLmxlbmd0aCA+PSB0aGlzLmhpZ2hzY29yZUxpbWl0KSB7XG4gICAgICAgICAgdGhpcy5oaWdoc2NvcmVzLnNoaWZ0KCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBBZGQgbmV3IHNjb3JlXG4gICAgICAgIHRoaXMuaGlnaHNjb3Jlcy5wdXNoKHtcbiAgICAgICAgICBuYW1lOiBuYW1lLFxuICAgICAgICAgIHNjb3JlOiBzY29yZVxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBTb3J0IGFuZCBzZXRcbiAgICAgICAgdGhpcy5zb3J0SGlnaHNjb3JlcygpO1xuICAgICAgICB0aGlzLnNldEhpZ2hzY29yZXMoKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLy8gU29ydCBoaWdoc2NvcmVzXG4gICAgc29ydEhpZ2hzY29yZXM6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5oaWdoc2NvcmVzID0gXy5zb3J0QnkodGhpcy5oaWdoc2NvcmVzLCBcInNjb3JlXCIpO1xuICAgIH0sXG5cbiAgICAvLyBJcyBoaWdoc2NvcmUuICBJcyB0aGUgc2NvcmUgaGlnaGVyIHRoYW4gdGhlIGxvd2VzdFxuICAgIC8vIHJlY29yZGVkIHNjb3JlXG4gICAgaXNIaWdoc2NvcmU6IGZ1bmN0aW9uKHNjb3JlKSB7XG4gICAgICB2YXIgbWluID0gXy5taW4odGhpcy5oaWdoc2NvcmVzLCBcInNjb3JlXCIpLnNjb3JlO1xuICAgICAgcmV0dXJuIChzY29yZSA+IG1pbiB8fCB0aGlzLmhpZ2hzY29yZXMubGVuZ3RoIDwgdGhpcy5oaWdoc2NvcmVMaW1pdCk7XG4gICAgfSxcblxuICAgIC8vIENoZWNrIGlmIHNjb3JlIGlzIGhpZ2hlc3Qgc2NvcmVcbiAgICBpc0hpZ2hlc3RTY29yZTogZnVuY3Rpb24oc2NvcmUpIHtcbiAgICAgIHZhciBtYXggPSBfLm1heCh0aGlzLmhpZ2hzY29yZXMsIFwic2NvcmVcIikuc2NvcmUgfHwgMDtcbiAgICAgIHJldHVybiAoc2NvcmUgPiBtYXgpO1xuICAgIH0sXG5cbiAgICAvLyBTZXQgaGlnaHNjb3Jlc1xuICAgIHNldEhpZ2hzY29yZXM6IGZ1bmN0aW9uKCkge1xuICAgICAgd2luZG93LmxvY2FsU3RvcmFnZS5zZXRJdGVtKFwiaGlnaHNjb3Jlc1wiLCBKU09OLnN0cmluZ2lmeSh0aGlzLmhpZ2hzY29yZXMpKTtcbiAgICB9LFxuXG4gICAgLy8gUmVzZXQgaGlnaHNjaG9yZXNcbiAgICByZXNldEhpZ2hzY29yZXM6IGZ1bmN0aW9uKCkge1xuICAgICAgd2luZG93LmxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKFwiaGlnaHNjb3Jlc1wiKTtcbiAgICB9XG4gIH0pO1xuXG4gIC8vIENyZWF0ZSBhcHBcbiAgdmFyIHA7XG4gIHAgPSBuZXcgUGlja2xlKHtcbiAgICBlbDogXCIjcGlja2xlLWp1bXBlclwiLFxuICAgIGRlYnVnOiBmYWxzZVxuICB9KTtcbn0pKCk7XG4iLCIvKiBnbG9iYWwgXzpmYWxzZSwgUGhhc2VyOmZhbHNlICovXG5cbi8qKlxuICogUHJlZmFiIChvYmplY3RzKSBib29zdCBmb3IgcGxhdGZvcm1zXG4gKi9cblxuKGZ1bmN0aW9uKCkge1xuICBcInVzZSBzdHJpY3RcIjtcblxuICAvLyBDb25zdHJ1Y3RvciBmb3IgQm9vc3RcbiAgdmFyIEJvb3N0ID0gZnVuY3Rpb24oZ2FtZSwgeCwgeSkge1xuICAgIC8vIENhbGwgZGVmYXVsdCBzcHJpdGVcbiAgICBQaGFzZXIuU3ByaXRlLmNhbGwodGhpcywgZ2FtZSwgeCwgeSwgXCJnYW1lLXNwcml0ZXNcIiwgXCJkaWxsLnBuZ1wiKTtcblxuICAgIC8vIFNpemVcbiAgICB0aGlzLmFuY2hvci5zZXRUbygwLjUsIDAuNSk7XG4gICAgdGhpcy5zY2FsZS5zZXRUbygodGhpcy5nYW1lLndpZHRoIC8gOSkgLyB0aGlzLndpZHRoKTtcblxuICAgIC8vIFBoeXNpY3NcbiAgICB0aGlzLmdhbWUucGh5c2ljcy5hcmNhZGUuZW5hYmxlQm9keSh0aGlzKTtcbiAgICB0aGlzLmJvZHkuYWxsb3dHcmF2aXR5ID0gZmFsc2U7XG4gICAgdGhpcy5ib2R5LmltbW92YWJsZSA9IHRydWU7XG4gIH07XG5cbiAgLy8gRXh0ZW5kIGZyb20gU3ByaXRlXG4gIEJvb3N0LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUGhhc2VyLlNwcml0ZS5wcm90b3R5cGUpO1xuICBCb29zdC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBCb29zdDtcblxuICAvLyBBZGQgbWV0aG9kc1xuICBfLmV4dGVuZChCb29zdC5wcm90b3R5cGUsIHtcbiAgICB1cGRhdGU6IGZ1bmN0aW9uKCkge1xuXG4gICAgfVxuICB9KTtcblxuICAvLyBFeHBvcnRcbiAgbW9kdWxlLmV4cG9ydHMgPSBCb29zdDtcbn0pKCk7XG4iLCIvKiBnbG9iYWwgXzpmYWxzZSwgUGhhc2VyOmZhbHNlICovXG5cbi8qKlxuICogUHJlZmFiIGZvciBCb3R1bGlzbSwgdGhlIGJhZCBkdWRlc1xuICovXG5cbihmdW5jdGlvbigpIHtcbiAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgLy8gQ29uc3RydWN0b3JcbiAgdmFyIEJvdHVsaXNtID0gZnVuY3Rpb24oZ2FtZSwgeCwgeSkge1xuICAgIC8vIENhbGwgZGVmYXVsdCBzcHJpdGVcbiAgICBQaGFzZXIuU3ByaXRlLmNhbGwodGhpcywgZ2FtZSwgeCwgeSwgXCJnYW1lLXNwcml0ZXNcIiwgXCJib3RjaHkucG5nXCIpO1xuXG4gICAgLy8gU2l6ZVxuICAgIHRoaXMuYW5jaG9yLnNldFRvKDAuNSwgMC41KTtcbiAgICB0aGlzLnNjYWxlLnNldFRvKCh0aGlzLmdhbWUud2lkdGggLyAxMCkgLyB0aGlzLndpZHRoKTtcblxuICAgIC8vIENvbmZpZ3VyZVxuICAgIHRoaXMuaG92ZXIgPSB0cnVlO1xuICAgIHRoaXMuc2V0SG92ZXJTcGVlZCgxMDApO1xuICAgIHRoaXMuaG92ZXJSYW5nZSA9IDEwMDtcblxuICAgIC8vIFBoeXNpY3NcbiAgICB0aGlzLmdhbWUucGh5c2ljcy5hcmNhZGUuZW5hYmxlQm9keSh0aGlzKTtcbiAgICB0aGlzLmJvZHkuYWxsb3dHcmF2aXR5ID0gZmFsc2U7XG4gICAgdGhpcy5ib2R5LmltbW92YWJsZSA9IHRydWU7XG5cbiAgICAvLyBEZXRlcm1pbmUgYW5jaG9yIHggYm91bmRzXG4gICAgdGhpcy5wYWRkaW5nWCA9IDEwO1xuICAgIHRoaXMucmVzZXRQbGFjZW1lbnQoeCwgeSk7XG4gIH07XG5cbiAgLy8gRXh0ZW5kIGZyb20gU3ByaXRlXG4gIEJvdHVsaXNtLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUGhhc2VyLlNwcml0ZS5wcm90b3R5cGUpO1xuICBCb3R1bGlzbS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBCb3R1bGlzbTtcblxuICAvLyBBZGQgbWV0aG9kc1xuICBfLmV4dGVuZChCb3R1bGlzbS5wcm90b3R5cGUsIHtcbiAgICB1cGRhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgLy8gRG8gaG92ZXJcbiAgICAgIGlmICh0aGlzLmhvdmVyKSB7XG4gICAgICAgIHRoaXMuYm9keS52ZWxvY2l0eS54ID0gdGhpcy5ib2R5LnZlbG9jaXR5LnggfHwgdGhpcy5ob3ZlclNwZWVkO1xuICAgICAgICB0aGlzLmJvZHkudmVsb2NpdHkueCA9ICh0aGlzLnggPD0gdGhpcy5taW5YKSA/IHRoaXMuaG92ZXJTcGVlZCA6XG4gICAgICAgICAgKHRoaXMueCA+PSB0aGlzLm1heFgpID8gLXRoaXMuaG92ZXJTcGVlZCA6IHRoaXMuYm9keS52ZWxvY2l0eS54O1xuICAgICAgfVxuICAgIH0sXG5cbiAgICAvLyBTZXQgaG92ZXIgc3BlZWQuICBBZGQgYSBiaXQgb2YgdmFyaWFuY2VcbiAgICBzZXRIb3ZlclNwZWVkOiBmdW5jdGlvbihzcGVlZCkge1xuICAgICAgdGhpcy5ob3ZlclNwZWVkID0gc3BlZWQgKyB0aGlzLmdhbWUucm5kLmludGVnZXJJblJhbmdlKC0yNSwgMjUpO1xuICAgIH0sXG5cbiAgICAvLyBHZXQgYW5jaG9yIGJvdW5kcy4gIFRoaXMgaXMgcmVsYXRpdmUgdG8gd2hlcmUgdGhlIHBsYXRmb3JtIGlzXG4gICAgZ2V0QW5jaG9yQm91bmRzWDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLm1pblggPSBNYXRoLm1heCh0aGlzLnggLSB0aGlzLmhvdmVyUmFuZ2UsIHRoaXMucGFkZGluZ1ggKyAodGhpcy53aWR0aCAvIDIpKTtcbiAgICAgIHRoaXMubWF4WCA9IE1hdGgubWluKHRoaXMueCArIHRoaXMuaG92ZXJSYW5nZSwgdGhpcy5nYW1lLndpZHRoIC0gKHRoaXMucGFkZGluZ1ggKyAodGhpcy53aWR0aCAvIDIpKSk7XG4gICAgICByZXR1cm4gW3RoaXMubWluWCwgdGhpcy5tYXhYXTtcbiAgICB9LFxuXG4gICAgLy8gUmVzZXQgdGhpbmdzXG4gICAgcmVzZXRQbGFjZW1lbnQ6IGZ1bmN0aW9uKHgsIHkpIHtcbiAgICAgIHRoaXMucmVzZXQoeCwgeSk7XG4gICAgICB0aGlzLmJvZHkudmVsb2NpdHkueCA9IDA7XG4gICAgICB0aGlzLmdldEFuY2hvckJvdW5kc1goKTtcbiAgICB9XG4gIH0pO1xuXG4gIC8vIEV4cG9ydFxuICBtb2R1bGUuZXhwb3J0cyA9IEJvdHVsaXNtO1xufSkoKTtcbiIsIi8qIGdsb2JhbCBfOmZhbHNlLCBQaGFzZXI6ZmFsc2UgKi9cblxuLyoqXG4gKiBQcmVmYWIgQ29pbiB0eXBlIGl0ZW1cbiAqL1xuXG4oZnVuY3Rpb24oKSB7XG4gIFwidXNlIHN0cmljdFwiO1xuXG4gIC8vIENvbnN0cnVjdG9yIGZvciBjb2luXG4gIHZhciBDb2luID0gZnVuY3Rpb24oZ2FtZSwgeCwgeSkge1xuICAgIC8vIENhbGwgZGVmYXVsdCBzcHJpdGVcbiAgICBQaGFzZXIuU3ByaXRlLmNhbGwodGhpcywgZ2FtZSwgeCwgeSwgXCJnYW1lLXNwcml0ZXNcIiwgXCJtYWdpY2RpbGwucG5nXCIpO1xuXG4gICAgLy8gQ29uZmlndXJlXG4gICAgdGhpcy5hbmNob3Iuc2V0VG8oMC41LCAwLjUpO1xuICAgIHRoaXMuc2NhbGUuc2V0VG8oKHRoaXMuZ2FtZS53aWR0aCAvIDIwKSAvIHRoaXMud2lkdGgpO1xuXG4gICAgLy8gUGh5c2ljc1xuICAgIHRoaXMuZ2FtZS5waHlzaWNzLmFyY2FkZS5lbmFibGVCb2R5KHRoaXMpO1xuICAgIHRoaXMuYm9keS5hbGxvd0dyYXZpdHkgPSBmYWxzZTtcbiAgICB0aGlzLmJvZHkuaW1tb3ZhYmxlID0gdHJ1ZTtcbiAgfTtcblxuICAvLyBFeHRlbmQgZnJvbSBTcHJpdGVcbiAgQ29pbi5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFBoYXNlci5TcHJpdGUucHJvdG90eXBlKTtcbiAgQ29pbi5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBDb2luO1xuXG4gIC8vIEFkZCBtZXRob2RzXG4gIF8uZXh0ZW5kKENvaW4ucHJvdG90eXBlLCB7XG4gICAgdXBkYXRlOiBmdW5jdGlvbigpIHtcblxuICAgIH1cbiAgfSk7XG5cbiAgLy8gRXhwb3J0XG4gIG1vZHVsZS5leHBvcnRzID0gQ29pbjtcbn0pKCk7XG4iLCIvKiBnbG9iYWwgXzpmYWxzZSwgUGhhc2VyOmZhbHNlICovXG5cbi8qKlxuICogUHJlZmFiIEhlcm8vY2hhcmFjdGVyXG4gKi9cblxuKGZ1bmN0aW9uKCkge1xuICBcInVzZSBzdHJpY3RcIjtcblxuICAvLyBDb25zdHJ1Y3RvclxuICB2YXIgSGVybyA9IGZ1bmN0aW9uKGdhbWUsIHgsIHkpIHtcbiAgICAvLyBDYWxsIGRlZmF1bHQgc3ByaXRlXG4gICAgUGhhc2VyLlNwcml0ZS5jYWxsKHRoaXMsIGdhbWUsIHgsIHksIFwicGlja2xlLXNwcml0ZXNcIiwgXCJwaWNrbGUtZGVmYXVsdC5wbmdcIik7XG5cbiAgICAvLyBDb25maWd1cmVcbiAgICB0aGlzLmFuY2hvci5zZXRUbygwLjUpO1xuICAgIHRoaXMuc2NhbGUuc2V0VG8oKHRoaXMuZ2FtZS53aWR0aCAvIDI1KSAvIHRoaXMud2lkdGgpO1xuICAgIHRoaXMuZ2FtZS5waHlzaWNzLmFyY2FkZS5lbmFibGVCb2R5KHRoaXMpO1xuXG4gICAgLy8gVHJhY2sgd2hlcmUgdGhlIGhlcm8gc3RhcnRlZCBhbmQgaG93IG11Y2ggdGhlIGRpc3RhbmNlXG4gICAgLy8gaGFzIGNoYW5nZWQgZnJvbSB0aGF0IHBvaW50XG4gICAgdGhpcy55T3JpZyA9IHRoaXMueTtcbiAgICB0aGlzLnlDaGFuZ2UgPSAwO1xuICB9O1xuXG4gIC8vIEV4dGVuZCBmcm9tIFNwcml0ZVxuICBIZXJvLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUGhhc2VyLlNwcml0ZS5wcm90b3R5cGUpO1xuICBIZXJvLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEhlcm87XG5cbiAgLy8gQWRkIG1ldGhvZHNcbiAgXy5leHRlbmQoSGVyby5wcm90b3R5cGUsIHtcbiAgICB1cGRhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgLy8gVHJhY2sgdGhlIG1heGltdW0gYW1vdW50IHRoYXQgdGhlIGhlcm8gaGFzIHRyYXZlbGxlZFxuICAgICAgdGhpcy55Q2hhbmdlID0gTWF0aC5tYXgodGhpcy55Q2hhbmdlLCBNYXRoLmFicyh0aGlzLnkgLSB0aGlzLnlPcmlnKSk7XG5cbiAgICAgIC8vIFdyYXAgYXJvdW5kIGVkZ2VzIGxlZnQvdGlnaHQgZWRnZXNcbiAgICAgIHRoaXMuZ2FtZS53b3JsZC53cmFwKHRoaXMsIHRoaXMud2lkdGggLyAyLCBmYWxzZSwgdHJ1ZSwgZmFsc2UpO1xuICAgIH0sXG5cbiAgICAvLyBSZXNldCBwbGFjZW1lbnQgY3VzdG9tXG4gICAgcmVzZXRQbGFjZW1lbnQ6IGZ1bmN0aW9uKHgsIHkpIHtcbiAgICAgIHRoaXMucmVzZXQoeCwgeSk7XG4gICAgICB0aGlzLnlPcmlnID0gdGhpcy55O1xuICAgICAgdGhpcy55Q2hhbmdlID0gMDtcbiAgICB9XG4gIH0pO1xuXG4gIC8vIEV4cG9ydFxuICBtb2R1bGUuZXhwb3J0cyA9IEhlcm87XG59KSgpO1xuIiwiLyogZ2xvYmFsIF86ZmFsc2UsIFBoYXNlcjpmYWxzZSAqL1xuXG4vKipcbiAqIFByZWZhYiBwbGF0Zm9ybVxuICovXG5cbihmdW5jdGlvbigpIHtcbiAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgLy8gQ29uc3RydWN0b3JcbiAgdmFyIFBsYXRmb3JtID0gZnVuY3Rpb24oZ2FtZSwgeCwgeSkge1xuICAgIC8vIENhbGwgZGVmYXVsdCBzcHJpdGVcbiAgICBQaGFzZXIuU3ByaXRlLmNhbGwodGhpcywgZ2FtZSwgeCwgeSwgXCJnYW1lLXNwcml0ZXNcIiwgXCJkaWxseWJlYW4ucG5nXCIpO1xuXG4gICAgLy8gQ29uZmlndXJlXG4gICAgdGhpcy5hbmNob3Iuc2V0VG8oMC41LCAwLjUpO1xuICAgIHRoaXMuc2NhbGUuc2V0VG8oKHRoaXMuZ2FtZS53aWR0aCAvIDUpIC8gdGhpcy53aWR0aCk7XG4gICAgdGhpcy5ob3ZlciA9IGZhbHNlO1xuICAgIHRoaXMuc2V0SG92ZXJTcGVlZCgxMDApO1xuXG4gICAgLy8gUGh5c2ljc1xuICAgIHRoaXMuZ2FtZS5waHlzaWNzLmFyY2FkZS5lbmFibGVCb2R5KHRoaXMpO1xuICAgIHRoaXMuYm9keS5hbGxvd0dyYXZpdHkgPSBmYWxzZTtcbiAgICB0aGlzLmJvZHkuaW1tb3ZhYmxlID0gdHJ1ZTtcblxuICAgIC8vIE9ubHkgYWxsb3cgZm9yIGNvbGxpc3Npb24gdXBcbiAgICB0aGlzLmJvZHkuY2hlY2tDb2xsaXNpb24uZG93biA9IGZhbHNlO1xuICAgIHRoaXMuYm9keS5jaGVja0NvbGxpc2lvbi5sZWZ0ID0gZmFsc2U7XG4gICAgdGhpcy5ib2R5LmNoZWNrQ29sbGlzaW9uLnJpZ2h0ID0gZmFsc2U7XG5cbiAgICAvLyBEZXRlcm1pbmUgYW5jaG9yIHggYm91bmRzXG4gICAgdGhpcy5wYWRkaW5nWCA9IDEwO1xuICAgIHRoaXMuZ2V0QW5jaG9yQm91bmRzWCgpO1xuICB9O1xuXG4gIC8vIEV4dGVuZCBmcm9tIFNwcml0ZVxuICBQbGF0Zm9ybS5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFBoYXNlci5TcHJpdGUucHJvdG90eXBlKTtcbiAgUGxhdGZvcm0ucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gUGxhdGZvcm07XG5cbiAgLy8gQWRkIG1ldGhvZHNcbiAgXy5leHRlbmQoUGxhdGZvcm0ucHJvdG90eXBlLCB7XG4gICAgdXBkYXRlOiBmdW5jdGlvbigpIHtcbiAgICAgIGlmICh0aGlzLmhvdmVyKSB7XG4gICAgICAgIHRoaXMuYm9keS52ZWxvY2l0eS54ID0gdGhpcy5ib2R5LnZlbG9jaXR5LnggfHwgdGhpcy5ob3ZlclNwZWVkO1xuICAgICAgICB0aGlzLmJvZHkudmVsb2NpdHkueCA9ICh0aGlzLnggPD0gdGhpcy5taW5YKSA/IHRoaXMuaG92ZXJTcGVlZCA6XG4gICAgICAgICAgKHRoaXMueCA+PSB0aGlzLm1heFgpID8gLXRoaXMuaG92ZXJTcGVlZCA6IHRoaXMuYm9keS52ZWxvY2l0eS54O1xuICAgICAgfVxuICAgIH0sXG5cbiAgICAvLyBTZXQgaG92ZXIgc3BlZWQuICBBZGQgYSBiaXQgb2YgdmFyaWFuY2VcbiAgICBzZXRIb3ZlclNwZWVkOiBmdW5jdGlvbihzcGVlZCkge1xuICAgICAgdGhpcy5ob3ZlclNwZWVkID0gc3BlZWQgKyB0aGlzLmdhbWUucm5kLmludGVnZXJJblJhbmdlKC01MCwgNTApO1xuICAgIH0sXG5cbiAgICAvLyBHZXQgYW5jaG9yIGJvdW5kc1xuICAgIGdldEFuY2hvckJvdW5kc1g6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5taW5YID0gdGhpcy5wYWRkaW5nWCArICh0aGlzLndpZHRoIC8gMik7XG4gICAgICB0aGlzLm1heFggPSB0aGlzLmdhbWUud2lkdGggLSAodGhpcy5wYWRkaW5nWCArICh0aGlzLndpZHRoIC8gMikpO1xuICAgICAgcmV0dXJuIFt0aGlzLm1pblgsIHRoaXMubWF4WF07XG4gICAgfSxcblxuICAgIC8vIFJlc2V0IHRoaW5nc1xuICAgIHJlc2V0U2V0dGluZ3M6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5yZXNldCgwLCAwKTtcbiAgICAgIHRoaXMuYm9keS52ZWxvY2l0eS54ID0gMDtcbiAgICAgIHRoaXMuaG92ZXIgPSBmYWxzZTtcbiAgICAgIHRoaXMuZ2V0QW5jaG9yQm91bmRzWCgpO1xuICAgIH1cbiAgfSk7XG5cbiAgLy8gRXhwb3J0XG4gIG1vZHVsZS5leHBvcnRzID0gUGxhdGZvcm07XG59KSgpO1xuIiwiLyogZ2xvYmFsIF86ZmFsc2UsIFBoYXNlcjpmYWxzZSAqL1xuXG4vKipcbiAqIEdhbWVvdmVyIHN0YXRlXG4gKi9cblxuKGZ1bmN0aW9uKCkge1xuICBcInVzZSBzdHJpY3RcIjtcblxuICAvLyBDb25zdHJ1Y3RvclxuICB2YXIgR2FtZW92ZXIgPSBmdW5jdGlvbigpIHtcbiAgICBQaGFzZXIuU3RhdGUuY2FsbCh0aGlzKTtcblxuICAgIC8vIENvbmZpZ3VyZVxuICAgIHRoaXMucGFkZGluZyA9IDEwO1xuICB9O1xuXG4gIC8vIEV4dGVuZCBmcm9tIFN0YXRlXG4gIEdhbWVvdmVyLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUGhhc2VyLlN0YXRlLnByb3RvdHlwZSk7XG4gIEdhbWVvdmVyLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEdhbWVvdmVyO1xuXG4gIC8vIEFkZCBtZXRob2RzXG4gIF8uZXh0ZW5kKEdhbWVvdmVyLnByb3RvdHlwZSwgUGhhc2VyLlN0YXRlLnByb3RvdHlwZSwge1xuICAgIC8vIFByZWxvYWRcbiAgICBwcmVsb2FkOiBmdW5jdGlvbigpIHtcbiAgICAgIC8vIExvYWQgdXAgZ2FtZSBpbWFnZXNcbiAgICAgIHRoaXMuZ2FtZS5sb2FkLmF0bGFzKFwiZ2FtZW92ZXItc3ByaXRlc1wiLCBcImFzc2V0cy9nYW1lb3Zlci1zcHJpdGVzLnBuZ1wiLCBcImFzc2V0cy9nYW1lb3Zlci1zcHJpdGVzLmpzb25cIik7XG4gICAgfSxcblxuICAgIC8vIENyZWF0ZVxuICAgIGNyZWF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAvLyBTZXQgYmFja2dyb3VuZFxuICAgICAgdGhpcy5nYW1lLnN0YWdlLmJhY2tncm91bmRDb2xvciA9IFwiIzhjYzYzZlwiO1xuXG4gICAgICAvLyBQbGFjZSB0aXRsZVxuICAgICAgdGhpcy50aXRsZUltYWdlID0gdGhpcy5nYW1lLmFkZC5zcHJpdGUodGhpcy5nYW1lLndpZHRoIC8gMiwgdGhpcy5wYWRkaW5nICogMywgXCJnYW1lb3Zlci1zcHJpdGVzXCIsIFwiZ2FtZW92ZXIucG5nXCIpO1xuICAgICAgdGhpcy50aXRsZUltYWdlLmFuY2hvci5zZXRUbygwLjUsIDApO1xuICAgICAgdGhpcy50aXRsZUltYWdlLnNjYWxlLnNldFRvKCh0aGlzLmdhbWUud2lkdGggLSAodGhpcy5wYWRkaW5nICogOCkpIC8gdGhpcy50aXRsZUltYWdlLndpZHRoKTtcbiAgICAgIHRoaXMuZ2FtZS5hZGQuZXhpc3RpbmcodGhpcy50aXRsZUltYWdlKTtcblxuICAgICAgLy8gSGlnaHNjb3JlIGxpc3QuICBDYW4ndCBzZWVtIHRvIGZpbmQgYSB3YXkgdG8gcGFzcyB0aGUgc2NvcmVcbiAgICAgIC8vIHZpYSBhIHN0YXRlIGNoYW5nZS5cbiAgICAgIHRoaXMuc2NvcmUgPSB0aGlzLmdhbWUucGlja2xlLnNjb3JlO1xuXG4gICAgICAvLyBTaG93IHNjb3JlXG4gICAgICB0aGlzLnNob3dTY29yZSgpO1xuXG4gICAgICAvLyBTaG93IGlucHV0IGlmIG5ldyBoaWdoc2NvcmUsIG90aGVyd2lzZSBzaG93IGxpc3RcbiAgICAgIGlmICh0aGlzLmdhbWUucGlja2xlLmlzSGlnaHNjb3JlKHRoaXMuc2NvcmUpKSB7XG4gICAgICAgIHRoaXMuaGlnaHNjb3JlSW5wdXQoKTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICB0aGlzLmhpZ2hzY29yZUxpc3QoKTtcbiAgICAgIH1cblxuICAgICAgLy8gUGxhY2UgcmUtcGxheVxuICAgICAgdGhpcy5yZXBsYXlJbWFnZSA9IHRoaXMuZ2FtZS5hZGQuc3ByaXRlKHRoaXMuZ2FtZS53aWR0aCAtIHRoaXMucGFkZGluZyAqIDIsXG4gICAgICAgIHRoaXMuZ2FtZS5oZWlnaHQgLSB0aGlzLnBhZGRpbmcgKiAyLCBcImdhbWVvdmVyLXNwcml0ZXNcIiwgXCJ0aXRsZS1wbGF5LnBuZ1wiKTtcbiAgICAgIHRoaXMucmVwbGF5SW1hZ2UuYW5jaG9yLnNldFRvKDEsIDEpO1xuICAgICAgdGhpcy5yZXBsYXlJbWFnZS5zY2FsZS5zZXRUbygodGhpcy5nYW1lLndpZHRoICogMC4yNSkgLyB0aGlzLnJlcGxheUltYWdlLndpZHRoKTtcbiAgICAgIHRoaXMuZ2FtZS5hZGQuZXhpc3RpbmcodGhpcy5yZXBsYXlJbWFnZSk7XG5cbiAgICAgIC8vIEFkZCBob3ZlciBmb3IgbW91c2VcbiAgICAgIHRoaXMucmVwbGF5SW1hZ2UuaW5wdXRFbmFibGVkID0gdHJ1ZTtcbiAgICAgIHRoaXMucmVwbGF5SW1hZ2UuZXZlbnRzLm9uSW5wdXRPdmVyLmFkZChmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5yZXBsYXlJbWFnZS5vcmlnaW5hbFRpbnQgPSB0aGlzLnJlcGxheUltYWdlLnRpbnQ7XG4gICAgICAgIHRoaXMucmVwbGF5SW1hZ2UudGludCA9IDAuNSAqIDB4RkZGRkZGO1xuICAgICAgfSwgdGhpcyk7XG5cbiAgICAgIHRoaXMucmVwbGF5SW1hZ2UuZXZlbnRzLm9uSW5wdXRPdXQuYWRkKGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLnJlcGxheUltYWdlLnRpbnQgPSB0aGlzLnJlcGxheUltYWdlLm9yaWdpbmFsVGludDtcbiAgICAgIH0sIHRoaXMpO1xuXG4gICAgICAvLyBBZGQgaW50ZXJhY3Rpb25zIGZvciBzdGFydGluZ1xuICAgICAgdGhpcy5yZXBsYXlJbWFnZS5ldmVudHMub25JbnB1dERvd24uYWRkKHRoaXMucmVwbGF5LCB0aGlzKTtcblxuICAgICAgLy8gSW5wdXRcbiAgICAgIHRoaXMubGVmdEJ1dHRvbiA9IHRoaXMuZ2FtZS5pbnB1dC5rZXlib2FyZC5hZGRLZXkoUGhhc2VyLktleWJvYXJkLkxFRlQpO1xuICAgICAgdGhpcy5yaWdodEJ1dHRvbiA9IHRoaXMuZ2FtZS5pbnB1dC5rZXlib2FyZC5hZGRLZXkoUGhhc2VyLktleWJvYXJkLlJJR0hUKTtcbiAgICAgIHRoaXMudXBCdXR0b24gPSB0aGlzLmdhbWUuaW5wdXQua2V5Ym9hcmQuYWRkS2V5KFBoYXNlci5LZXlib2FyZC5VUCk7XG4gICAgICB0aGlzLmRvd25CdXR0b24gPSB0aGlzLmdhbWUuaW5wdXQua2V5Ym9hcmQuYWRkS2V5KFBoYXNlci5LZXlib2FyZC5ET1dOKTtcbiAgICAgIHRoaXMuYWN0aW9uQnV0dG9uID0gdGhpcy5nYW1lLmlucHV0LmtleWJvYXJkLmFkZEtleShQaGFzZXIuS2V5Ym9hcmQuU1BBQ0VCQVIpO1xuXG4gICAgICB0aGlzLmxlZnRCdXR0b24ub25Eb3duLmFkZChmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHRoaXMuaElucHV0KSB7XG4gICAgICAgICAgdGhpcy5tb3ZlQ3Vyc29yKC0xKTtcbiAgICAgICAgfVxuICAgICAgfSwgdGhpcyk7XG5cbiAgICAgIHRoaXMucmlnaHRCdXR0b24ub25Eb3duLmFkZChmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHRoaXMuaElucHV0KSB7XG4gICAgICAgICAgdGhpcy5tb3ZlQ3Vyc29yKDEpO1xuICAgICAgICB9XG4gICAgICB9LCB0aGlzKTtcblxuICAgICAgdGhpcy51cEJ1dHRvbi5vbkRvd24uYWRkKGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAodGhpcy5oSW5wdXQpIHtcbiAgICAgICAgICB0aGlzLm1vdmVMZXR0ZXIoMSk7XG4gICAgICAgIH1cbiAgICAgIH0sIHRoaXMpO1xuXG4gICAgICB0aGlzLmRvd25CdXR0b24ub25Eb3duLmFkZChmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHRoaXMuaElucHV0KSB7XG4gICAgICAgICAgdGhpcy5tb3ZlTGV0dGVyKC0xKTtcbiAgICAgICAgfVxuICAgICAgfSwgdGhpcyk7XG5cbiAgICAgIHRoaXMuYWN0aW9uQnV0dG9uLm9uRG93bi5hZGQoZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBzYXZlZDtcblxuICAgICAgICBpZiAodGhpcy5oSW5wdXQpIHtcbiAgICAgICAgICBzYXZlZCA9IHRoaXMuc2F2ZUhpZ2hzY29yZSgpO1xuICAgICAgICAgIGlmIChzYXZlZCkge1xuICAgICAgICAgICAgdGhpcy5oaWdoc2NvcmVMaXN0KCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIHRoaXMucmVwbGF5KCk7XG4gICAgICAgIH1cbiAgICAgIH0sIHRoaXMpO1xuICAgIH0sXG5cbiAgICAvLyBVcGRhdGVcbiAgICB1cGRhdGU6IGZ1bmN0aW9uKCkge1xuICAgIH0sXG5cbiAgICAvLyBTaHV0ZG93biwgY2xlYW4gdXAgb24gc3RhdGUgY2hhbmdlXG4gICAgc2h1dGRvd246IGZ1bmN0aW9uKCkge1xuICAgICAgW1widGl0bGVUZXh0XCIsIFwicmVwbGF5VGV4dFwiXS5mb3JFYWNoKF8uYmluZChmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgIGlmICh0aGlzW2l0ZW1dICYmIHRoaXNbaXRlbV0uZGVzdHJveSkge1xuICAgICAgICAgIHRoaXNbaXRlbV0uZGVzdHJveSgpO1xuICAgICAgICAgIHRoaXNbaXRlbV0gPSBudWxsO1xuICAgICAgICB9XG4gICAgICB9LCB0aGlzKSk7XG4gICAgfSxcblxuICAgIC8vIEhhbmRsZSByZXBsYXlcbiAgICByZXBsYXk6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5nYW1lLnN0YXRlLnN0YXJ0KFwibWVudVwiKTtcbiAgICB9LFxuXG4gICAgLy8gU2hvdyBoaWdoc2NvcmVcbiAgICBzaG93U2NvcmU6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zY29yZUdyb3VwID0gdGhpcy5nYW1lLmFkZC5ncm91cCgpO1xuXG4gICAgICAvLyBQbGFjZSBsYWJlbFxuICAgICAgdGhpcy55b3VyU2NvcmVJbWFnZSA9IHRoaXMuZ2FtZS5hZGQuc3ByaXRlKFxuICAgICAgICB0aGlzLmdhbWUud2lkdGggLyAyICsgKHRoaXMucGFkZGluZyAqIDMpLFxuICAgICAgICB0aGlzLnRpdGxlSW1hZ2UuaGVpZ2h0ICsgKHRoaXMucGFkZGluZyAqIDcuNSksIFwiZ2FtZW92ZXItc3ByaXRlc1wiLCBcInlvdXItc2NvcmUucG5nXCIpO1xuICAgICAgdGhpcy55b3VyU2NvcmVJbWFnZS5hbmNob3Iuc2V0VG8oMSwgMCk7XG4gICAgICB0aGlzLnlvdXJTY29yZUltYWdlLnNjYWxlLnNldFRvKCgodGhpcy5nYW1lLndpZHRoIC8gMikgLSAodGhpcy5wYWRkaW5nICogNikpIC8gdGhpcy55b3VyU2NvcmVJbWFnZS53aWR0aCk7XG5cbiAgICAgIC8vIFNjb3JlXG4gICAgICB0aGlzLnNjb3JlVGV4dCA9IG5ldyBQaGFzZXIuVGV4dChcbiAgICAgICAgdGhpcy5nYW1lLFxuICAgICAgICB0aGlzLmdhbWUud2lkdGggLyAyICsgKHRoaXMucGFkZGluZyAqIDUpLFxuICAgICAgICB0aGlzLnRpdGxlSW1hZ2UuaGVpZ2h0ICsgKHRoaXMucGFkZGluZyAqIDYpLFxuICAgICAgICB0aGlzLnNjb3JlLnRvTG9jYWxlU3RyaW5nKCksIHtcbiAgICAgICAgICBmb250OiBcImJvbGQgXCIgKyAodGhpcy5nYW1lLndvcmxkLmhlaWdodCAvIDE1KSArIFwicHggRG9zaXNcIixcbiAgICAgICAgICBmaWxsOiBcIiMzOWI1NGFcIixcbiAgICAgICAgICBhbGlnbjogXCJsZWZ0XCIsXG4gICAgICAgIH0pO1xuICAgICAgdGhpcy5zY29yZVRleHQuYW5jaG9yLnNldFRvKDAsIDApO1xuXG4gICAgICAvLyBGb250IGxvYWRpbmcgdGhpbmdcbiAgICAgIF8uZGVsYXkoXy5iaW5kKGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLnNjb3JlR3JvdXAuYWRkKHRoaXMueW91clNjb3JlSW1hZ2UpO1xuICAgICAgICB0aGlzLnNjb3JlR3JvdXAuYWRkKHRoaXMuc2NvcmVUZXh0KTtcbiAgICAgIH0sIHRoaXMpLCAxMDAwKTtcbiAgICB9LFxuXG4gICAgLy8gTWFrZSBoaWdoZXN0IHNjb3JlIGlucHV0XG4gICAgaGlnaHNjb3JlSW5wdXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5oSW5wdXQgPSB0cnVlO1xuICAgICAgdGhpcy5oSW5wdXRJbmRleCA9IDA7XG4gICAgICB0aGlzLmhJbnB1dHMgPSB0aGlzLmdhbWUuYWRkLmdyb3VwKCk7XG4gICAgICB2YXIgeSA9IHRoaXMuZ2FtZS53b3JsZC5oZWlnaHQgKiAwLjc7XG5cbiAgICAgIC8vIEZpcnN0IGlucHV0XG4gICAgICB2YXIgb25lID0gbmV3IFBoYXNlci5UZXh0KFxuICAgICAgICB0aGlzLmdhbWUsXG4gICAgICAgIHRoaXMuZ2FtZS53b3JsZC53aWR0aCAqIDAuMzMzMzMsXG4gICAgICAgIHksXG4gICAgICAgIFwiQVwiLCB7XG4gICAgICAgICAgZm9udDogXCJib2xkIFwiICsgKHRoaXMuZ2FtZS53b3JsZC5oZWlnaHQgLyAxNSkgKyBcInB4IERvc2lzXCIsXG4gICAgICAgICAgZmlsbDogXCIjRkZGRkZGXCIsXG4gICAgICAgICAgYWxpZ246IFwiY2VudGVyXCIsXG4gICAgICAgIH0pO1xuICAgICAgb25lLmFuY2hvci5zZXQoMC41KTtcbiAgICAgIHRoaXMuaElucHV0cy5hZGQob25lKTtcblxuICAgICAgLy8gU2Vjb25kIGlucHV0XG4gICAgICB2YXIgc2Vjb25kID0gbmV3IFBoYXNlci5UZXh0KFxuICAgICAgICB0aGlzLmdhbWUsXG4gICAgICAgIHRoaXMuZ2FtZS53b3JsZC53aWR0aCAqIDAuNSxcbiAgICAgICAgeSxcbiAgICAgICAgXCJBXCIsIHtcbiAgICAgICAgICBmb250OiBcImJvbGQgXCIgKyAodGhpcy5nYW1lLndvcmxkLmhlaWdodCAvIDE1KSArIFwicHggRG9zaXNcIixcbiAgICAgICAgICBmaWxsOiBcIiNGRkZGRkZcIixcbiAgICAgICAgICBhbGlnbjogXCJjZW50ZXJcIixcbiAgICAgICAgfSk7XG4gICAgICBzZWNvbmQuYW5jaG9yLnNldCgwLjUpO1xuICAgICAgdGhpcy5oSW5wdXRzLmFkZChzZWNvbmQpO1xuXG4gICAgICAvLyBTZWNvbmQgaW5wdXRcbiAgICAgIHZhciB0aGlyZCA9IG5ldyBQaGFzZXIuVGV4dChcbiAgICAgICAgdGhpcy5nYW1lLFxuICAgICAgICB0aGlzLmdhbWUud29ybGQud2lkdGggKiAwLjY2NjY2LFxuICAgICAgICB5LFxuICAgICAgICBcIkFcIiwge1xuICAgICAgICAgIGZvbnQ6IFwiYm9sZCBcIiArICh0aGlzLmdhbWUud29ybGQuaGVpZ2h0IC8gMTUpICsgXCJweCBEb3Npc1wiLFxuICAgICAgICAgIGZpbGw6IFwiI0ZGRkZGRlwiLFxuICAgICAgICAgIGFsaWduOiBcImNlbnRlclwiLFxuICAgICAgICB9KTtcbiAgICAgIHRoaXJkLmFuY2hvci5zZXQoMC41KTtcbiAgICAgIHRoaXMuaElucHV0cy5hZGQodGhpcmQpO1xuXG4gICAgICAvLyBDdXJzb3JcbiAgICAgIHRoaXMuaEN1cnNvciA9IHRoaXMuZ2FtZS5hZGQudGV4dChcbiAgICAgICAgb25lLngsXG4gICAgICAgIG9uZS55IC0gKHRoaXMuZ2FtZS53b3JsZC5oZWlnaHQgLyAyMCksXG4gICAgICAgIFwiX1wiLCB7XG4gICAgICAgICAgZm9udDogXCJib2xkIFwiICsgKHRoaXMuZ2FtZS53b3JsZC5oZWlnaHQgLyA1KSArIFwicHggQXJpYWxcIixcbiAgICAgICAgICBmaWxsOiBcIiNGRkZGRkZcIixcbiAgICAgICAgICBhbGlnbjogXCJjZW50ZXJcIixcbiAgICAgICAgfSk7XG4gICAgICB0aGlzLmhDdXJzb3IuYW5jaG9yLnNldCgwLjUpO1xuXG4gICAgICAvLyBIYW5kbGUgaW5pdGFsIGN1cnNvclxuICAgICAgdGhpcy5tb3ZlQ3Vyc29yKDApO1xuICAgIH0sXG5cbiAgICAvLyBNb3ZlIGN1cnNvclxuICAgIG1vdmVDdXJzb3I6IGZ1bmN0aW9uKGFtb3VudCkge1xuICAgICAgdmFyIG5ld0luZGV4ID0gdGhpcy5oSW5wdXRJbmRleCArIGFtb3VudDtcbiAgICAgIHRoaXMuaElucHV0SW5kZXggPSAobmV3SW5kZXggPCAwKSA/IHRoaXMuaElucHV0cy5sZW5ndGggLSAxIDpcbiAgICAgICAgKG5ld0luZGV4ID49IHRoaXMuaElucHV0cy5sZW5ndGgpID8gMCA6IG5ld0luZGV4O1xuICAgICAgdmFyIGkgPSB0aGlzLmhJbnB1dHMuZ2V0Q2hpbGRBdCh0aGlzLmhJbnB1dEluZGV4KTtcblxuICAgICAgLy8gTW92ZSBjdXJzb3JcbiAgICAgIHRoaXMuaEN1cnNvci54ID0gaS54O1xuICAgICAgdGhpcy5oSW5wdXRzLmZvckVhY2goZnVuY3Rpb24oaW5wdXQpIHtcbiAgICAgICAgaW5wdXQuZmlsbCA9IFwiI0ZGRkZGRlwiO1xuICAgICAgfSk7XG5cbiAgICAgIGkuZmlsbCA9IFwiI0ZGRERCQlwiO1xuXG4gICAgICAvLyBUT0RPOiBIaWdobGlnaHQgaW5wdXQuXG4gICAgfSxcblxuICAgIC8vIE1vdmUgbGV0dGVyXG4gICAgbW92ZUxldHRlcjogZnVuY3Rpb24oYW1vdW50KSB7XG4gICAgICB2YXIgaSA9IHRoaXMuaElucHV0cy5nZXRDaGlsZEF0KHRoaXMuaElucHV0SW5kZXgpO1xuICAgICAgdmFyIHQgPSBpLnRleHQ7XG4gICAgICB2YXIgbiA9ICh0ID09PSBcIkFcIiAmJiBhbW91bnQgPT09IC0xKSA/IFwiWlwiIDpcbiAgICAgICAgKHQgPT09IFwiWlwiICYmIGFtb3VudCA9PT0gMSkgPyBcIkFcIiA6XG4gICAgICAgIFN0cmluZy5mcm9tQ2hhckNvZGUodC5jaGFyQ29kZUF0KDApICsgYW1vdW50KTtcblxuICAgICAgaS50ZXh0ID0gbjtcbiAgICB9LFxuXG4gICAgLy8gU2F2ZSBoaWdoc2NvcmVcbiAgICBzYXZlSGlnaHNjb3JlOiBmdW5jdGlvbigpIHtcbiAgICAgIC8vIEdldCBuYW1lXG4gICAgICB2YXIgbmFtZSA9IFwiXCI7XG4gICAgICB0aGlzLmhJbnB1dHMuZm9yRWFjaChmdW5jdGlvbihpbnB1dCkge1xuICAgICAgICBuYW1lID0gbmFtZSArIGlucHV0LnRleHQ7XG4gICAgICB9KTtcblxuICAgICAgLy8gRG9uJ3QgYWxsb3cgQUFBXG4gICAgICBpZiAobmFtZSA9PT0gXCJBQUFcIikge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIC8vIFNhdmUgaGlnaHNjb3JlXG4gICAgICB0aGlzLmdhbWUucGlja2xlLnNldEhpZ2hzY29yZSh0aGlzLnNjb3JlLCBuYW1lKTtcblxuICAgICAgLy8gUmVtb3ZlIGlucHV0XG4gICAgICB0aGlzLmhJbnB1dCA9IGZhbHNlO1xuICAgICAgdGhpcy5oSW5wdXRzLmRlc3Ryb3koKTtcbiAgICAgIHRoaXMuaEN1cnNvci5kZXN0cm95KCk7XG5cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0sXG5cbiAgICAvLyBIaWdoc2NvcmUgbGlzdFxuICAgIGhpZ2hzY29yZUxpc3Q6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5oaWdoc2NvcmVMaW1pdCA9IDM7XG4gICAgICB0aGlzLmhpZ2hzY29yZUxpc3RHcm91cCA9IHRoaXMuZ2FtZS5hZGQuZ3JvdXAoKTtcbiAgICAgIHRoaXMuZ2FtZS5waWNrbGUuc29ydEhpZ2hzY29yZXMoKTtcbiAgICAgIHZhciBmb250U2l6ZSA9IHRoaXMuZ2FtZS53b3JsZC5oZWlnaHQgLyAxNy41O1xuXG4gICAgICBpZiAodGhpcy5nYW1lLnBpY2tsZS5oaWdoc2NvcmVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgXy5lYWNoKHRoaXMuZ2FtZS5waWNrbGUuaGlnaHNjb3Jlcy5yZXZlcnNlKCkuc2xpY2UoMCwgMyksIF8uYmluZChmdW5jdGlvbihoLCBpKSB7XG4gICAgICAgICAgLy8gTmFtZVxuICAgICAgICAgIHZhciBuYW1lID0gbmV3IFBoYXNlci5UZXh0KFxuICAgICAgICAgICAgdGhpcy5nYW1lLFxuICAgICAgICAgICAgdGhpcy5nYW1lLndpZHRoIC8gMiArICh0aGlzLnBhZGRpbmcgKiAzKSxcbiAgICAgICAgICAgICh0aGlzLmdhbWUuaGVpZ2h0ICogMC42KSArICgoZm9udFNpemUgKyB0aGlzLnBhZGRpbmcpICogaSksXG4gICAgICAgICAgICBoLm5hbWUsIHtcbiAgICAgICAgICAgICAgZm9udDogXCJib2xkIFwiICsgKHRoaXMuZ2FtZS53b3JsZC5oZWlnaHQgLyAxNSkgKyBcInB4IERvc2lzXCIsXG4gICAgICAgICAgICAgIGZpbGw6IFwiI2I4ZjRiY1wiLFxuICAgICAgICAgICAgICBhbGlnbjogXCJyaWdodFwiLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgbmFtZS5hbmNob3Iuc2V0VG8oMSwgMCk7XG5cbiAgICAgICAgICAvLyBTY29yZVxuICAgICAgICAgIHZhciBzY29yZSA9IG5ldyBQaGFzZXIuVGV4dChcbiAgICAgICAgICAgIHRoaXMuZ2FtZSxcbiAgICAgICAgICAgIHRoaXMuZ2FtZS53aWR0aCAvIDIgKyAodGhpcy5wYWRkaW5nICogNSksXG4gICAgICAgICAgICAodGhpcy5nYW1lLmhlaWdodCAqIDAuNikgKyAoKGZvbnRTaXplICsgdGhpcy5wYWRkaW5nKSAqIGkpLFxuICAgICAgICAgICAgaC5zY29yZS50b0xvY2FsZVN0cmluZygpLCB7XG4gICAgICAgICAgICAgIGZvbnQ6IFwiYm9sZCBcIiArICh0aGlzLmdhbWUud29ybGQuaGVpZ2h0IC8gMTUpICsgXCJweCBEb3Npc1wiLFxuICAgICAgICAgICAgICBmaWxsOiBcIiMzOWI1NGFcIixcbiAgICAgICAgICAgICAgYWxpZ246IFwibGVmdFwiLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgc2NvcmUuYW5jaG9yLnNldFRvKDAsIDApO1xuXG4gICAgICAgICAgLy8gRm9udCBsb2FkaW5nIHRoaW5nXG4gICAgICAgICAgXy5kZWxheShfLmJpbmQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLmhpZ2hzY29yZUxpc3RHcm91cC5hZGQobmFtZSk7XG4gICAgICAgICAgICB0aGlzLmhpZ2hzY29yZUxpc3RHcm91cC5hZGQoc2NvcmUpO1xuICAgICAgICAgIH0sIHRoaXMpLCAxMDAwKTtcbiAgICAgICAgfSwgdGhpcykpO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbiAgLy8gRXhwb3J0XG4gIG1vZHVsZS5leHBvcnRzID0gR2FtZW92ZXI7XG59KSgpO1xuIiwiLyogZ2xvYmFsIF86ZmFsc2UsIFBoYXNlcjpmYWxzZSAqL1xuXG4vKipcbiAqIE1lbnUgc3RhdGVcbiAqL1xuXG4oZnVuY3Rpb24oKSB7XG4gIFwidXNlIHN0cmljdFwiO1xuXG4gIC8vIENvbnN0cnVjdG9yXG4gIHZhciBNZW51ID0gZnVuY3Rpb24oKSB7XG4gICAgUGhhc2VyLlN0YXRlLmNhbGwodGhpcyk7XG5cbiAgICAvLyBDb25maWdcbiAgICB0aGlzLnBhZGRpbmcgPSAyMDtcbiAgfTtcblxuICAvLyBFeHRlbmQgZnJvbSBTdGF0ZVxuICBNZW51LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUGhhc2VyLlN0YXRlLnByb3RvdHlwZSk7XG4gIE1lbnUucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gTWVudTtcblxuICAvLyBBZGQgbWV0aG9kc1xuICBfLmV4dGVuZChNZW51LnByb3RvdHlwZSwgUGhhc2VyLlN0YXRlLnByb3RvdHlwZSwge1xuICAgIC8vIFByZWxvYWRcbiAgICBwcmVsb2FkOiBmdW5jdGlvbigpIHtcbiAgICAgIC8vIExvYWQgdXAgZ2FtZSBpbWFnZXNcbiAgICAgIHRoaXMuZ2FtZS5sb2FkLmF0bGFzKFwidGl0bGUtc3ByaXRlc1wiLCBcImFzc2V0cy90aXRsZS1zcHJpdGVzLnBuZ1wiLCBcImFzc2V0cy90aXRsZS1zcHJpdGVzLmpzb25cIik7XG4gICAgfSxcblxuICAgIC8vIENyZWF0ZVxuICAgIGNyZWF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAvLyBTZXQgYmFja2dyb3VuZFxuICAgICAgdGhpcy5nYW1lLnN0YWdlLmJhY2tncm91bmRDb2xvciA9IFwiI2I4ZjRiY1wiO1xuXG4gICAgICAvLyBQbGFjZSB0aXRsZVxuICAgICAgdGhpcy50aXRsZUltYWdlID0gdGhpcy5nYW1lLmFkZC5zcHJpdGUodGhpcy5nYW1lLndpZHRoIC8gMiwgdGhpcy5wYWRkaW5nICogMywgXCJ0aXRsZS1zcHJpdGVzXCIsIFwidGl0bGUucG5nXCIpO1xuICAgICAgdGhpcy50aXRsZUltYWdlLmFuY2hvci5zZXRUbygwLjUsIDApO1xuICAgICAgdGhpcy50aXRsZUltYWdlLnNjYWxlLnNldFRvKCh0aGlzLmdhbWUud2lkdGggLSAodGhpcy5wYWRkaW5nICogMikpIC8gdGhpcy50aXRsZUltYWdlLndpZHRoKTtcbiAgICAgIHRoaXMuZ2FtZS5hZGQuZXhpc3RpbmcodGhpcy50aXRsZUltYWdlKTtcblxuICAgICAgLy8gUGxhY2UgcGxheVxuICAgICAgdGhpcy5wbGF5SW1hZ2UgPSB0aGlzLmdhbWUuYWRkLnNwcml0ZSh0aGlzLmdhbWUud2lkdGggLyAyLCB0aGlzLmdhbWUuaGVpZ2h0IC0gdGhpcy5wYWRkaW5nICogMywgXCJ0aXRsZS1zcHJpdGVzXCIsIFwidGl0bGUtcGxheS5wbmdcIik7XG4gICAgICB0aGlzLnBsYXlJbWFnZS5hbmNob3Iuc2V0VG8oMC40LCAxKTtcbiAgICAgIHRoaXMucGxheUltYWdlLnNjYWxlLnNldFRvKCh0aGlzLmdhbWUud2lkdGggKiAwLjc1KSAvIHRoaXMudGl0bGVJbWFnZS53aWR0aCk7XG4gICAgICB0aGlzLmdhbWUuYWRkLmV4aXN0aW5nKHRoaXMucGxheUltYWdlKTtcblxuICAgICAgLy8gQWRkIGhvdmVyIGZvciBtb3VzZVxuICAgICAgdGhpcy5wbGF5SW1hZ2UuaW5wdXRFbmFibGVkID0gdHJ1ZTtcbiAgICAgIHRoaXMucGxheUltYWdlLmV2ZW50cy5vbklucHV0T3Zlci5hZGQoZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMucGxheUltYWdlLm9yaWdpbmFsVGludCA9IHRoaXMucGxheUltYWdlLnRpbnQ7XG4gICAgICAgIHRoaXMucGxheUltYWdlLnRpbnQgPSAwLjUgKiAweEZGRkZGRjtcbiAgICAgIH0sIHRoaXMpO1xuXG4gICAgICB0aGlzLnBsYXlJbWFnZS5ldmVudHMub25JbnB1dE91dC5hZGQoZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMucGxheUltYWdlLnRpbnQgPSB0aGlzLnBsYXlJbWFnZS5vcmlnaW5hbFRpbnQ7XG4gICAgICB9LCB0aGlzKTtcblxuICAgICAgLy8gQWRkIG1vdXNlIGludGVyYWN0aW9uXG4gICAgICB0aGlzLnBsYXlJbWFnZS5ldmVudHMub25JbnB1dERvd24uYWRkKHRoaXMuZ28sIHRoaXMpO1xuXG4gICAgICAvLyBBZGQga2V5Ym9hcmQgaW50ZXJhY3Rpb25cbiAgICAgIHRoaXMuYWN0aW9uQnV0dG9uID0gdGhpcy5nYW1lLmlucHV0LmtleWJvYXJkLmFkZEtleShQaGFzZXIuS2V5Ym9hcmQuU1BBQ0VCQVIpO1xuICAgICAgdGhpcy5hY3Rpb25CdXR0b24ub25Eb3duLmFkZChmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5nbygpO1xuICAgICAgfSwgdGhpcyk7XG4gICAgfSxcblxuICAgIC8vIFN0YXJ0IHBsYXlpbmdcbiAgICBnbzogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLmdhbWUuc3RhdGUuc3RhcnQoXCJwbGF5XCIpO1xuICAgIH0sXG5cbiAgICAvLyBVcGRhdGVcbiAgICB1cGRhdGU6IGZ1bmN0aW9uKCkge1xuICAgIH1cbiAgfSk7XG5cbiAgLy8gRXhwb3J0XG4gIG1vZHVsZS5leHBvcnRzID0gTWVudTtcbn0pKCk7XG4iLCIvKiBnbG9iYWwgXzpmYWxzZSwgUGhhc2VyOmZhbHNlICovXG5cbi8qKlxuICogUGxheSBzdGF0ZVxuICovXG5cbihmdW5jdGlvbigpIHtcbiAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgLy8gRGVwZW5kZW5jaWVzXG4gIHZhciBwcmVmYWJzID0ge1xuICAgIEJvb3N0OiByZXF1aXJlKFwiLi9wcmVmYWItYm9vc3QuanNcIiksXG4gICAgQm90dWxpc206IHJlcXVpcmUoXCIuL3ByZWZhYi1ib3R1bGlzbS5qc1wiKSxcbiAgICBDb2luOiByZXF1aXJlKFwiLi9wcmVmYWItY29pbi5qc1wiKSxcbiAgICBIZXJvOiByZXF1aXJlKFwiLi9wcmVmYWItaGVyby5qc1wiKSxcbiAgICBQbGF0Zm9ybTogcmVxdWlyZShcIi4vcHJlZmFiLXBsYXRmb3JtLmpzXCIpXG4gIH07XG5cbiAgLy8gQ29uc3RydWN0b3JcbiAgdmFyIFBsYXkgPSBmdW5jdGlvbigpIHtcbiAgICBQaGFzZXIuU3RhdGUuY2FsbCh0aGlzKTtcbiAgfTtcblxuICAvLyBFeHRlbmQgZnJvbSBTdGF0ZVxuICBQbGF5LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUGhhc2VyLlN0YXRlLnByb3RvdHlwZSk7XG4gIFBsYXkucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gUGxheTtcblxuICAvLyBBZGQgbWV0aG9kc1xuICBfLmV4dGVuZChQbGF5LnByb3RvdHlwZSwgUGhhc2VyLlN0YXRlLnByb3RvdHlwZSwge1xuICAgIC8vIFByZWxvYWRcbiAgICBwcmVsb2FkOiBmdW5jdGlvbigpIHtcbiAgICAgIC8vIExvYWQgdXAgZ2FtZSBpbWFnZXNcbiAgICAgIHRoaXMuZ2FtZS5sb2FkLmF0bGFzKFwiZ2FtZS1zcHJpdGVzXCIsIFwiYXNzZXRzL2dhbWUtc3ByaXRlcy5wbmdcIiwgXCJhc3NldHMvZ2FtZS1zcHJpdGVzLmpzb25cIik7XG4gICAgICB0aGlzLmdhbWUubG9hZC5hdGxhcyhcInBpY2tsZS1zcHJpdGVzXCIsIFwiYXNzZXRzL3BpY2tsZS1zcHJpdGVzLnBuZ1wiLCBcImFzc2V0cy9waWNrbGUtc3ByaXRlcy5qc29uXCIpO1xuICAgICAgdGhpcy5nYW1lLmxvYWQuYXRsYXMoXCJjYXJyb3Qtc3ByaXRlc1wiLCBcImFzc2V0cy9jYXJyb3Qtc3ByaXRlcy5wbmdcIiwgXCJhc3NldHMvY2Fycm90LXNwcml0ZXMuanNvblwiKTtcbiAgICB9LFxuXG4gICAgLy8gQ3JlYXRlXG4gICAgY3JlYXRlOiBmdW5jdGlvbigpIHtcbiAgICAgIC8vIFNldCBiYWNrZ3JvdW5kXG4gICAgICB0aGlzLmdhbWUuc3RhZ2UuYmFja2dyb3VuZENvbG9yID0gXCIjYjhmNGJjXCI7XG5cbiAgICAgIC8vIFNldCBpbml0aWFsIGRpZmZpY3VsdHlcbiAgICAgIHRoaXMuc2V0RGlmZmljdWx0eSgpO1xuXG4gICAgICAvLyBTY29yaW5nXG4gICAgICB0aGlzLnNjb3JlQ29pbiA9IDEwMDtcbiAgICAgIHRoaXMuc2NvcmVCb29zdCA9IDUwMDtcbiAgICAgIHRoaXMuc2NvcmVCb3QgPSAxMDAwO1xuXG4gICAgICAvLyBTcGFjaW5nXG4gICAgICB0aGlzLnBhZGRpbmcgPSAxMDtcblxuICAgICAgLy8gSW5pdGlhbGl6ZSB0cmFja2luZyB2YXJpYWJsZXNcbiAgICAgIHRoaXMucmVzZXRWaWV3VHJhY2tpbmcoKTtcblxuICAgICAgLy8gU2NhbGluZ1xuICAgICAgdGhpcy5nYW1lLnNjYWxlLnNjYWxlTW9kZSA9IFBoYXNlci5TY2FsZU1hbmFnZXIuU0hPV19BTEw7XG4gICAgICB0aGlzLmdhbWUuc2NhbGUubWF4V2lkdGggPSB0aGlzLmdhbWUud2lkdGg7XG4gICAgICB0aGlzLmdhbWUuc2NhbGUubWF4SGVpZ2h0ID0gdGhpcy5nYW1lLmhlaWdodDtcbiAgICAgIHRoaXMuZ2FtZS5zY2FsZS5wYWdlQWxpZ25Ib3Jpem9udGFsbHkgPSB0cnVlO1xuICAgICAgdGhpcy5nYW1lLnNjYWxlLnBhZ2VBbGlnblZlcnRpY2FsbHkgPSB0cnVlO1xuXG4gICAgICAvLyBQaHlzaWNzXG4gICAgICB0aGlzLmdhbWUucGh5c2ljcy5zdGFydFN5c3RlbShQaGFzZXIuUGh5c2ljcy5BUkNBREUpO1xuICAgICAgdGhpcy5nYW1lLnBoeXNpY3MuYXJjYWRlLmdyYXZpdHkueSA9IDEwMDA7XG5cbiAgICAgIC8vIERldGVybWluZSB3aGVyZSBmaXJzdCBwbGF0Zm9ybSBhbmQgaGVybyB3aWxsIGJlXG4gICAgICB0aGlzLnN0YXJ0WSA9IHRoaXMuZ2FtZS5oZWlnaHQgLSA1O1xuICAgICAgdGhpcy5oZXJvID0gbmV3IHByZWZhYnMuSGVybyh0aGlzLmdhbWUsIDAsIDApO1xuICAgICAgdGhpcy5oZXJvLnJlc2V0UGxhY2VtZW50KHRoaXMuZ2FtZS53aWR0aCAqIDAuNSwgdGhpcy5zdGFydFkgLSB0aGlzLmhlcm8uaGVpZ2h0KTtcbiAgICAgIHRoaXMuZ2FtZS5hZGQuZXhpc3RpbmcodGhpcy5oZXJvKTtcblxuICAgICAgLy8gQ29udGFpbmVyc1xuICAgICAgdGhpcy5jb2lucyA9IHRoaXMuZ2FtZS5hZGQuZ3JvdXAoKTtcbiAgICAgIHRoaXMuYm9vc3RzID0gdGhpcy5nYW1lLmFkZC5ncm91cCgpO1xuICAgICAgdGhpcy5ib3RzID0gdGhpcy5nYW1lLmFkZC5ncm91cCgpO1xuXG4gICAgICAvLyBQbGF0Zm9ybXNcbiAgICAgIHRoaXMuYWRkUGxhdGZvcm1zKCk7XG5cbiAgICAgIC8vIEluaXRpYWxpemUgc2NvcmVcbiAgICAgIHRoaXMucmVzZXRTY29yZSgpO1xuICAgICAgdGhpcy51cGRhdGVTY29yZSgpO1xuXG4gICAgICAvLyBDdXJzb3JzLCBpbnB1dFxuICAgICAgdGhpcy5jdXJzb3JzID0gdGhpcy5nYW1lLmlucHV0LmtleWJvYXJkLmNyZWF0ZUN1cnNvcktleXMoKTtcbiAgICAgIHRoaXMuYWN0aW9uQnV0dG9uID0gdGhpcy5nYW1lLmlucHV0LmtleWJvYXJkLmFkZEtleShQaGFzZXIuS2V5Ym9hcmQuU1BBQ0VCQVIpO1xuICAgIH0sXG5cbiAgICAvLyBVcGRhdGVcbiAgICB1cGRhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgLy8gVGhpcyBpcyB3aGVyZSB0aGUgbWFpbiBtYWdpYyBoYXBwZW5zXG4gICAgICAvLyB0aGUgeSBvZmZzZXQgYW5kIHRoZSBoZWlnaHQgb2YgdGhlIHdvcmxkIGFyZSBhZGp1c3RlZFxuICAgICAgLy8gdG8gbWF0Y2ggdGhlIGhpZ2hlc3QgcG9pbnQgdGhlIGhlcm8gaGFzIHJlYWNoZWRcbiAgICAgIHRoaXMud29ybGQuc2V0Qm91bmRzKDAsIC10aGlzLmhlcm8ueUNoYW5nZSwgdGhpcy5nYW1lLndvcmxkLndpZHRoLFxuICAgICAgICB0aGlzLmdhbWUuaGVpZ2h0ICsgdGhpcy5oZXJvLnlDaGFuZ2UpO1xuXG4gICAgICAvLyBUaGUgYnVpbHQgaW4gY2FtZXJhIGZvbGxvdyBtZXRob2RzIHdvbid0IHdvcmsgZm9yIG91ciBuZWVkc1xuICAgICAgLy8gdGhpcyBpcyBhIGN1c3RvbSBmb2xsb3cgc3R5bGUgdGhhdCB3aWxsIG5vdCBldmVyIG1vdmUgZG93biwgaXQgb25seSBtb3ZlcyB1cFxuICAgICAgdGhpcy5jYW1lcmFZTWluID0gTWF0aC5taW4odGhpcy5jYW1lcmFZTWluLCB0aGlzLmhlcm8ueSAtIHRoaXMuZ2FtZS5oZWlnaHQgLyAyKTtcbiAgICAgIHRoaXMuY2FtZXJhLnkgPSB0aGlzLmNhbWVyYVlNaW47XG5cbiAgICAgIC8vIElmIGhlcm8gZmFsbHMgYmVsb3cgY2FtZXJhXG4gICAgICBpZiAodGhpcy5oZXJvLnkgPiB0aGlzLmNhbWVyYVlNaW4gKyB0aGlzLmdhbWUuaGVpZ2h0ICsgMjAwKSB7XG4gICAgICAgIHRoaXMuZ2FtZU92ZXIoKTtcbiAgICAgIH1cblxuICAgICAgLy8gTW92ZSBoZXJvXG4gICAgICB0aGlzLmhlcm8uYm9keS52ZWxvY2l0eS54ID1cbiAgICAgICAgKHRoaXMuY3Vyc29ycy5sZWZ0LmlzRG93bikgPyAtKHRoaXMuZ2FtZS5waHlzaWNzLmFyY2FkZS5ncmF2aXR5LnkgLyA1KSA6XG4gICAgICAgICh0aGlzLmN1cnNvcnMucmlnaHQuaXNEb3duKSA/ICh0aGlzLmdhbWUucGh5c2ljcy5hcmNhZGUuZ3Jhdml0eS55IC8gNSkgOiAwO1xuXG4gICAgICAvLyBQbGF0Zm9ybSBjb2xsaXNpb25zXG4gICAgICB0aGlzLmdhbWUucGh5c2ljcy5hcmNhZGUuY29sbGlkZSh0aGlzLmhlcm8sIHRoaXMucGxhdGZvcm1zLCB0aGlzLnVwZGF0ZUhlcm9QbGF0Zm9ybSwgbnVsbCwgdGhpcyk7XG4gICAgICB0aGlzLmdhbWUucGh5c2ljcy5hcmNhZGUuY29sbGlkZSh0aGlzLmhlcm8sIHRoaXMuYmFzZSwgdGhpcy51cGRhdGVIZXJvUGxhdGZvcm0sIG51bGwsIHRoaXMpO1xuXG4gICAgICAvLyBDb2luIGNvbGxpc2lvbnNcbiAgICAgIHRoaXMuZ2FtZS5waHlzaWNzLmFyY2FkZS5vdmVybGFwKHRoaXMuaGVybywgdGhpcy5jb2lucywgZnVuY3Rpb24oaGVybywgY29pbikge1xuICAgICAgICBjb2luLmtpbGwoKTtcbiAgICAgICAgdGhpcy51cGRhdGVTY29yZSh0aGlzLnNjb3JlQ29pbik7XG4gICAgICB9LCBudWxsLCB0aGlzKTtcblxuICAgICAgLy8gQm9vc3RzIGNvbGxpc2lvbnNcbiAgICAgIHRoaXMuZ2FtZS5waHlzaWNzLmFyY2FkZS5vdmVybGFwKHRoaXMuaGVybywgdGhpcy5ib29zdHMsIGZ1bmN0aW9uKGhlcm8sIGJvb3N0KSB7XG4gICAgICAgIGJvb3N0LmtpbGwoKTtcbiAgICAgICAgdGhpcy51cGRhdGVTY29yZSh0aGlzLnNjb3JlQm9vc3QpO1xuICAgICAgICBoZXJvLmJvZHkudmVsb2NpdHkueSA9IHRoaXMuZ2FtZS5waHlzaWNzLmFyY2FkZS5ncmF2aXR5LnkgKiAtMSAqIDEuNTtcbiAgICAgIH0sIG51bGwsIHRoaXMpO1xuXG4gICAgICAvLyBCb3R1bGlzbSBjb2xsaXNpb25zLiAgSWYgaGVyb2sganVtcHMgb24gdG9wLCB0aGVuIGtpbGwsIG90aGVyd2lzZSBkaWVcbiAgICAgIHRoaXMuZ2FtZS5waHlzaWNzLmFyY2FkZS5jb2xsaWRlKHRoaXMuaGVybywgdGhpcy5ib3RzLCBmdW5jdGlvbihoZXJvLCBib3QpIHtcbiAgICAgICAgaWYgKGhlcm8uYm9keS50b3VjaGluZy5kb3duKSB7XG4gICAgICAgICAgYm90LmtpbGwoKTtcbiAgICAgICAgICB0aGlzLnVwZGF0ZVNjb3JlKHRoaXMuc2NvcmVCb3QpO1xuICAgICAgICAgIGhlcm8uYm9keS52ZWxvY2l0eS55ID0gdGhpcy5nYW1lLnBoeXNpY3MuYXJjYWRlLmdyYXZpdHkueSAqIC0xICogMC41O1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIHRoaXMuZ2FtZU92ZXIoKTtcbiAgICAgICAgfVxuICAgICAgfSwgbnVsbCwgdGhpcyk7XG5cbiAgICAgIC8vIEZvciBlYWNoIHBsYXRmb3JtLCBmaW5kIG91dCB3aGljaCBpcyB0aGUgaGlnaGVzdFxuICAgICAgLy8gaWYgb25lIGdvZXMgYmVsb3cgdGhlIGNhbWVyYSB2aWV3LCB0aGVuIGNyZWF0ZSBhIG5ld1xuICAgICAgLy8gb25lIGF0IGEgZGlzdGFuY2UgZnJvbSB0aGUgaGlnaGVzdCBvbmVcbiAgICAgIC8vIHRoZXNlIGFyZSBwb29sZWQgc28gdGhleSBhcmUgdmVyeSBwZXJmb3JtYW50LlxuICAgICAgdGhpcy5wbGF0Zm9ybXMuZm9yRWFjaEFsaXZlKGZ1bmN0aW9uKHApIHtcbiAgICAgICAgdmFyIHBsYXRmb3JtO1xuICAgICAgICB0aGlzLnBsYXRmb3JtWU1pbiA9IE1hdGgubWluKHRoaXMucGxhdGZvcm1ZTWluLCBwLnkpO1xuXG4gICAgICAgIC8vIENoZWNrIGlmIHRoaXMgb25lIGlzIG9mIHRoZSBzY3JlZW5cbiAgICAgICAgaWYgKHAueSA+IHRoaXMuY2FtZXJhLnkgKyB0aGlzLmdhbWUuaGVpZ2h0KSB7XG4gICAgICAgICAgcC5raWxsKCk7XG4gICAgICAgICAgcGxhdGZvcm0gPSB0aGlzLnBsYXRmb3Jtcy5nZXRGaXJzdERlYWQoKTtcbiAgICAgICAgICB0aGlzLnBsYWNlUGxhdGZvcm0odGhpcy5wbGF0Zm9ybXMuZ2V0Rmlyc3REZWFkKCksIHRoaXMucGxhdGZvcm1zLmdldFRvcCgpKTtcbiAgICAgICAgfVxuICAgICAgfSwgdGhpcyk7XG5cbiAgICAgIC8vIFJlbW92ZSBhbnkgZmx1ZmZcbiAgICAgIFtcImNvaW5zXCIsIFwiYm9vc3RzXCIsIFwiYm90c1wiXS5mb3JFYWNoKF8uYmluZChmdW5jdGlvbihwb29sKSB7XG4gICAgICAgIHRoaXNbcG9vbF0uZm9yRWFjaEFsaXZlKGZ1bmN0aW9uKHApIHtcbiAgICAgICAgICAvLyBDaGVjayBpZiB0aGlzIG9uZSBpcyBvZiB0aGUgc2NyZWVuXG4gICAgICAgICAgaWYgKHAueSA+IHRoaXMuY2FtZXJhLnkgKyB0aGlzLmdhbWUuaGVpZ2h0KSB7XG4gICAgICAgICAgICBwLmtpbGwoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0sIHRoaXMpO1xuICAgICAgfSwgdGhpcykpO1xuXG4gICAgICAvLyBVcGRhdGUgc2NvcmVcbiAgICAgIHRoaXMudXBkYXRlU2NvcmUoKTtcblxuICAgICAgLy8gVXBkYXRlIGRpZmZpY3VsdFxuICAgICAgdGhpcy5zZXREaWZmaWN1bHR5KCk7XG4gICAgfSxcblxuICAgIC8vIFBsYXRmb3JtIGNvbGxpc2lvblxuICAgIHVwZGF0ZUhlcm9QbGF0Zm9ybTogZnVuY3Rpb24oaGVybykge1xuICAgICAgaGVyby5ib2R5LnZlbG9jaXR5LnkgPSB0aGlzLmdhbWUucGh5c2ljcy5hcmNhZGUuZ3Jhdml0eS55ICogLTEgKiAwLjc7XG4gICAgfSxcblxuICAgIC8vIFNodXRkb3duXG4gICAgc2h1dGRvd246IGZ1bmN0aW9uKCkge1xuICAgICAgLy8gUmVzZXQgZXZlcnl0aGluZywgb3IgdGhlIHdvcmxkIHdpbGwgYmUgbWVzc2VkIHVwXG4gICAgICB0aGlzLndvcmxkLnNldEJvdW5kcygwLCAwLCB0aGlzLmdhbWUud2lkdGgsIHRoaXMuZ2FtZS5oZWlnaHQpO1xuICAgICAgdGhpcy5jdXJzb3IgPSBudWxsO1xuICAgICAgdGhpcy5yZXNldFZpZXdUcmFja2luZygpO1xuICAgICAgdGhpcy5yZXNldFNjb3JlKCk7XG5cbiAgICAgIFtcImhlcm9cIiwgXCJwbGF0Zm9ybXNcIiwgXCJjb2luc1wiLCBcImJvb3N0c1wiLCBcInNjb3JlR3JvdXBcIl0uZm9yRWFjaChfLmJpbmQoZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICB0aGlzW2l0ZW1dLmRlc3Ryb3koKTtcbiAgICAgICAgdGhpc1tpdGVtXSA9IG51bGw7XG4gICAgICB9LCB0aGlzKSk7XG4gICAgfSxcblxuICAgIC8vIEdhbWUgb3ZlclxuICAgIGdhbWVPdmVyOiBmdW5jdGlvbigpIHtcbiAgICAgIC8vIENhbid0IHNlZW0gdG8gZmluZCBhIHdheSB0byBwYXNzIHRoZSBzY29yZVxuICAgICAgLy8gdmlhIGEgc3RhdGUgY2hhbmdlLlxuICAgICAgdGhpcy5nYW1lLnBpY2tsZS5zY29yZSA9IHRoaXMuc2NvcmU7XG4gICAgICB0aGlzLmdhbWUuc3RhdGUuc3RhcnQoXCJnYW1lb3ZlclwiKTtcbiAgICB9LFxuXG4gICAgLy8gQWRkIHBsYXRmb3JtIHBvb2wgYW5kIGNyZWF0ZSBpbml0aWFsIG9uZVxuICAgIGFkZFBsYXRmb3JtczogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnBsYXRmb3JtcyA9IHRoaXMuZ2FtZS5hZGQuZ3JvdXAoKTtcblxuICAgICAgLy8gQWRkIGZpcnN0IHBsYXRmb3JtLiAgVE9ETzogQ2hhbmdlIHRvIGl0cyBvd24gcHJlZmFiLCBzcHJpdGVcbiAgICAgIHRoaXMuYmFzZSA9IG5ldyBwcmVmYWJzLlBsYXRmb3JtKHRoaXMuZ2FtZSwgdGhpcy5nYW1lLndpZHRoICogMC41LCB0aGlzLnN0YXJ0WSwgdGhpcy5nYW1lLndpZHRoICogMik7XG4gICAgICB0aGlzLmdhbWUuYWRkLmV4aXN0aW5nKHRoaXMuYmFzZSk7XG5cbiAgICAgIC8vIEFkZCBzb21lIGJhc2UgcGxhdGZvcm1zXG4gICAgICB2YXIgcHJldmlvdXM7XG4gICAgICBfLmVhY2goXy5yYW5nZSgyMCksIF8uYmluZChmdW5jdGlvbihpKSB7XG4gICAgICAgIHZhciBwID0gbmV3IHByZWZhYnMuUGxhdGZvcm0odGhpcy5nYW1lLCAwLCAwKTtcbiAgICAgICAgdGhpcy5wbGFjZVBsYXRmb3JtKHAsIHByZXZpb3VzLCB0aGlzLndvcmxkLmhlaWdodCAtIHRoaXMucGxhdGZvcm1TcGFjZVkgLSB0aGlzLnBsYXRmb3JtU3BhY2VZICogaSk7XG4gICAgICAgIHRoaXMucGxhdGZvcm1zLmFkZChwKTtcbiAgICAgICAgcHJldmlvdXMgPSBwO1xuICAgICAgfSwgdGhpcykpO1xuICAgIH0sXG5cbiAgICAvLyBQbGFjZSBwbGF0Zm9ybVxuICAgIHBsYWNlUGxhdGZvcm06IGZ1bmN0aW9uKHBsYXRmb3JtLCBwcmV2aW91c1BsYXRmb3JtLCBvdmVycmlkZVkpIHtcbiAgICAgIHBsYXRmb3JtLnJlc2V0U2V0dGluZ3MoKTtcbiAgICAgIHZhciB5ID0gb3ZlcnJpZGVZIHx8IHRoaXMucGxhdGZvcm1ZTWluIC0gdGhpcy5wbGF0Zm9ybVNwYWNlWTtcbiAgICAgIHZhciBtaW5YID0gcGxhdGZvcm0ubWluWDtcbiAgICAgIHZhciBtYXhYID0gcGxhdGZvcm0ubWF4WDtcblxuICAgICAgLy8gRGV0ZXJtaW5lIHggYmFzZWQgb24gcHJldmlvdXNQbGF0Zm9ybVxuICAgICAgdmFyIHggPSB0aGlzLnJuZC5pbnRlZ2VySW5SYW5nZShtaW5YLCBtYXhYKTtcbiAgICAgIGlmIChwcmV2aW91c1BsYXRmb3JtKSB7XG4gICAgICAgIHggPSB0aGlzLnJuZC5pbnRlZ2VySW5SYW5nZShwcmV2aW91c1BsYXRmb3JtLnggLSB0aGlzLnBsYXRmb3JtR2FwTWF4LCBwcmV2aW91c1BsYXRmb3JtLnggKyB0aGlzLnBsYXRmb3JtR2FwTWF4KTtcblxuICAgICAgICAvLyBTb21lIGxvZ2ljIHRvIHRyeSB0byB3cmFwXG4gICAgICAgIHggPSAoeCA8IDApID8gTWF0aC5taW4obWF4WCwgdGhpcy53b3JsZC53aWR0aCArIHgpIDogTWF0aC5tYXgoeCwgbWluWCk7XG4gICAgICAgIHggPSAoeCA+IHRoaXMud29ybGQud2lkdGgpID8gTWF0aC5tYXgobWluWCwgeCAtIHRoaXMud29ybGQud2lkdGgpIDogTWF0aC5taW4oeCwgbWF4WCk7XG4gICAgICB9XG5cbiAgICAgIC8vIFBsYWNlXG4gICAgICBwbGF0Zm9ybS5yZXNldCh4LCB5KTtcblxuICAgICAgLy8gQWRkIHNvbWUgZmx1ZmZcbiAgICAgIHRoaXMuZmx1ZmZQbGF0Zm9ybShwbGF0Zm9ybSk7XG4gICAgfSxcblxuICAgIC8vIEFkZCBwb3NzaWJsZSBmbHVmZiB0byBwbGF0Zm9ybVxuICAgIGZsdWZmUGxhdGZvcm06IGZ1bmN0aW9uKHBsYXRmb3JtKSB7XG4gICAgICB2YXIgeCA9IHBsYXRmb3JtLng7XG4gICAgICB2YXIgeSA9IHBsYXRmb3JtLnkgLSBwbGF0Zm9ybS5oZWlnaHQgLyAyIC0gMzA7XG5cbiAgICAgIC8vIEFkZCBmbHVmZlxuICAgICAgaWYgKE1hdGgucmFuZG9tKCkgPD0gdGhpcy5ob3ZlckNoYW5jZSkge1xuICAgICAgICBwbGF0Zm9ybS5ob3ZlciA9IHRydWU7XG4gICAgICB9XG4gICAgICBlbHNlIGlmIChNYXRoLnJhbmRvbSgpIDw9IHRoaXMuY29pbkNoYW5jZSkge1xuICAgICAgICB0aGlzLmFkZFdpdGhQb29sKHRoaXMuY29pbnMsIFwiQ29pblwiLCB4LCB5KTtcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKE1hdGgucmFuZG9tKCkgPD0gdGhpcy5ib29zdENoYW5jZSkge1xuICAgICAgICB0aGlzLmFkZFdpdGhQb29sKHRoaXMuYm9vc3RzLCBcIkJvb3N0XCIsIHgsIHkpO1xuICAgICAgfVxuICAgICAgZWxzZSBpZiAoTWF0aC5yYW5kb20oKSA8PSB0aGlzLmJvdENoYW5jZSkge1xuICAgICAgICB0aGlzLmFkZFdpdGhQb29sKHRoaXMuYm90cywgXCJCb3R1bGlzbVwiLCB4LCB5KTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLy8gR2VuZXJpYyBhZGQgd2l0aCBwb29saW5nIGZ1bmN0aW9uYWxsaXR5XG4gICAgYWRkV2l0aFBvb2w6IGZ1bmN0aW9uKHBvb2wsIHByZWZhYiwgeCwgeSkge1xuICAgICAgdmFyIG8gPSBwb29sLmdldEZpcnN0RGVhZCgpO1xuICAgICAgbyA9IG8gfHwgbmV3IHByZWZhYnNbcHJlZmFiXSh0aGlzLmdhbWUsIHgsIHkpO1xuXG4gICAgICAvLyBVc2UgY3VzdG9tIHJlc2V0IGlmIGF2YWlsYWJsZVxuICAgICAgaWYgKG8ucmVzZXRQbGFjZW1lbnQpIHtcbiAgICAgICAgby5yZXNldFBsYWNlbWVudCh4LCB5KTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICBvLnJlc2V0KHgsIHkpO1xuICAgICAgfVxuXG4gICAgICBwb29sLmFkZChvKTtcbiAgICB9LFxuXG4gICAgLy8gVXBkYXRlIHNjb3JlLiAgU2NvcmUgaXMgdGhlIHNjb3JlIHdpdGhvdXQgaG93IGZhciB0aGV5IGhhdmUgZ29uZSB1cC5cbiAgICB1cGRhdGVTY29yZTogZnVuY3Rpb24oYWRkaXRpb24pIHtcbiAgICAgIGFkZGl0aW9uID0gYWRkaXRpb24gfHwgMDtcbiAgICAgIHRoaXMuc2NvcmVVcCA9ICgtdGhpcy5jYW1lcmFZTWluID49IDk5OTk5OTkpID8gMCA6XG4gICAgICAgIE1hdGgubWluKE1hdGgubWF4KDAsIC10aGlzLmNhbWVyYVlNaW4pLCA5OTk5OTk5IC0gMSk7XG4gICAgICB0aGlzLnNjb3JlQ29sbGVjdCA9ICh0aGlzLnNjb3JlQ29sbGVjdCB8fCAwKSArIGFkZGl0aW9uO1xuICAgICAgdGhpcy5zY29yZSA9IE1hdGgucm91bmQodGhpcy5zY29yZVVwICsgdGhpcy5zY29yZUNvbGxlY3QpO1xuXG4gICAgICAvLyBTY29yZSB0ZXh0XG4gICAgICBpZiAoIXRoaXMuc2NvcmVHcm91cCkge1xuICAgICAgICB0aGlzLnNjb3JlR3JvdXAgPSB0aGlzLmdhbWUuYWRkLmdyb3VwKCk7XG5cbiAgICAgICAgLy8gU2NvcmUgbGFiZWxcbiAgICAgICAgdGhpcy5zY29yZUxhYmVsSW1hZ2UgPSB0aGlzLmdhbWUuYWRkLnNwcml0ZShcbiAgICAgICAgICB0aGlzLnBhZGRpbmcsXG4gICAgICAgICAgdGhpcy5wYWRkaW5nICogMC44NSwgXCJnYW1lLXNwcml0ZXNcIiwgXCJ5b3VyLXNjb3JlLnBuZ1wiKTtcbiAgICAgICAgdGhpcy5zY29yZUxhYmVsSW1hZ2UuYW5jaG9yLnNldFRvKDAsIDApO1xuICAgICAgICB0aGlzLnNjb3JlTGFiZWxJbWFnZS5zY2FsZS5zZXRUbygodGhpcy5nYW1lLndpZHRoIC8gNikgLyB0aGlzLnNjb3JlTGFiZWxJbWFnZS53aWR0aCk7XG4gICAgICAgIHRoaXMuc2NvcmVHcm91cC5hZGQodGhpcy5zY29yZUxhYmVsSW1hZ2UpO1xuXG4gICAgICAgIC8vIFNjb3JlIHRleHRcbiAgICAgICAgdGhpcy5zY29yZVRleHQgPSB0aGlzLmdhbWUuYWRkLnRleHQoXG4gICAgICAgICAgdGhpcy5zY29yZUxhYmVsSW1hZ2Uud2lkdGggKyAodGhpcy5wYWRkaW5nICogMiksXG4gICAgICAgICAgdGhpcy5wYWRkaW5nICogMC4yNSxcbiAgICAgICAgICB0aGlzLnNjb3JlLnRvTG9jYWxlU3RyaW5nKCksIHtcbiAgICAgICAgICAgIGZvbnQ6IFwiYm9sZCBcIiArICh0aGlzLmdhbWUud29ybGQuaGVpZ2h0IC8gNDApICsgXCJweCBEb3Npc1wiLFxuICAgICAgICAgICAgZmlsbDogXCIjMzliNTRhXCIsXG4gICAgICAgICAgICBhbGlnbjogXCJsZWZ0XCIsXG4gICAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuc2NvcmVUZXh0LmFuY2hvci5zZXRUbygwLCAwKTtcbiAgICAgICAgdGhpcy5zY29yZUdyb3VwLmFkZCh0aGlzLnNjb3JlVGV4dCk7XG5cbiAgICAgICAgdGhpcy5zY29yZUdyb3VwLmZpeGVkVG9DYW1lcmEgPSB0cnVlO1xuICAgICAgICB0aGlzLnNjb3JlR3JvdXAuY2FtZXJhT2Zmc2V0LnNldFRvKHRoaXMucGFkZGluZywgdGhpcy5wYWRkaW5nKTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICB0aGlzLnNjb3JlVGV4dC50ZXh0ID0gdGhpcy5zY29yZS50b0xvY2FsZVN0cmluZygpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICAvLyBSZXNldCBzY29yZVxuICAgIHJlc2V0U2NvcmU6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zY29yZVVwID0gMDtcbiAgICAgIHRoaXMuc2NvcmVDb2xsZWN0ID0gMDtcbiAgICAgIHRoaXMuc2NvcmUgPSAwO1xuICAgIH0sXG5cbiAgICAvLyBSZXNldCB2aWV3IHRyYWNraW5nXG4gICAgcmVzZXRWaWV3VHJhY2tpbmc6IGZ1bmN0aW9uKCkge1xuICAgICAgLy8gQ2FtZXJhIGFuZCBwbGF0Zm9ybSB0cmFja2luZyB2YXJzXG4gICAgICB0aGlzLmNhbWVyYVlNaW4gPSA5OTk5OTk5O1xuICAgICAgdGhpcy5wbGF0Zm9ybVlNaW4gPSA5OTk5OTk5O1xuICAgIH0sXG5cbiAgICAvLyBHZW5lcmFsIHRvdWNoaW5nXG4gICAgaXNUb3VjaGluZzogZnVuY3Rpb24oYm9keSkge1xuICAgICAgaWYgKGJvZHkgJiYgYm9keS50b3VjaCkge1xuICAgICAgICByZXR1cm4gKGJvZHkudG91Y2hpbmcudXAgfHwgYm9keS50b3VjaGluZy5kb3duIHx8XG4gICAgICAgICAgYm9keS50b3VjaGluZy5sZWZ0IHx8IGJvZHkudG91Y2hpbmcucmlnaHQpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSxcblxuICAgIC8vIERldGVybWluZSBkaWZmaWN1bHR5XG4gICAgc2V0RGlmZmljdWx0eTogZnVuY3Rpb24oKSB7XG4gICAgICAvLyBJbml0aWFsIHN0YXRlXG4gICAgICB0aGlzLnBsYXRmb3JtU3BhY2VZID0gMTEwO1xuICAgICAgdGhpcy5wbGF0Zm9ybUdhcE1heCA9IDIwMDtcbiAgICAgIHRoaXMuaG92ZXJDaGFuY2UgPSAwLjE7XG4gICAgICB0aGlzLmNvaW5DaGFuY2UgPSAwLjM7XG4gICAgICB0aGlzLmJvb3N0Q2hhbmNlID0gMC4zO1xuICAgICAgdGhpcy5ib3RDaGFuY2UgPSAwLjA7XG5cbiAgICAgIC8vIEluaXRpbGEgcGh5c2ljcyB0aW1lXG4gICAgICAvL3RoaXMuZ2FtZS50aW1lLnNsb3dNb3Rpb24gPSAxO1xuXG4gICAgICAvLyBEZWZhdWx0XG4gICAgICBpZiAodGhpcy5jYW1lcmFZTWluID4gLXRoaXMuZ2FtZS5oZWlnaHQpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG5cbiAgICAgIC8vIEZpcnN0IGxldmVsXG4gICAgICBlbHNlIGlmICh0aGlzLmNhbWVyYVlNaW4gPiAtMTAwMDApIHtcbiAgICAgICAgdGhpcy5ob3ZlckNoYW5jZSA9IDAuMjtcbiAgICAgICAgdGhpcy5jb2luQ2hhbmNlID0gMC4zO1xuICAgICAgICB0aGlzLmJvb3N0Q2hhbmNlID0gMC4zO1xuICAgICAgICB0aGlzLmJvdENoYW5jZSA9IDAuMTtcbiAgICAgIH1cblxuICAgICAgLy8gU2Vjb25kIGxldmVsXG4gICAgICBlbHNlIGlmICh0aGlzLmNhbWVyYVlNaW4gPiAtMjAwMDApIHtcbiAgICAgICAgdGhpcy5ob3ZlckNoYW5jZSA9IDAuMztcbiAgICAgICAgdGhpcy5jb2luQ2hhbmNlID0gMC4zO1xuICAgICAgICB0aGlzLmJvb3N0Q2hhbmNlID0gMC40O1xuICAgICAgICB0aGlzLmJvdENoYW5jZSA9IDAuMjtcbiAgICAgICAgdGhpcy5nYW1lLnN0YWdlLmJhY2tncm91bmRDb2xvciA9IFwiIzhDRUU5NFwiO1xuICAgICAgfVxuXG4gICAgICAvLyBUaGlyZCBsZXZlbFxuICAgICAgZWxzZSBpZiAodGhpcy5jYW1lcmFZTWluID4gLTMwMDAwKSB7XG4gICAgICAgIHRoaXMuaG92ZXJDaGFuY2UgPSAwLjQ7XG4gICAgICAgIHRoaXMuY29pbkNoYW5jZSA9IDAuMjtcbiAgICAgICAgdGhpcy5ib29zdENoYW5jZSA9IDAuNDtcbiAgICAgICAgdGhpcy5ib3RDaGFuY2UgPSAwLjM7XG4gICAgICAgIHRoaXMuZ2FtZS5zdGFnZS5iYWNrZ3JvdW5kQ29sb3IgPSBcIiM1RkU3NkJcIjtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuXG4gIC8vIEV4cG9ydFxuICBtb2R1bGUuZXhwb3J0cyA9IFBsYXk7XG59KSgpO1xuIl19
