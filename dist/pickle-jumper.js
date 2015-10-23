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
    Phaser.Sprite.call(this, game, x, y, "play-sprites", "dill.png");

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
    Phaser.Sprite.call(this, game, x, y, "play-sprites", "botchy.png");

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
    Phaser.Sprite.call(this, game, x, y, "play-sprites", "magicdill.png");

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
    Phaser.Sprite.call(this, game, x, y, "play-sprites", "pickle.png");

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
    Phaser.Sprite.call(this, game, x, y, "play-sprites", "dillybean.png");

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
      this.game.load.image("gameover", "assets/gameover.png");
      this.game.load.image("play", "assets/title-play.png");
      this.game.load.image("your-score", "assets/your-score.png");
    },

    // Create
    create: function() {
      // Set background
      this.game.stage.backgroundColor = "#8cc63f";

      // Place title
      this.titleImage = this.game.add.sprite(this.game.width / 2, this.padding * 3, "gameover");
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
      this.replayImage = this.game.add.sprite(this.game.width - this.padding * 2, this.game.height - this.padding * 2, "play");
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
        this.titleImage.height + (this.padding * 7.5), "your-score");
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
      this.game.load.image("title", "assets/title.png");
      this.game.load.image("play", "assets/title-play.png");
    },

    // Create
    create: function() {
      // Set background
      this.game.stage.backgroundColor = "#b8f4bc";

      // Place title
      this.titleImage = this.game.add.sprite(this.game.width / 2, this.padding * 3, "title");
      this.titleImage.anchor.setTo(0.5, 0);
      this.titleImage.scale.setTo((this.game.width - (this.padding * 2)) / this.titleImage.width);
      this.game.add.existing(this.titleImage);

      // Place play
      this.playImage = this.game.add.sprite(this.game.width / 2, this.game.height - this.padding * 3, "play");
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
      this.game.load.atlas("play-sprites", "assets/determined-dill-sprites.png", "assets/determined-dill-sprites.json");
    },

    // Create
    create: function() {
      // Set background
      this.game.stage.backgroundColor = "#b8f4bc";

      //this.game.time.slowMotion = 0.2;

      // Config for difficulty
      this.platformSpaceY = 110;
      this.platformGapMax = 200;
      this.hoverChance = 0.3;
      this.coinChance = 0.3;
      this.boostChance = 0.3;
      this.botChance = 0.1;

      // Scoring
      this.scoreCoin = 100;
      this.scoreBoost = 300;
      this.scoreBot = 500;

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
          this.padding * 0.85, "play-sprites", "your-score.png");
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
    }
  });

  // Export
  module.exports = Play;
})();

},{"./prefab-boost.js":2,"./prefab-botulism.js":3,"./prefab-coin.js":4,"./prefab-hero.js":5,"./prefab-platform.js":6}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy96em9sby9Db2RlL3BlcnNvbmFsL3BpY2tsZS1qdW1wZXIvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIi9Vc2Vycy96em9sby9Db2RlL3BlcnNvbmFsL3BpY2tsZS1qdW1wZXIvanMvZmFrZV82M2ZiNTJjLmpzIiwiL1VzZXJzL3p6b2xvL0NvZGUvcGVyc29uYWwvcGlja2xlLWp1bXBlci9qcy9waWNrbGUtanVtcGVyL3ByZWZhYi1ib29zdC5qcyIsIi9Vc2Vycy96em9sby9Db2RlL3BlcnNvbmFsL3BpY2tsZS1qdW1wZXIvanMvcGlja2xlLWp1bXBlci9wcmVmYWItYm90dWxpc20uanMiLCIvVXNlcnMvenpvbG8vQ29kZS9wZXJzb25hbC9waWNrbGUtanVtcGVyL2pzL3BpY2tsZS1qdW1wZXIvcHJlZmFiLWNvaW4uanMiLCIvVXNlcnMvenpvbG8vQ29kZS9wZXJzb25hbC9waWNrbGUtanVtcGVyL2pzL3BpY2tsZS1qdW1wZXIvcHJlZmFiLWhlcm8uanMiLCIvVXNlcnMvenpvbG8vQ29kZS9wZXJzb25hbC9waWNrbGUtanVtcGVyL2pzL3BpY2tsZS1qdW1wZXIvcHJlZmFiLXBsYXRmb3JtLmpzIiwiL1VzZXJzL3p6b2xvL0NvZGUvcGVyc29uYWwvcGlja2xlLWp1bXBlci9qcy9waWNrbGUtanVtcGVyL3N0YXRlLWdhbWVvdmVyLmpzIiwiL1VzZXJzL3p6b2xvL0NvZGUvcGVyc29uYWwvcGlja2xlLWp1bXBlci9qcy9waWNrbGUtanVtcGVyL3N0YXRlLW1lbnUuanMiLCIvVXNlcnMvenpvbG8vQ29kZS9wZXJzb25hbC9waWNrbGUtanVtcGVyL2pzL3BpY2tsZS1qdW1wZXIvc3RhdGUtcGxheS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzVUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyogZ2xvYmFsIF86ZmFsc2UsICQ6ZmFsc2UsIFBoYXNlcjpmYWxzZSAqL1xuXG4vKipcbiAqIE1haW4gSlMgZm9yIFBpY2tsZSBKdW1wZXJcbiAqL1xuXG4oZnVuY3Rpb24oKSB7XG4gIFwidXNlIHN0cmljdFwiO1xuXG4gIC8vIERlcGVuZGVuY2llc1xuICB2YXIgc3RhdGVzID0ge1xuICAgIEdhbWVvdmVyOiByZXF1aXJlKFwiLi9waWNrbGUtanVtcGVyL3N0YXRlLWdhbWVvdmVyLmpzXCIpLFxuICAgIFBsYXk6IHJlcXVpcmUoXCIuL3BpY2tsZS1qdW1wZXIvc3RhdGUtcGxheS5qc1wiKSxcbiAgICBNZW51OiByZXF1aXJlKFwiLi9waWNrbGUtanVtcGVyL3N0YXRlLW1lbnUuanNcIiksXG4gIH07XG5cbiAgLy8gQ29uc3RydWN0b3JlIGZvciBQaWNrbGVcbiAgdmFyIFBpY2tsZSA9IHdpbmRvdy5QaWNrbGUgPSBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcbiAgICB0aGlzLmVsID0gdGhpcy5vcHRpb25zLmVsO1xuICAgIHRoaXMuJGVsID0gJCh0aGlzLm9wdGlvbnMuZWwpO1xuICAgIHRoaXMuJCA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuICQob3B0aW9ucy5lbCkuZmluZDtcbiAgICB9O1xuXG4gICAgdGhpcy53aWR0aCA9IHRoaXMuJGVsLndpZHRoKCk7XG4gICAgdGhpcy5oZWlnaHQgPSAkKHdpbmRvdykuaGVpZ2h0KCk7XG5cbiAgICAvLyBTdGFydFxuICAgIHRoaXMuc3RhcnQoKTtcbiAgfTtcblxuICAvLyBBZGQgcHJvcGVydGllc1xuICBfLmV4dGVuZChQaWNrbGUucHJvdG90eXBlLCB7XG4gICAgLy8gU3RhcnQgZXZlcnl0aGluZ1xuICAgIHN0YXJ0OiBmdW5jdGlvbigpIHtcbiAgICAgIC8vIENyZWF0ZSBQaGFzZXIgZ2FtZVxuICAgICAgdGhpcy5nYW1lID0gbmV3IFBoYXNlci5HYW1lKFxuICAgICAgICB0aGlzLndpZHRoLFxuICAgICAgICB0aGlzLmhlaWdodCxcbiAgICAgICAgUGhhc2VyLkFVVE8sXG4gICAgICAgIHRoaXMuZWwucmVwbGFjZShcIiNcIiwgXCJcIikpO1xuXG4gICAgICAvLyBBZGQgcmVmZXJlbmNlIHRvIGdhbWUsIHNpbmNlIG1vc3QgcGFydHMgaGF2ZSB0aGlzIHJlZmVyZW5jZVxuICAgICAgLy8gYWxyZWFkeVxuICAgICAgdGhpcy5nYW1lLnBpY2tsZSA9IHRoaXM7XG5cbiAgICAgIC8vIFJlZ2lzdGVyIHN0YXRlc1xuICAgICAgdGhpcy5nYW1lLnN0YXRlLmFkZChcIm1lbnVcIiwgc3RhdGVzLk1lbnUpO1xuICAgICAgdGhpcy5nYW1lLnN0YXRlLmFkZChcInBsYXlcIiwgc3RhdGVzLlBsYXkpO1xuICAgICAgdGhpcy5nYW1lLnN0YXRlLmFkZChcImdhbWVvdmVyXCIsIHN0YXRlcy5HYW1lb3Zlcik7XG5cbiAgICAgIC8vIEhpZ2hzY29yZVxuICAgICAgdGhpcy5oaWdoc2NvcmVMaW1pdCA9IDEwO1xuICAgICAgdGhpcy5nZXRIaWdoc2NvcmVzKCk7XG5cbiAgICAgIC8vIFN0YXJ0IHdpdGggbWVudVxuICAgICAgdGhpcy5nYW1lLnN0YXRlLnN0YXJ0KFwibWVudVwiKTtcblxuICAgICAgLy8gRGVidWdcbiAgICAgIGlmICh0aGlzLm9wdGlvbnMuZGVidWcgJiYgdGhpcy5nYW1lLmNhbWVyYSkge1xuICAgICAgICB0aGlzLmdhbWUuZGVidWcuY2FtZXJhSW5mbyh0aGlzLmdhbWUuY2FtZXJhLCAxMCwgMTApO1xuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5vcHRpb25zLmRlYnVnKSB7XG4gICAgICAgIHRoaXMucmVzZXRIaWdoc2NvcmVzKCk7XG4gICAgICAgIHRoaXMuZ2V0SGlnaHNjb3JlcygpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICAvLyBHZXQgaGlnaCBzY29yZXNcbiAgICBnZXRIaWdoc2NvcmVzOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBzID0gd2luZG93LmxvY2FsU3RvcmFnZS5nZXRJdGVtKFwiaGlnaHNjb3Jlc1wiKTtcbiAgICAgIHMgPSAocykgPyBKU09OLnBhcnNlKHMpIDogW107XG4gICAgICB0aGlzLmhpZ2hzY29yZXMgPSBzO1xuICAgICAgdGhpcy5zb3J0SGlnaHNjb3JlcygpO1xuICAgICAgcmV0dXJuIHRoaXMuaGlnaHNjb3JlcztcbiAgICB9LFxuXG4gICAgLy8gR2V0IGhpZ2hlc3Qgc2NvcmVcbiAgICBnZXRIaWdoc2NvcmU6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIF8ubWF4KHRoaXMuaGlnaHNjb3JlcywgXCJzY29yZVwiKTtcbiAgICB9LFxuXG4gICAgLy8gU2V0IHNpbmdsZSBoaWdoc2NvcmVcbiAgICBzZXRIaWdoc2NvcmU6IGZ1bmN0aW9uKHNjb3JlLCBuYW1lKSB7XG4gICAgICBpZiAodGhpcy5pc0hpZ2hzY29yZShzY29yZSkpIHtcbiAgICAgICAgdGhpcy5zb3J0SGlnaHNjb3JlcygpO1xuXG4gICAgICAgIC8vIFJlbW92ZSBsb3dlc3Qgb25lIGlmIG5lZWRlZFxuICAgICAgICBpZiAodGhpcy5oaWdoc2NvcmVzLmxlbmd0aCA+PSB0aGlzLmhpZ2hzY29yZUxpbWl0KSB7XG4gICAgICAgICAgdGhpcy5oaWdoc2NvcmVzLnNoaWZ0KCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBBZGQgbmV3IHNjb3JlXG4gICAgICAgIHRoaXMuaGlnaHNjb3Jlcy5wdXNoKHtcbiAgICAgICAgICBuYW1lOiBuYW1lLFxuICAgICAgICAgIHNjb3JlOiBzY29yZVxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBTb3J0IGFuZCBzZXRcbiAgICAgICAgdGhpcy5zb3J0SGlnaHNjb3JlcygpO1xuICAgICAgICB0aGlzLnNldEhpZ2hzY29yZXMoKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLy8gU29ydCBoaWdoc2NvcmVzXG4gICAgc29ydEhpZ2hzY29yZXM6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5oaWdoc2NvcmVzID0gXy5zb3J0QnkodGhpcy5oaWdoc2NvcmVzLCBcInNjb3JlXCIpO1xuICAgIH0sXG5cbiAgICAvLyBJcyBoaWdoc2NvcmUuICBJcyB0aGUgc2NvcmUgaGlnaGVyIHRoYW4gdGhlIGxvd2VzdFxuICAgIC8vIHJlY29yZGVkIHNjb3JlXG4gICAgaXNIaWdoc2NvcmU6IGZ1bmN0aW9uKHNjb3JlKSB7XG4gICAgICB2YXIgbWluID0gXy5taW4odGhpcy5oaWdoc2NvcmVzLCBcInNjb3JlXCIpLnNjb3JlO1xuICAgICAgcmV0dXJuIChzY29yZSA+IG1pbiB8fCB0aGlzLmhpZ2hzY29yZXMubGVuZ3RoIDwgdGhpcy5oaWdoc2NvcmVMaW1pdCk7XG4gICAgfSxcblxuICAgIC8vIENoZWNrIGlmIHNjb3JlIGlzIGhpZ2hlc3Qgc2NvcmVcbiAgICBpc0hpZ2hlc3RTY29yZTogZnVuY3Rpb24oc2NvcmUpIHtcbiAgICAgIHZhciBtYXggPSBfLm1heCh0aGlzLmhpZ2hzY29yZXMsIFwic2NvcmVcIikuc2NvcmUgfHwgMDtcbiAgICAgIHJldHVybiAoc2NvcmUgPiBtYXgpO1xuICAgIH0sXG5cbiAgICAvLyBTZXQgaGlnaHNjb3Jlc1xuICAgIHNldEhpZ2hzY29yZXM6IGZ1bmN0aW9uKCkge1xuICAgICAgd2luZG93LmxvY2FsU3RvcmFnZS5zZXRJdGVtKFwiaGlnaHNjb3Jlc1wiLCBKU09OLnN0cmluZ2lmeSh0aGlzLmhpZ2hzY29yZXMpKTtcbiAgICB9LFxuXG4gICAgLy8gUmVzZXQgaGlnaHNjaG9yZXNcbiAgICByZXNldEhpZ2hzY29yZXM6IGZ1bmN0aW9uKCkge1xuICAgICAgd2luZG93LmxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKFwiaGlnaHNjb3Jlc1wiKTtcbiAgICB9XG4gIH0pO1xuXG4gIC8vIENyZWF0ZSBhcHBcbiAgdmFyIHA7XG4gIHAgPSBuZXcgUGlja2xlKHtcbiAgICBlbDogXCIjcGlja2xlLWp1bXBlclwiLFxuICAgIGRlYnVnOiBmYWxzZVxuICB9KTtcbn0pKCk7XG4iLCIvKiBnbG9iYWwgXzpmYWxzZSwgUGhhc2VyOmZhbHNlICovXG5cbi8qKlxuICogUHJlZmFiIChvYmplY3RzKSBib29zdCBmb3IgcGxhdGZvcm1zXG4gKi9cblxuKGZ1bmN0aW9uKCkge1xuICBcInVzZSBzdHJpY3RcIjtcblxuICAvLyBDb25zdHJ1Y3RvciBmb3IgQm9vc3RcbiAgdmFyIEJvb3N0ID0gZnVuY3Rpb24oZ2FtZSwgeCwgeSkge1xuICAgIC8vIENhbGwgZGVmYXVsdCBzcHJpdGVcbiAgICBQaGFzZXIuU3ByaXRlLmNhbGwodGhpcywgZ2FtZSwgeCwgeSwgXCJwbGF5LXNwcml0ZXNcIiwgXCJkaWxsLnBuZ1wiKTtcblxuICAgIC8vIFNpemVcbiAgICB0aGlzLmFuY2hvci5zZXRUbygwLjUsIDAuNSk7XG4gICAgdGhpcy5zY2FsZS5zZXRUbygodGhpcy5nYW1lLndpZHRoIC8gOSkgLyB0aGlzLndpZHRoKTtcblxuICAgIC8vIFBoeXNpY3NcbiAgICB0aGlzLmdhbWUucGh5c2ljcy5hcmNhZGUuZW5hYmxlQm9keSh0aGlzKTtcbiAgICB0aGlzLmJvZHkuYWxsb3dHcmF2aXR5ID0gZmFsc2U7XG4gICAgdGhpcy5ib2R5LmltbW92YWJsZSA9IHRydWU7XG4gIH07XG5cbiAgLy8gRXh0ZW5kIGZyb20gU3ByaXRlXG4gIEJvb3N0LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUGhhc2VyLlNwcml0ZS5wcm90b3R5cGUpO1xuICBCb29zdC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBCb29zdDtcblxuICAvLyBBZGQgbWV0aG9kc1xuICBfLmV4dGVuZChCb29zdC5wcm90b3R5cGUsIHtcbiAgICB1cGRhdGU6IGZ1bmN0aW9uKCkge1xuXG4gICAgfVxuICB9KTtcblxuICAvLyBFeHBvcnRcbiAgbW9kdWxlLmV4cG9ydHMgPSBCb29zdDtcbn0pKCk7XG4iLCIvKiBnbG9iYWwgXzpmYWxzZSwgUGhhc2VyOmZhbHNlICovXG5cbi8qKlxuICogUHJlZmFiIGZvciBCb3R1bGlzbSwgdGhlIGJhZCBkdWRlc1xuICovXG5cbihmdW5jdGlvbigpIHtcbiAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgLy8gQ29uc3RydWN0b3JcbiAgdmFyIEJvdHVsaXNtID0gZnVuY3Rpb24oZ2FtZSwgeCwgeSkge1xuICAgIC8vIENhbGwgZGVmYXVsdCBzcHJpdGVcbiAgICBQaGFzZXIuU3ByaXRlLmNhbGwodGhpcywgZ2FtZSwgeCwgeSwgXCJwbGF5LXNwcml0ZXNcIiwgXCJib3RjaHkucG5nXCIpO1xuXG4gICAgLy8gU2l6ZVxuICAgIHRoaXMuYW5jaG9yLnNldFRvKDAuNSwgMC41KTtcbiAgICB0aGlzLnNjYWxlLnNldFRvKCh0aGlzLmdhbWUud2lkdGggLyAxMCkgLyB0aGlzLndpZHRoKTtcblxuICAgIC8vIENvbmZpZ3VyZVxuICAgIHRoaXMuaG92ZXIgPSB0cnVlO1xuICAgIHRoaXMuc2V0SG92ZXJTcGVlZCgxMDApO1xuICAgIHRoaXMuaG92ZXJSYW5nZSA9IDEwMDtcblxuICAgIC8vIFBoeXNpY3NcbiAgICB0aGlzLmdhbWUucGh5c2ljcy5hcmNhZGUuZW5hYmxlQm9keSh0aGlzKTtcbiAgICB0aGlzLmJvZHkuYWxsb3dHcmF2aXR5ID0gZmFsc2U7XG4gICAgdGhpcy5ib2R5LmltbW92YWJsZSA9IHRydWU7XG5cbiAgICAvLyBEZXRlcm1pbmUgYW5jaG9yIHggYm91bmRzXG4gICAgdGhpcy5wYWRkaW5nWCA9IDEwO1xuICAgIHRoaXMucmVzZXRQbGFjZW1lbnQoeCwgeSk7XG4gIH07XG5cbiAgLy8gRXh0ZW5kIGZyb20gU3ByaXRlXG4gIEJvdHVsaXNtLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUGhhc2VyLlNwcml0ZS5wcm90b3R5cGUpO1xuICBCb3R1bGlzbS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBCb3R1bGlzbTtcblxuICAvLyBBZGQgbWV0aG9kc1xuICBfLmV4dGVuZChCb3R1bGlzbS5wcm90b3R5cGUsIHtcbiAgICB1cGRhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgLy8gRG8gaG92ZXJcbiAgICAgIGlmICh0aGlzLmhvdmVyKSB7XG4gICAgICAgIHRoaXMuYm9keS52ZWxvY2l0eS54ID0gdGhpcy5ib2R5LnZlbG9jaXR5LnggfHwgdGhpcy5ob3ZlclNwZWVkO1xuICAgICAgICB0aGlzLmJvZHkudmVsb2NpdHkueCA9ICh0aGlzLnggPD0gdGhpcy5taW5YKSA/IHRoaXMuaG92ZXJTcGVlZCA6XG4gICAgICAgICAgKHRoaXMueCA+PSB0aGlzLm1heFgpID8gLXRoaXMuaG92ZXJTcGVlZCA6IHRoaXMuYm9keS52ZWxvY2l0eS54O1xuICAgICAgfVxuICAgIH0sXG5cbiAgICAvLyBTZXQgaG92ZXIgc3BlZWQuICBBZGQgYSBiaXQgb2YgdmFyaWFuY2VcbiAgICBzZXRIb3ZlclNwZWVkOiBmdW5jdGlvbihzcGVlZCkge1xuICAgICAgdGhpcy5ob3ZlclNwZWVkID0gc3BlZWQgKyB0aGlzLmdhbWUucm5kLmludGVnZXJJblJhbmdlKC0yNSwgMjUpO1xuICAgIH0sXG5cbiAgICAvLyBHZXQgYW5jaG9yIGJvdW5kcy4gIFRoaXMgaXMgcmVsYXRpdmUgdG8gd2hlcmUgdGhlIHBsYXRmb3JtIGlzXG4gICAgZ2V0QW5jaG9yQm91bmRzWDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLm1pblggPSBNYXRoLm1heCh0aGlzLnggLSB0aGlzLmhvdmVyUmFuZ2UsIHRoaXMucGFkZGluZ1ggKyAodGhpcy53aWR0aCAvIDIpKTtcbiAgICAgIHRoaXMubWF4WCA9IE1hdGgubWluKHRoaXMueCArIHRoaXMuaG92ZXJSYW5nZSwgdGhpcy5nYW1lLndpZHRoIC0gKHRoaXMucGFkZGluZ1ggKyAodGhpcy53aWR0aCAvIDIpKSk7XG4gICAgICByZXR1cm4gW3RoaXMubWluWCwgdGhpcy5tYXhYXTtcbiAgICB9LFxuXG4gICAgLy8gUmVzZXQgdGhpbmdzXG4gICAgcmVzZXRQbGFjZW1lbnQ6IGZ1bmN0aW9uKHgsIHkpIHtcbiAgICAgIHRoaXMucmVzZXQoeCwgeSk7XG4gICAgICB0aGlzLmJvZHkudmVsb2NpdHkueCA9IDA7XG4gICAgICB0aGlzLmdldEFuY2hvckJvdW5kc1goKTtcbiAgICB9XG4gIH0pO1xuXG4gIC8vIEV4cG9ydFxuICBtb2R1bGUuZXhwb3J0cyA9IEJvdHVsaXNtO1xufSkoKTtcbiIsIi8qIGdsb2JhbCBfOmZhbHNlLCBQaGFzZXI6ZmFsc2UgKi9cblxuLyoqXG4gKiBQcmVmYWIgQ29pbiB0eXBlIGl0ZW1cbiAqL1xuXG4oZnVuY3Rpb24oKSB7XG4gIFwidXNlIHN0cmljdFwiO1xuXG4gIC8vIENvbnN0cnVjdG9yIGZvciBjb2luXG4gIHZhciBDb2luID0gZnVuY3Rpb24oZ2FtZSwgeCwgeSkge1xuICAgIC8vIENhbGwgZGVmYXVsdCBzcHJpdGVcbiAgICBQaGFzZXIuU3ByaXRlLmNhbGwodGhpcywgZ2FtZSwgeCwgeSwgXCJwbGF5LXNwcml0ZXNcIiwgXCJtYWdpY2RpbGwucG5nXCIpO1xuXG4gICAgLy8gQ29uZmlndXJlXG4gICAgdGhpcy5hbmNob3Iuc2V0VG8oMC41LCAwLjUpO1xuICAgIHRoaXMuc2NhbGUuc2V0VG8oKHRoaXMuZ2FtZS53aWR0aCAvIDIwKSAvIHRoaXMud2lkdGgpO1xuXG4gICAgLy8gUGh5c2ljc1xuICAgIHRoaXMuZ2FtZS5waHlzaWNzLmFyY2FkZS5lbmFibGVCb2R5KHRoaXMpO1xuICAgIHRoaXMuYm9keS5hbGxvd0dyYXZpdHkgPSBmYWxzZTtcbiAgICB0aGlzLmJvZHkuaW1tb3ZhYmxlID0gdHJ1ZTtcbiAgfTtcblxuICAvLyBFeHRlbmQgZnJvbSBTcHJpdGVcbiAgQ29pbi5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFBoYXNlci5TcHJpdGUucHJvdG90eXBlKTtcbiAgQ29pbi5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBDb2luO1xuXG4gIC8vIEFkZCBtZXRob2RzXG4gIF8uZXh0ZW5kKENvaW4ucHJvdG90eXBlLCB7XG4gICAgdXBkYXRlOiBmdW5jdGlvbigpIHtcblxuICAgIH1cbiAgfSk7XG5cbiAgLy8gRXhwb3J0XG4gIG1vZHVsZS5leHBvcnRzID0gQ29pbjtcbn0pKCk7XG4iLCIvKiBnbG9iYWwgXzpmYWxzZSwgUGhhc2VyOmZhbHNlICovXG5cbi8qKlxuICogUHJlZmFiIEhlcm8vY2hhcmFjdGVyXG4gKi9cblxuKGZ1bmN0aW9uKCkge1xuICBcInVzZSBzdHJpY3RcIjtcblxuICAvLyBDb25zdHJ1Y3RvclxuICB2YXIgSGVybyA9IGZ1bmN0aW9uKGdhbWUsIHgsIHkpIHtcbiAgICAvLyBDYWxsIGRlZmF1bHQgc3ByaXRlXG4gICAgUGhhc2VyLlNwcml0ZS5jYWxsKHRoaXMsIGdhbWUsIHgsIHksIFwicGxheS1zcHJpdGVzXCIsIFwicGlja2xlLnBuZ1wiKTtcblxuICAgIC8vIENvbmZpZ3VyZVxuICAgIHRoaXMuYW5jaG9yLnNldFRvKDAuNSk7XG4gICAgdGhpcy5zY2FsZS5zZXRUbygodGhpcy5nYW1lLndpZHRoIC8gMjUpIC8gdGhpcy53aWR0aCk7XG4gICAgdGhpcy5nYW1lLnBoeXNpY3MuYXJjYWRlLmVuYWJsZUJvZHkodGhpcyk7XG5cbiAgICAvLyBUcmFjayB3aGVyZSB0aGUgaGVybyBzdGFydGVkIGFuZCBob3cgbXVjaCB0aGUgZGlzdGFuY2VcbiAgICAvLyBoYXMgY2hhbmdlZCBmcm9tIHRoYXQgcG9pbnRcbiAgICB0aGlzLnlPcmlnID0gdGhpcy55O1xuICAgIHRoaXMueUNoYW5nZSA9IDA7XG4gIH07XG5cbiAgLy8gRXh0ZW5kIGZyb20gU3ByaXRlXG4gIEhlcm8ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQaGFzZXIuU3ByaXRlLnByb3RvdHlwZSk7XG4gIEhlcm8ucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gSGVybztcblxuICAvLyBBZGQgbWV0aG9kc1xuICBfLmV4dGVuZChIZXJvLnByb3RvdHlwZSwge1xuICAgIHVwZGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAvLyBUcmFjayB0aGUgbWF4aW11bSBhbW91bnQgdGhhdCB0aGUgaGVybyBoYXMgdHJhdmVsbGVkXG4gICAgICB0aGlzLnlDaGFuZ2UgPSBNYXRoLm1heCh0aGlzLnlDaGFuZ2UsIE1hdGguYWJzKHRoaXMueSAtIHRoaXMueU9yaWcpKTtcblxuICAgICAgLy8gV3JhcCBhcm91bmQgZWRnZXMgbGVmdC90aWdodCBlZGdlc1xuICAgICAgdGhpcy5nYW1lLndvcmxkLndyYXAodGhpcywgdGhpcy53aWR0aCAvIDIsIGZhbHNlLCB0cnVlLCBmYWxzZSk7XG4gICAgfSxcblxuICAgIC8vIFJlc2V0IHBsYWNlbWVudCBjdXN0b21cbiAgICByZXNldFBsYWNlbWVudDogZnVuY3Rpb24oeCwgeSkge1xuICAgICAgdGhpcy5yZXNldCh4LCB5KTtcbiAgICAgIHRoaXMueU9yaWcgPSB0aGlzLnk7XG4gICAgICB0aGlzLnlDaGFuZ2UgPSAwO1xuICAgIH1cbiAgfSk7XG5cbiAgLy8gRXhwb3J0XG4gIG1vZHVsZS5leHBvcnRzID0gSGVybztcbn0pKCk7XG4iLCIvKiBnbG9iYWwgXzpmYWxzZSwgUGhhc2VyOmZhbHNlICovXG5cbi8qKlxuICogUHJlZmFiIHBsYXRmb3JtXG4gKi9cblxuKGZ1bmN0aW9uKCkge1xuICBcInVzZSBzdHJpY3RcIjtcblxuICAvLyBDb25zdHJ1Y3RvclxuICB2YXIgUGxhdGZvcm0gPSBmdW5jdGlvbihnYW1lLCB4LCB5KSB7XG4gICAgLy8gQ2FsbCBkZWZhdWx0IHNwcml0ZVxuICAgIFBoYXNlci5TcHJpdGUuY2FsbCh0aGlzLCBnYW1lLCB4LCB5LCBcInBsYXktc3ByaXRlc1wiLCBcImRpbGx5YmVhbi5wbmdcIik7XG5cbiAgICAvLyBDb25maWd1cmVcbiAgICB0aGlzLmFuY2hvci5zZXRUbygwLjUsIDAuNSk7XG4gICAgdGhpcy5zY2FsZS5zZXRUbygodGhpcy5nYW1lLndpZHRoIC8gNSkgLyB0aGlzLndpZHRoKTtcbiAgICB0aGlzLmhvdmVyID0gZmFsc2U7XG4gICAgdGhpcy5zZXRIb3ZlclNwZWVkKDEwMCk7XG5cbiAgICAvLyBQaHlzaWNzXG4gICAgdGhpcy5nYW1lLnBoeXNpY3MuYXJjYWRlLmVuYWJsZUJvZHkodGhpcyk7XG4gICAgdGhpcy5ib2R5LmFsbG93R3Jhdml0eSA9IGZhbHNlO1xuICAgIHRoaXMuYm9keS5pbW1vdmFibGUgPSB0cnVlO1xuXG4gICAgLy8gT25seSBhbGxvdyBmb3IgY29sbGlzc2lvbiB1cFxuICAgIHRoaXMuYm9keS5jaGVja0NvbGxpc2lvbi5kb3duID0gZmFsc2U7XG4gICAgdGhpcy5ib2R5LmNoZWNrQ29sbGlzaW9uLmxlZnQgPSBmYWxzZTtcbiAgICB0aGlzLmJvZHkuY2hlY2tDb2xsaXNpb24ucmlnaHQgPSBmYWxzZTtcblxuICAgIC8vIERldGVybWluZSBhbmNob3IgeCBib3VuZHNcbiAgICB0aGlzLnBhZGRpbmdYID0gMTA7XG4gICAgdGhpcy5nZXRBbmNob3JCb3VuZHNYKCk7XG4gIH07XG5cbiAgLy8gRXh0ZW5kIGZyb20gU3ByaXRlXG4gIFBsYXRmb3JtLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUGhhc2VyLlNwcml0ZS5wcm90b3R5cGUpO1xuICBQbGF0Zm9ybS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBQbGF0Zm9ybTtcblxuICAvLyBBZGQgbWV0aG9kc1xuICBfLmV4dGVuZChQbGF0Zm9ybS5wcm90b3R5cGUsIHtcbiAgICB1cGRhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKHRoaXMuaG92ZXIpIHtcbiAgICAgICAgdGhpcy5ib2R5LnZlbG9jaXR5LnggPSB0aGlzLmJvZHkudmVsb2NpdHkueCB8fCB0aGlzLmhvdmVyU3BlZWQ7XG4gICAgICAgIHRoaXMuYm9keS52ZWxvY2l0eS54ID0gKHRoaXMueCA8PSB0aGlzLm1pblgpID8gdGhpcy5ob3ZlclNwZWVkIDpcbiAgICAgICAgICAodGhpcy54ID49IHRoaXMubWF4WCkgPyAtdGhpcy5ob3ZlclNwZWVkIDogdGhpcy5ib2R5LnZlbG9jaXR5Lng7XG4gICAgICB9XG4gICAgfSxcblxuICAgIC8vIFNldCBob3ZlciBzcGVlZC4gIEFkZCBhIGJpdCBvZiB2YXJpYW5jZVxuICAgIHNldEhvdmVyU3BlZWQ6IGZ1bmN0aW9uKHNwZWVkKSB7XG4gICAgICB0aGlzLmhvdmVyU3BlZWQgPSBzcGVlZCArIHRoaXMuZ2FtZS5ybmQuaW50ZWdlckluUmFuZ2UoLTUwLCA1MCk7XG4gICAgfSxcblxuICAgIC8vIEdldCBhbmNob3IgYm91bmRzXG4gICAgZ2V0QW5jaG9yQm91bmRzWDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLm1pblggPSB0aGlzLnBhZGRpbmdYICsgKHRoaXMud2lkdGggLyAyKTtcbiAgICAgIHRoaXMubWF4WCA9IHRoaXMuZ2FtZS53aWR0aCAtICh0aGlzLnBhZGRpbmdYICsgKHRoaXMud2lkdGggLyAyKSk7XG4gICAgICByZXR1cm4gW3RoaXMubWluWCwgdGhpcy5tYXhYXTtcbiAgICB9LFxuXG4gICAgLy8gUmVzZXQgdGhpbmdzXG4gICAgcmVzZXRTZXR0aW5nczogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnJlc2V0KDAsIDApO1xuICAgICAgdGhpcy5ib2R5LnZlbG9jaXR5LnggPSAwO1xuICAgICAgdGhpcy5ob3ZlciA9IGZhbHNlO1xuICAgICAgdGhpcy5nZXRBbmNob3JCb3VuZHNYKCk7XG4gICAgfVxuICB9KTtcblxuICAvLyBFeHBvcnRcbiAgbW9kdWxlLmV4cG9ydHMgPSBQbGF0Zm9ybTtcbn0pKCk7XG4iLCIvKiBnbG9iYWwgXzpmYWxzZSwgUGhhc2VyOmZhbHNlICovXG5cbi8qKlxuICogR2FtZW92ZXIgc3RhdGVcbiAqL1xuXG4oZnVuY3Rpb24oKSB7XG4gIFwidXNlIHN0cmljdFwiO1xuXG4gIC8vIENvbnN0cnVjdG9yXG4gIHZhciBHYW1lb3ZlciA9IGZ1bmN0aW9uKCkge1xuICAgIFBoYXNlci5TdGF0ZS5jYWxsKHRoaXMpO1xuXG4gICAgLy8gQ29uZmlndXJlXG4gICAgdGhpcy5wYWRkaW5nID0gMTA7XG4gIH07XG5cbiAgLy8gRXh0ZW5kIGZyb20gU3RhdGVcbiAgR2FtZW92ZXIucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQaGFzZXIuU3RhdGUucHJvdG90eXBlKTtcbiAgR2FtZW92ZXIucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gR2FtZW92ZXI7XG5cbiAgLy8gQWRkIG1ldGhvZHNcbiAgXy5leHRlbmQoR2FtZW92ZXIucHJvdG90eXBlLCBQaGFzZXIuU3RhdGUucHJvdG90eXBlLCB7XG4gICAgLy8gUHJlbG9hZFxuICAgIHByZWxvYWQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5nYW1lLmxvYWQuaW1hZ2UoXCJnYW1lb3ZlclwiLCBcImFzc2V0cy9nYW1lb3Zlci5wbmdcIik7XG4gICAgICB0aGlzLmdhbWUubG9hZC5pbWFnZShcInBsYXlcIiwgXCJhc3NldHMvdGl0bGUtcGxheS5wbmdcIik7XG4gICAgICB0aGlzLmdhbWUubG9hZC5pbWFnZShcInlvdXItc2NvcmVcIiwgXCJhc3NldHMveW91ci1zY29yZS5wbmdcIik7XG4gICAgfSxcblxuICAgIC8vIENyZWF0ZVxuICAgIGNyZWF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAvLyBTZXQgYmFja2dyb3VuZFxuICAgICAgdGhpcy5nYW1lLnN0YWdlLmJhY2tncm91bmRDb2xvciA9IFwiIzhjYzYzZlwiO1xuXG4gICAgICAvLyBQbGFjZSB0aXRsZVxuICAgICAgdGhpcy50aXRsZUltYWdlID0gdGhpcy5nYW1lLmFkZC5zcHJpdGUodGhpcy5nYW1lLndpZHRoIC8gMiwgdGhpcy5wYWRkaW5nICogMywgXCJnYW1lb3ZlclwiKTtcbiAgICAgIHRoaXMudGl0bGVJbWFnZS5hbmNob3Iuc2V0VG8oMC41LCAwKTtcbiAgICAgIHRoaXMudGl0bGVJbWFnZS5zY2FsZS5zZXRUbygodGhpcy5nYW1lLndpZHRoIC0gKHRoaXMucGFkZGluZyAqIDgpKSAvIHRoaXMudGl0bGVJbWFnZS53aWR0aCk7XG4gICAgICB0aGlzLmdhbWUuYWRkLmV4aXN0aW5nKHRoaXMudGl0bGVJbWFnZSk7XG5cbiAgICAgIC8vIEhpZ2hzY29yZSBsaXN0LiAgQ2FuJ3Qgc2VlbSB0byBmaW5kIGEgd2F5IHRvIHBhc3MgdGhlIHNjb3JlXG4gICAgICAvLyB2aWEgYSBzdGF0ZSBjaGFuZ2UuXG4gICAgICB0aGlzLnNjb3JlID0gdGhpcy5nYW1lLnBpY2tsZS5zY29yZTtcblxuICAgICAgLy8gU2hvdyBzY29yZVxuICAgICAgdGhpcy5zaG93U2NvcmUoKTtcblxuICAgICAgLy8gU2hvdyBpbnB1dCBpZiBuZXcgaGlnaHNjb3JlLCBvdGhlcndpc2Ugc2hvdyBsaXN0XG4gICAgICBpZiAodGhpcy5nYW1lLnBpY2tsZS5pc0hpZ2hzY29yZSh0aGlzLnNjb3JlKSkge1xuICAgICAgICB0aGlzLmhpZ2hzY29yZUlucHV0KCk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgdGhpcy5oaWdoc2NvcmVMaXN0KCk7XG4gICAgICB9XG5cbiAgICAgIC8vIFBsYWNlIHJlLXBsYXlcbiAgICAgIHRoaXMucmVwbGF5SW1hZ2UgPSB0aGlzLmdhbWUuYWRkLnNwcml0ZSh0aGlzLmdhbWUud2lkdGggLSB0aGlzLnBhZGRpbmcgKiAyLCB0aGlzLmdhbWUuaGVpZ2h0IC0gdGhpcy5wYWRkaW5nICogMiwgXCJwbGF5XCIpO1xuICAgICAgdGhpcy5yZXBsYXlJbWFnZS5hbmNob3Iuc2V0VG8oMSwgMSk7XG4gICAgICB0aGlzLnJlcGxheUltYWdlLnNjYWxlLnNldFRvKCh0aGlzLmdhbWUud2lkdGggKiAwLjI1KSAvIHRoaXMucmVwbGF5SW1hZ2Uud2lkdGgpO1xuICAgICAgdGhpcy5nYW1lLmFkZC5leGlzdGluZyh0aGlzLnJlcGxheUltYWdlKTtcblxuICAgICAgLy8gQWRkIGhvdmVyIGZvciBtb3VzZVxuICAgICAgdGhpcy5yZXBsYXlJbWFnZS5pbnB1dEVuYWJsZWQgPSB0cnVlO1xuICAgICAgdGhpcy5yZXBsYXlJbWFnZS5ldmVudHMub25JbnB1dE92ZXIuYWRkKGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLnJlcGxheUltYWdlLm9yaWdpbmFsVGludCA9IHRoaXMucmVwbGF5SW1hZ2UudGludDtcbiAgICAgICAgdGhpcy5yZXBsYXlJbWFnZS50aW50ID0gMC41ICogMHhGRkZGRkY7XG4gICAgICB9LCB0aGlzKTtcblxuICAgICAgdGhpcy5yZXBsYXlJbWFnZS5ldmVudHMub25JbnB1dE91dC5hZGQoZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMucmVwbGF5SW1hZ2UudGludCA9IHRoaXMucmVwbGF5SW1hZ2Uub3JpZ2luYWxUaW50O1xuICAgICAgfSwgdGhpcyk7XG5cbiAgICAgIC8vIEFkZCBpbnRlcmFjdGlvbnMgZm9yIHN0YXJ0aW5nXG4gICAgICB0aGlzLnJlcGxheUltYWdlLmV2ZW50cy5vbklucHV0RG93bi5hZGQodGhpcy5yZXBsYXksIHRoaXMpO1xuXG4gICAgICAvLyBJbnB1dFxuICAgICAgdGhpcy5sZWZ0QnV0dG9uID0gdGhpcy5nYW1lLmlucHV0LmtleWJvYXJkLmFkZEtleShQaGFzZXIuS2V5Ym9hcmQuTEVGVCk7XG4gICAgICB0aGlzLnJpZ2h0QnV0dG9uID0gdGhpcy5nYW1lLmlucHV0LmtleWJvYXJkLmFkZEtleShQaGFzZXIuS2V5Ym9hcmQuUklHSFQpO1xuICAgICAgdGhpcy51cEJ1dHRvbiA9IHRoaXMuZ2FtZS5pbnB1dC5rZXlib2FyZC5hZGRLZXkoUGhhc2VyLktleWJvYXJkLlVQKTtcbiAgICAgIHRoaXMuZG93bkJ1dHRvbiA9IHRoaXMuZ2FtZS5pbnB1dC5rZXlib2FyZC5hZGRLZXkoUGhhc2VyLktleWJvYXJkLkRPV04pO1xuICAgICAgdGhpcy5hY3Rpb25CdXR0b24gPSB0aGlzLmdhbWUuaW5wdXQua2V5Ym9hcmQuYWRkS2V5KFBoYXNlci5LZXlib2FyZC5TUEFDRUJBUik7XG5cbiAgICAgIHRoaXMubGVmdEJ1dHRvbi5vbkRvd24uYWRkKGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAodGhpcy5oSW5wdXQpIHtcbiAgICAgICAgICB0aGlzLm1vdmVDdXJzb3IoLTEpO1xuICAgICAgICB9XG4gICAgICB9LCB0aGlzKTtcblxuICAgICAgdGhpcy5yaWdodEJ1dHRvbi5vbkRvd24uYWRkKGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAodGhpcy5oSW5wdXQpIHtcbiAgICAgICAgICB0aGlzLm1vdmVDdXJzb3IoMSk7XG4gICAgICAgIH1cbiAgICAgIH0sIHRoaXMpO1xuXG4gICAgICB0aGlzLnVwQnV0dG9uLm9uRG93bi5hZGQoZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICh0aGlzLmhJbnB1dCkge1xuICAgICAgICAgIHRoaXMubW92ZUxldHRlcigxKTtcbiAgICAgICAgfVxuICAgICAgfSwgdGhpcyk7XG5cbiAgICAgIHRoaXMuZG93bkJ1dHRvbi5vbkRvd24uYWRkKGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAodGhpcy5oSW5wdXQpIHtcbiAgICAgICAgICB0aGlzLm1vdmVMZXR0ZXIoLTEpO1xuICAgICAgICB9XG4gICAgICB9LCB0aGlzKTtcblxuICAgICAgdGhpcy5hY3Rpb25CdXR0b24ub25Eb3duLmFkZChmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHNhdmVkO1xuXG4gICAgICAgIGlmICh0aGlzLmhJbnB1dCkge1xuICAgICAgICAgIHNhdmVkID0gdGhpcy5zYXZlSGlnaHNjb3JlKCk7XG4gICAgICAgICAgaWYgKHNhdmVkKSB7XG4gICAgICAgICAgICB0aGlzLmhpZ2hzY29yZUxpc3QoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgdGhpcy5yZXBsYXkoKTtcbiAgICAgICAgfVxuICAgICAgfSwgdGhpcyk7XG4gICAgfSxcblxuICAgIC8vIFVwZGF0ZVxuICAgIHVwZGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgfSxcblxuICAgIC8vIFNodXRkb3duLCBjbGVhbiB1cCBvbiBzdGF0ZSBjaGFuZ2VcbiAgICBzaHV0ZG93bjogZnVuY3Rpb24oKSB7XG4gICAgICBbXCJ0aXRsZVRleHRcIiwgXCJyZXBsYXlUZXh0XCJdLmZvckVhY2goXy5iaW5kKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgaWYgKHRoaXNbaXRlbV0gJiYgdGhpc1tpdGVtXS5kZXN0cm95KSB7XG4gICAgICAgICAgdGhpc1tpdGVtXS5kZXN0cm95KCk7XG4gICAgICAgICAgdGhpc1tpdGVtXSA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgIH0sIHRoaXMpKTtcbiAgICB9LFxuXG4gICAgLy8gSGFuZGxlIHJlcGxheVxuICAgIHJlcGxheTogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLmdhbWUuc3RhdGUuc3RhcnQoXCJtZW51XCIpO1xuICAgIH0sXG5cbiAgICAvLyBTaG93IGhpZ2hzY29yZVxuICAgIHNob3dTY29yZTogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnNjb3JlR3JvdXAgPSB0aGlzLmdhbWUuYWRkLmdyb3VwKCk7XG5cbiAgICAgIC8vIFBsYWNlIGxhYmVsXG4gICAgICB0aGlzLnlvdXJTY29yZUltYWdlID0gdGhpcy5nYW1lLmFkZC5zcHJpdGUoXG4gICAgICAgIHRoaXMuZ2FtZS53aWR0aCAvIDIgKyAodGhpcy5wYWRkaW5nICogMyksXG4gICAgICAgIHRoaXMudGl0bGVJbWFnZS5oZWlnaHQgKyAodGhpcy5wYWRkaW5nICogNy41KSwgXCJ5b3VyLXNjb3JlXCIpO1xuICAgICAgdGhpcy55b3VyU2NvcmVJbWFnZS5hbmNob3Iuc2V0VG8oMSwgMCk7XG4gICAgICB0aGlzLnlvdXJTY29yZUltYWdlLnNjYWxlLnNldFRvKCgodGhpcy5nYW1lLndpZHRoIC8gMikgLSAodGhpcy5wYWRkaW5nICogNikpIC8gdGhpcy55b3VyU2NvcmVJbWFnZS53aWR0aCk7XG5cbiAgICAgIC8vIFNjb3JlXG4gICAgICB0aGlzLnNjb3JlVGV4dCA9IG5ldyBQaGFzZXIuVGV4dChcbiAgICAgICAgdGhpcy5nYW1lLFxuICAgICAgICB0aGlzLmdhbWUud2lkdGggLyAyICsgKHRoaXMucGFkZGluZyAqIDUpLFxuICAgICAgICB0aGlzLnRpdGxlSW1hZ2UuaGVpZ2h0ICsgKHRoaXMucGFkZGluZyAqIDYpLFxuICAgICAgICB0aGlzLnNjb3JlLnRvTG9jYWxlU3RyaW5nKCksIHtcbiAgICAgICAgICBmb250OiBcImJvbGQgXCIgKyAodGhpcy5nYW1lLndvcmxkLmhlaWdodCAvIDE1KSArIFwicHggRG9zaXNcIixcbiAgICAgICAgICBmaWxsOiBcIiMzOWI1NGFcIixcbiAgICAgICAgICBhbGlnbjogXCJsZWZ0XCIsXG4gICAgICAgIH0pO1xuICAgICAgdGhpcy5zY29yZVRleHQuYW5jaG9yLnNldFRvKDAsIDApO1xuXG4gICAgICAvLyBGb250IGxvYWRpbmcgdGhpbmdcbiAgICAgIF8uZGVsYXkoXy5iaW5kKGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLnNjb3JlR3JvdXAuYWRkKHRoaXMueW91clNjb3JlSW1hZ2UpO1xuICAgICAgICB0aGlzLnNjb3JlR3JvdXAuYWRkKHRoaXMuc2NvcmVUZXh0KTtcbiAgICAgIH0sIHRoaXMpLCAxMDAwKTtcbiAgICB9LFxuXG4gICAgLy8gTWFrZSBoaWdoZXN0IHNjb3JlIGlucHV0XG4gICAgaGlnaHNjb3JlSW5wdXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5oSW5wdXQgPSB0cnVlO1xuICAgICAgdGhpcy5oSW5wdXRJbmRleCA9IDA7XG4gICAgICB0aGlzLmhJbnB1dHMgPSB0aGlzLmdhbWUuYWRkLmdyb3VwKCk7XG4gICAgICB2YXIgeSA9IHRoaXMuZ2FtZS53b3JsZC5oZWlnaHQgKiAwLjc7XG5cbiAgICAgIC8vIEZpcnN0IGlucHV0XG4gICAgICB2YXIgb25lID0gbmV3IFBoYXNlci5UZXh0KFxuICAgICAgICB0aGlzLmdhbWUsXG4gICAgICAgIHRoaXMuZ2FtZS53b3JsZC53aWR0aCAqIDAuMzMzMzMsXG4gICAgICAgIHksXG4gICAgICAgIFwiQVwiLCB7XG4gICAgICAgICAgZm9udDogXCJib2xkIFwiICsgKHRoaXMuZ2FtZS53b3JsZC5oZWlnaHQgLyAxNSkgKyBcInB4IERvc2lzXCIsXG4gICAgICAgICAgZmlsbDogXCIjRkZGRkZGXCIsXG4gICAgICAgICAgYWxpZ246IFwiY2VudGVyXCIsXG4gICAgICAgIH0pO1xuICAgICAgb25lLmFuY2hvci5zZXQoMC41KTtcbiAgICAgIHRoaXMuaElucHV0cy5hZGQob25lKTtcblxuICAgICAgLy8gU2Vjb25kIGlucHV0XG4gICAgICB2YXIgc2Vjb25kID0gbmV3IFBoYXNlci5UZXh0KFxuICAgICAgICB0aGlzLmdhbWUsXG4gICAgICAgIHRoaXMuZ2FtZS53b3JsZC53aWR0aCAqIDAuNSxcbiAgICAgICAgeSxcbiAgICAgICAgXCJBXCIsIHtcbiAgICAgICAgICBmb250OiBcImJvbGQgXCIgKyAodGhpcy5nYW1lLndvcmxkLmhlaWdodCAvIDE1KSArIFwicHggRG9zaXNcIixcbiAgICAgICAgICBmaWxsOiBcIiNGRkZGRkZcIixcbiAgICAgICAgICBhbGlnbjogXCJjZW50ZXJcIixcbiAgICAgICAgfSk7XG4gICAgICBzZWNvbmQuYW5jaG9yLnNldCgwLjUpO1xuICAgICAgdGhpcy5oSW5wdXRzLmFkZChzZWNvbmQpO1xuXG4gICAgICAvLyBTZWNvbmQgaW5wdXRcbiAgICAgIHZhciB0aGlyZCA9IG5ldyBQaGFzZXIuVGV4dChcbiAgICAgICAgdGhpcy5nYW1lLFxuICAgICAgICB0aGlzLmdhbWUud29ybGQud2lkdGggKiAwLjY2NjY2LFxuICAgICAgICB5LFxuICAgICAgICBcIkFcIiwge1xuICAgICAgICAgIGZvbnQ6IFwiYm9sZCBcIiArICh0aGlzLmdhbWUud29ybGQuaGVpZ2h0IC8gMTUpICsgXCJweCBEb3Npc1wiLFxuICAgICAgICAgIGZpbGw6IFwiI0ZGRkZGRlwiLFxuICAgICAgICAgIGFsaWduOiBcImNlbnRlclwiLFxuICAgICAgICB9KTtcbiAgICAgIHRoaXJkLmFuY2hvci5zZXQoMC41KTtcbiAgICAgIHRoaXMuaElucHV0cy5hZGQodGhpcmQpO1xuXG4gICAgICAvLyBDdXJzb3JcbiAgICAgIHRoaXMuaEN1cnNvciA9IHRoaXMuZ2FtZS5hZGQudGV4dChcbiAgICAgICAgb25lLngsXG4gICAgICAgIG9uZS55IC0gKHRoaXMuZ2FtZS53b3JsZC5oZWlnaHQgLyAyMCksXG4gICAgICAgIFwiX1wiLCB7XG4gICAgICAgICAgZm9udDogXCJib2xkIFwiICsgKHRoaXMuZ2FtZS53b3JsZC5oZWlnaHQgLyA1KSArIFwicHggQXJpYWxcIixcbiAgICAgICAgICBmaWxsOiBcIiNGRkZGRkZcIixcbiAgICAgICAgICBhbGlnbjogXCJjZW50ZXJcIixcbiAgICAgICAgfSk7XG4gICAgICB0aGlzLmhDdXJzb3IuYW5jaG9yLnNldCgwLjUpO1xuXG4gICAgICAvLyBIYW5kbGUgaW5pdGFsIGN1cnNvclxuICAgICAgdGhpcy5tb3ZlQ3Vyc29yKDApO1xuICAgIH0sXG5cbiAgICAvLyBNb3ZlIGN1cnNvclxuICAgIG1vdmVDdXJzb3I6IGZ1bmN0aW9uKGFtb3VudCkge1xuICAgICAgdmFyIG5ld0luZGV4ID0gdGhpcy5oSW5wdXRJbmRleCArIGFtb3VudDtcbiAgICAgIHRoaXMuaElucHV0SW5kZXggPSAobmV3SW5kZXggPCAwKSA/IHRoaXMuaElucHV0cy5sZW5ndGggLSAxIDpcbiAgICAgICAgKG5ld0luZGV4ID49IHRoaXMuaElucHV0cy5sZW5ndGgpID8gMCA6IG5ld0luZGV4O1xuICAgICAgdmFyIGkgPSB0aGlzLmhJbnB1dHMuZ2V0Q2hpbGRBdCh0aGlzLmhJbnB1dEluZGV4KTtcblxuICAgICAgLy8gTW92ZSBjdXJzb3JcbiAgICAgIHRoaXMuaEN1cnNvci54ID0gaS54O1xuICAgICAgdGhpcy5oSW5wdXRzLmZvckVhY2goZnVuY3Rpb24oaW5wdXQpIHtcbiAgICAgICAgaW5wdXQuZmlsbCA9IFwiI0ZGRkZGRlwiO1xuICAgICAgfSk7XG5cbiAgICAgIGkuZmlsbCA9IFwiI0ZGRERCQlwiO1xuXG4gICAgICAvLyBUT0RPOiBIaWdobGlnaHQgaW5wdXQuXG4gICAgfSxcblxuICAgIC8vIE1vdmUgbGV0dGVyXG4gICAgbW92ZUxldHRlcjogZnVuY3Rpb24oYW1vdW50KSB7XG4gICAgICB2YXIgaSA9IHRoaXMuaElucHV0cy5nZXRDaGlsZEF0KHRoaXMuaElucHV0SW5kZXgpO1xuICAgICAgdmFyIHQgPSBpLnRleHQ7XG4gICAgICB2YXIgbiA9ICh0ID09PSBcIkFcIiAmJiBhbW91bnQgPT09IC0xKSA/IFwiWlwiIDpcbiAgICAgICAgKHQgPT09IFwiWlwiICYmIGFtb3VudCA9PT0gMSkgPyBcIkFcIiA6XG4gICAgICAgIFN0cmluZy5mcm9tQ2hhckNvZGUodC5jaGFyQ29kZUF0KDApICsgYW1vdW50KTtcblxuICAgICAgaS50ZXh0ID0gbjtcbiAgICB9LFxuXG4gICAgLy8gU2F2ZSBoaWdoc2NvcmVcbiAgICBzYXZlSGlnaHNjb3JlOiBmdW5jdGlvbigpIHtcbiAgICAgIC8vIEdldCBuYW1lXG4gICAgICB2YXIgbmFtZSA9IFwiXCI7XG4gICAgICB0aGlzLmhJbnB1dHMuZm9yRWFjaChmdW5jdGlvbihpbnB1dCkge1xuICAgICAgICBuYW1lID0gbmFtZSArIGlucHV0LnRleHQ7XG4gICAgICB9KTtcblxuICAgICAgLy8gRG9uJ3QgYWxsb3cgQUFBXG4gICAgICBpZiAobmFtZSA9PT0gXCJBQUFcIikge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIC8vIFNhdmUgaGlnaHNjb3JlXG4gICAgICB0aGlzLmdhbWUucGlja2xlLnNldEhpZ2hzY29yZSh0aGlzLnNjb3JlLCBuYW1lKTtcblxuICAgICAgLy8gUmVtb3ZlIGlucHV0XG4gICAgICB0aGlzLmhJbnB1dCA9IGZhbHNlO1xuICAgICAgdGhpcy5oSW5wdXRzLmRlc3Ryb3koKTtcbiAgICAgIHRoaXMuaEN1cnNvci5kZXN0cm95KCk7XG5cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0sXG5cbiAgICAvLyBIaWdoc2NvcmUgbGlzdFxuICAgIGhpZ2hzY29yZUxpc3Q6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5oaWdoc2NvcmVMaW1pdCA9IDM7XG4gICAgICB0aGlzLmhpZ2hzY29yZUxpc3RHcm91cCA9IHRoaXMuZ2FtZS5hZGQuZ3JvdXAoKTtcbiAgICAgIHRoaXMuZ2FtZS5waWNrbGUuc29ydEhpZ2hzY29yZXMoKTtcbiAgICAgIHZhciBmb250U2l6ZSA9IHRoaXMuZ2FtZS53b3JsZC5oZWlnaHQgLyAxNy41O1xuXG4gICAgICBpZiAodGhpcy5nYW1lLnBpY2tsZS5oaWdoc2NvcmVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgXy5lYWNoKHRoaXMuZ2FtZS5waWNrbGUuaGlnaHNjb3Jlcy5yZXZlcnNlKCkuc2xpY2UoMCwgMyksIF8uYmluZChmdW5jdGlvbihoLCBpKSB7XG4gICAgICAgICAgLy8gTmFtZVxuICAgICAgICAgIHZhciBuYW1lID0gbmV3IFBoYXNlci5UZXh0KFxuICAgICAgICAgICAgdGhpcy5nYW1lLFxuICAgICAgICAgICAgdGhpcy5nYW1lLndpZHRoIC8gMiArICh0aGlzLnBhZGRpbmcgKiAzKSxcbiAgICAgICAgICAgICh0aGlzLmdhbWUuaGVpZ2h0ICogMC42KSArICgoZm9udFNpemUgKyB0aGlzLnBhZGRpbmcpICogaSksXG4gICAgICAgICAgICBoLm5hbWUsIHtcbiAgICAgICAgICAgICAgZm9udDogXCJib2xkIFwiICsgKHRoaXMuZ2FtZS53b3JsZC5oZWlnaHQgLyAxNSkgKyBcInB4IERvc2lzXCIsXG4gICAgICAgICAgICAgIGZpbGw6IFwiI2I4ZjRiY1wiLFxuICAgICAgICAgICAgICBhbGlnbjogXCJyaWdodFwiLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgbmFtZS5hbmNob3Iuc2V0VG8oMSwgMCk7XG5cbiAgICAgICAgICAvLyBTY29yZVxuICAgICAgICAgIHZhciBzY29yZSA9IG5ldyBQaGFzZXIuVGV4dChcbiAgICAgICAgICAgIHRoaXMuZ2FtZSxcbiAgICAgICAgICAgIHRoaXMuZ2FtZS53aWR0aCAvIDIgKyAodGhpcy5wYWRkaW5nICogNSksXG4gICAgICAgICAgICAodGhpcy5nYW1lLmhlaWdodCAqIDAuNikgKyAoKGZvbnRTaXplICsgdGhpcy5wYWRkaW5nKSAqIGkpLFxuICAgICAgICAgICAgaC5zY29yZS50b0xvY2FsZVN0cmluZygpLCB7XG4gICAgICAgICAgICAgIGZvbnQ6IFwiYm9sZCBcIiArICh0aGlzLmdhbWUud29ybGQuaGVpZ2h0IC8gMTUpICsgXCJweCBEb3Npc1wiLFxuICAgICAgICAgICAgICBmaWxsOiBcIiMzOWI1NGFcIixcbiAgICAgICAgICAgICAgYWxpZ246IFwibGVmdFwiLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgc2NvcmUuYW5jaG9yLnNldFRvKDAsIDApO1xuXG4gICAgICAgICAgLy8gRm9udCBsb2FkaW5nIHRoaW5nXG4gICAgICAgICAgXy5kZWxheShfLmJpbmQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLmhpZ2hzY29yZUxpc3RHcm91cC5hZGQobmFtZSk7XG4gICAgICAgICAgICB0aGlzLmhpZ2hzY29yZUxpc3RHcm91cC5hZGQoc2NvcmUpO1xuICAgICAgICAgIH0sIHRoaXMpLCAxMDAwKTtcbiAgICAgICAgfSwgdGhpcykpO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbiAgLy8gRXhwb3J0XG4gIG1vZHVsZS5leHBvcnRzID0gR2FtZW92ZXI7XG59KSgpO1xuIiwiLyogZ2xvYmFsIF86ZmFsc2UsIFBoYXNlcjpmYWxzZSAqL1xuXG4vKipcbiAqIE1lbnUgc3RhdGVcbiAqL1xuXG4oZnVuY3Rpb24oKSB7XG4gIFwidXNlIHN0cmljdFwiO1xuXG4gIC8vIENvbnN0cnVjdG9yXG4gIHZhciBNZW51ID0gZnVuY3Rpb24oKSB7XG4gICAgUGhhc2VyLlN0YXRlLmNhbGwodGhpcyk7XG5cbiAgICAvLyBDb25maWdcbiAgICB0aGlzLnBhZGRpbmcgPSAyMDtcbiAgfTtcblxuICAvLyBFeHRlbmQgZnJvbSBTdGF0ZVxuICBNZW51LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUGhhc2VyLlN0YXRlLnByb3RvdHlwZSk7XG4gIE1lbnUucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gTWVudTtcblxuICAvLyBBZGQgbWV0aG9kc1xuICBfLmV4dGVuZChNZW51LnByb3RvdHlwZSwgUGhhc2VyLlN0YXRlLnByb3RvdHlwZSwge1xuICAgIC8vIFByZWxvYWRcbiAgICBwcmVsb2FkOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuZ2FtZS5sb2FkLmltYWdlKFwidGl0bGVcIiwgXCJhc3NldHMvdGl0bGUucG5nXCIpO1xuICAgICAgdGhpcy5nYW1lLmxvYWQuaW1hZ2UoXCJwbGF5XCIsIFwiYXNzZXRzL3RpdGxlLXBsYXkucG5nXCIpO1xuICAgIH0sXG5cbiAgICAvLyBDcmVhdGVcbiAgICBjcmVhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgLy8gU2V0IGJhY2tncm91bmRcbiAgICAgIHRoaXMuZ2FtZS5zdGFnZS5iYWNrZ3JvdW5kQ29sb3IgPSBcIiNiOGY0YmNcIjtcblxuICAgICAgLy8gUGxhY2UgdGl0bGVcbiAgICAgIHRoaXMudGl0bGVJbWFnZSA9IHRoaXMuZ2FtZS5hZGQuc3ByaXRlKHRoaXMuZ2FtZS53aWR0aCAvIDIsIHRoaXMucGFkZGluZyAqIDMsIFwidGl0bGVcIik7XG4gICAgICB0aGlzLnRpdGxlSW1hZ2UuYW5jaG9yLnNldFRvKDAuNSwgMCk7XG4gICAgICB0aGlzLnRpdGxlSW1hZ2Uuc2NhbGUuc2V0VG8oKHRoaXMuZ2FtZS53aWR0aCAtICh0aGlzLnBhZGRpbmcgKiAyKSkgLyB0aGlzLnRpdGxlSW1hZ2Uud2lkdGgpO1xuICAgICAgdGhpcy5nYW1lLmFkZC5leGlzdGluZyh0aGlzLnRpdGxlSW1hZ2UpO1xuXG4gICAgICAvLyBQbGFjZSBwbGF5XG4gICAgICB0aGlzLnBsYXlJbWFnZSA9IHRoaXMuZ2FtZS5hZGQuc3ByaXRlKHRoaXMuZ2FtZS53aWR0aCAvIDIsIHRoaXMuZ2FtZS5oZWlnaHQgLSB0aGlzLnBhZGRpbmcgKiAzLCBcInBsYXlcIik7XG4gICAgICB0aGlzLnBsYXlJbWFnZS5hbmNob3Iuc2V0VG8oMC40LCAxKTtcbiAgICAgIHRoaXMucGxheUltYWdlLnNjYWxlLnNldFRvKCh0aGlzLmdhbWUud2lkdGggKiAwLjc1KSAvIHRoaXMudGl0bGVJbWFnZS53aWR0aCk7XG4gICAgICB0aGlzLmdhbWUuYWRkLmV4aXN0aW5nKHRoaXMucGxheUltYWdlKTtcblxuICAgICAgLy8gQWRkIGhvdmVyIGZvciBtb3VzZVxuICAgICAgdGhpcy5wbGF5SW1hZ2UuaW5wdXRFbmFibGVkID0gdHJ1ZTtcbiAgICAgIHRoaXMucGxheUltYWdlLmV2ZW50cy5vbklucHV0T3Zlci5hZGQoZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMucGxheUltYWdlLm9yaWdpbmFsVGludCA9IHRoaXMucGxheUltYWdlLnRpbnQ7XG4gICAgICAgIHRoaXMucGxheUltYWdlLnRpbnQgPSAwLjUgKiAweEZGRkZGRjtcbiAgICAgIH0sIHRoaXMpO1xuXG4gICAgICB0aGlzLnBsYXlJbWFnZS5ldmVudHMub25JbnB1dE91dC5hZGQoZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMucGxheUltYWdlLnRpbnQgPSB0aGlzLnBsYXlJbWFnZS5vcmlnaW5hbFRpbnQ7XG4gICAgICB9LCB0aGlzKTtcblxuICAgICAgLy8gQWRkIG1vdXNlIGludGVyYWN0aW9uXG4gICAgICB0aGlzLnBsYXlJbWFnZS5ldmVudHMub25JbnB1dERvd24uYWRkKHRoaXMuZ28sIHRoaXMpO1xuXG4gICAgICAvLyBBZGQga2V5Ym9hcmQgaW50ZXJhY3Rpb25cbiAgICAgIHRoaXMuYWN0aW9uQnV0dG9uID0gdGhpcy5nYW1lLmlucHV0LmtleWJvYXJkLmFkZEtleShQaGFzZXIuS2V5Ym9hcmQuU1BBQ0VCQVIpO1xuICAgICAgdGhpcy5hY3Rpb25CdXR0b24ub25Eb3duLmFkZChmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5nbygpO1xuICAgICAgfSwgdGhpcyk7XG4gICAgfSxcblxuICAgIC8vIFN0YXJ0IHBsYXlpbmdcbiAgICBnbzogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLmdhbWUuc3RhdGUuc3RhcnQoXCJwbGF5XCIpO1xuICAgIH0sXG5cbiAgICAvLyBVcGRhdGVcbiAgICB1cGRhdGU6IGZ1bmN0aW9uKCkge1xuICAgIH1cbiAgfSk7XG5cbiAgLy8gRXhwb3J0XG4gIG1vZHVsZS5leHBvcnRzID0gTWVudTtcbn0pKCk7XG4iLCIvKiBnbG9iYWwgXzpmYWxzZSwgUGhhc2VyOmZhbHNlICovXG5cbi8qKlxuICogUGxheSBzdGF0ZVxuICovXG5cbihmdW5jdGlvbigpIHtcbiAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgLy8gRGVwZW5kZW5jaWVzXG4gIHZhciBwcmVmYWJzID0ge1xuICAgIEJvb3N0OiByZXF1aXJlKFwiLi9wcmVmYWItYm9vc3QuanNcIiksXG4gICAgQm90dWxpc206IHJlcXVpcmUoXCIuL3ByZWZhYi1ib3R1bGlzbS5qc1wiKSxcbiAgICBDb2luOiByZXF1aXJlKFwiLi9wcmVmYWItY29pbi5qc1wiKSxcbiAgICBIZXJvOiByZXF1aXJlKFwiLi9wcmVmYWItaGVyby5qc1wiKSxcbiAgICBQbGF0Zm9ybTogcmVxdWlyZShcIi4vcHJlZmFiLXBsYXRmb3JtLmpzXCIpXG4gIH07XG5cbiAgLy8gQ29uc3RydWN0b3JcbiAgdmFyIFBsYXkgPSBmdW5jdGlvbigpIHtcbiAgICBQaGFzZXIuU3RhdGUuY2FsbCh0aGlzKTtcbiAgfTtcblxuICAvLyBFeHRlbmQgZnJvbSBTdGF0ZVxuICBQbGF5LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUGhhc2VyLlN0YXRlLnByb3RvdHlwZSk7XG4gIFBsYXkucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gUGxheTtcblxuICAvLyBBZGQgbWV0aG9kc1xuICBfLmV4dGVuZChQbGF5LnByb3RvdHlwZSwgUGhhc2VyLlN0YXRlLnByb3RvdHlwZSwge1xuICAgIC8vIFByZWxvYWRcbiAgICBwcmVsb2FkOiBmdW5jdGlvbigpIHtcbiAgICAgIC8vIExvYWQgdXAgZ2FtZSBpbWFnZXNcbiAgICAgIHRoaXMuZ2FtZS5sb2FkLmF0bGFzKFwicGxheS1zcHJpdGVzXCIsIFwiYXNzZXRzL2RldGVybWluZWQtZGlsbC1zcHJpdGVzLnBuZ1wiLCBcImFzc2V0cy9kZXRlcm1pbmVkLWRpbGwtc3ByaXRlcy5qc29uXCIpO1xuICAgIH0sXG5cbiAgICAvLyBDcmVhdGVcbiAgICBjcmVhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgLy8gU2V0IGJhY2tncm91bmRcbiAgICAgIHRoaXMuZ2FtZS5zdGFnZS5iYWNrZ3JvdW5kQ29sb3IgPSBcIiNiOGY0YmNcIjtcblxuICAgICAgLy90aGlzLmdhbWUudGltZS5zbG93TW90aW9uID0gMC4yO1xuXG4gICAgICAvLyBDb25maWcgZm9yIGRpZmZpY3VsdHlcbiAgICAgIHRoaXMucGxhdGZvcm1TcGFjZVkgPSAxMTA7XG4gICAgICB0aGlzLnBsYXRmb3JtR2FwTWF4ID0gMjAwO1xuICAgICAgdGhpcy5ob3ZlckNoYW5jZSA9IDAuMztcbiAgICAgIHRoaXMuY29pbkNoYW5jZSA9IDAuMztcbiAgICAgIHRoaXMuYm9vc3RDaGFuY2UgPSAwLjM7XG4gICAgICB0aGlzLmJvdENoYW5jZSA9IDAuMTtcblxuICAgICAgLy8gU2NvcmluZ1xuICAgICAgdGhpcy5zY29yZUNvaW4gPSAxMDA7XG4gICAgICB0aGlzLnNjb3JlQm9vc3QgPSAzMDA7XG4gICAgICB0aGlzLnNjb3JlQm90ID0gNTAwO1xuXG4gICAgICAvLyBTcGFjaW5nXG4gICAgICB0aGlzLnBhZGRpbmcgPSAxMDtcblxuICAgICAgLy8gSW5pdGlhbGl6ZSB0cmFja2luZyB2YXJpYWJsZXNcbiAgICAgIHRoaXMucmVzZXRWaWV3VHJhY2tpbmcoKTtcblxuICAgICAgLy8gU2NhbGluZ1xuICAgICAgdGhpcy5nYW1lLnNjYWxlLnNjYWxlTW9kZSA9IFBoYXNlci5TY2FsZU1hbmFnZXIuU0hPV19BTEw7XG4gICAgICB0aGlzLmdhbWUuc2NhbGUubWF4V2lkdGggPSB0aGlzLmdhbWUud2lkdGg7XG4gICAgICB0aGlzLmdhbWUuc2NhbGUubWF4SGVpZ2h0ID0gdGhpcy5nYW1lLmhlaWdodDtcbiAgICAgIHRoaXMuZ2FtZS5zY2FsZS5wYWdlQWxpZ25Ib3Jpem9udGFsbHkgPSB0cnVlO1xuICAgICAgdGhpcy5nYW1lLnNjYWxlLnBhZ2VBbGlnblZlcnRpY2FsbHkgPSB0cnVlO1xuXG4gICAgICAvLyBQaHlzaWNzXG4gICAgICB0aGlzLmdhbWUucGh5c2ljcy5zdGFydFN5c3RlbShQaGFzZXIuUGh5c2ljcy5BUkNBREUpO1xuICAgICAgdGhpcy5nYW1lLnBoeXNpY3MuYXJjYWRlLmdyYXZpdHkueSA9IDEwMDA7XG5cbiAgICAgIC8vIERldGVybWluZSB3aGVyZSBmaXJzdCBwbGF0Zm9ybSBhbmQgaGVybyB3aWxsIGJlXG4gICAgICB0aGlzLnN0YXJ0WSA9IHRoaXMuZ2FtZS5oZWlnaHQgLSA1O1xuICAgICAgdGhpcy5oZXJvID0gbmV3IHByZWZhYnMuSGVybyh0aGlzLmdhbWUsIDAsIDApO1xuICAgICAgdGhpcy5oZXJvLnJlc2V0UGxhY2VtZW50KHRoaXMuZ2FtZS53aWR0aCAqIDAuNSwgdGhpcy5zdGFydFkgLSB0aGlzLmhlcm8uaGVpZ2h0KTtcbiAgICAgIHRoaXMuZ2FtZS5hZGQuZXhpc3RpbmcodGhpcy5oZXJvKTtcblxuICAgICAgLy8gQ29udGFpbmVyc1xuICAgICAgdGhpcy5jb2lucyA9IHRoaXMuZ2FtZS5hZGQuZ3JvdXAoKTtcbiAgICAgIHRoaXMuYm9vc3RzID0gdGhpcy5nYW1lLmFkZC5ncm91cCgpO1xuICAgICAgdGhpcy5ib3RzID0gdGhpcy5nYW1lLmFkZC5ncm91cCgpO1xuXG4gICAgICAvLyBQbGF0Zm9ybXNcbiAgICAgIHRoaXMuYWRkUGxhdGZvcm1zKCk7XG5cbiAgICAgIC8vIEluaXRpYWxpemUgc2NvcmVcbiAgICAgIHRoaXMucmVzZXRTY29yZSgpO1xuICAgICAgdGhpcy51cGRhdGVTY29yZSgpO1xuXG4gICAgICAvLyBDdXJzb3JzLCBpbnB1dFxuICAgICAgdGhpcy5jdXJzb3JzID0gdGhpcy5nYW1lLmlucHV0LmtleWJvYXJkLmNyZWF0ZUN1cnNvcktleXMoKTtcbiAgICAgIHRoaXMuYWN0aW9uQnV0dG9uID0gdGhpcy5nYW1lLmlucHV0LmtleWJvYXJkLmFkZEtleShQaGFzZXIuS2V5Ym9hcmQuU1BBQ0VCQVIpO1xuICAgIH0sXG5cbiAgICAvLyBVcGRhdGVcbiAgICB1cGRhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgLy8gVGhpcyBpcyB3aGVyZSB0aGUgbWFpbiBtYWdpYyBoYXBwZW5zXG4gICAgICAvLyB0aGUgeSBvZmZzZXQgYW5kIHRoZSBoZWlnaHQgb2YgdGhlIHdvcmxkIGFyZSBhZGp1c3RlZFxuICAgICAgLy8gdG8gbWF0Y2ggdGhlIGhpZ2hlc3QgcG9pbnQgdGhlIGhlcm8gaGFzIHJlYWNoZWRcbiAgICAgIHRoaXMud29ybGQuc2V0Qm91bmRzKDAsIC10aGlzLmhlcm8ueUNoYW5nZSwgdGhpcy5nYW1lLndvcmxkLndpZHRoLFxuICAgICAgICB0aGlzLmdhbWUuaGVpZ2h0ICsgdGhpcy5oZXJvLnlDaGFuZ2UpO1xuXG4gICAgICAvLyBUaGUgYnVpbHQgaW4gY2FtZXJhIGZvbGxvdyBtZXRob2RzIHdvbid0IHdvcmsgZm9yIG91ciBuZWVkc1xuICAgICAgLy8gdGhpcyBpcyBhIGN1c3RvbSBmb2xsb3cgc3R5bGUgdGhhdCB3aWxsIG5vdCBldmVyIG1vdmUgZG93biwgaXQgb25seSBtb3ZlcyB1cFxuICAgICAgdGhpcy5jYW1lcmFZTWluID0gTWF0aC5taW4odGhpcy5jYW1lcmFZTWluLCB0aGlzLmhlcm8ueSAtIHRoaXMuZ2FtZS5oZWlnaHQgLyAyKTtcbiAgICAgIHRoaXMuY2FtZXJhLnkgPSB0aGlzLmNhbWVyYVlNaW47XG5cbiAgICAgIC8vIElmIGhlcm8gZmFsbHMgYmVsb3cgY2FtZXJhXG4gICAgICBpZiAodGhpcy5oZXJvLnkgPiB0aGlzLmNhbWVyYVlNaW4gKyB0aGlzLmdhbWUuaGVpZ2h0ICsgMjAwKSB7XG4gICAgICAgIHRoaXMuZ2FtZU92ZXIoKTtcbiAgICAgIH1cblxuICAgICAgLy8gTW92ZSBoZXJvXG4gICAgICB0aGlzLmhlcm8uYm9keS52ZWxvY2l0eS54ID1cbiAgICAgICAgKHRoaXMuY3Vyc29ycy5sZWZ0LmlzRG93bikgPyAtKHRoaXMuZ2FtZS5waHlzaWNzLmFyY2FkZS5ncmF2aXR5LnkgLyA1KSA6XG4gICAgICAgICh0aGlzLmN1cnNvcnMucmlnaHQuaXNEb3duKSA/ICh0aGlzLmdhbWUucGh5c2ljcy5hcmNhZGUuZ3Jhdml0eS55IC8gNSkgOiAwO1xuXG4gICAgICAvLyBQbGF0Zm9ybSBjb2xsaXNpb25zXG4gICAgICB0aGlzLmdhbWUucGh5c2ljcy5hcmNhZGUuY29sbGlkZSh0aGlzLmhlcm8sIHRoaXMucGxhdGZvcm1zLCB0aGlzLnVwZGF0ZUhlcm9QbGF0Zm9ybSwgbnVsbCwgdGhpcyk7XG4gICAgICB0aGlzLmdhbWUucGh5c2ljcy5hcmNhZGUuY29sbGlkZSh0aGlzLmhlcm8sIHRoaXMuYmFzZSwgdGhpcy51cGRhdGVIZXJvUGxhdGZvcm0sIG51bGwsIHRoaXMpO1xuXG4gICAgICAvLyBDb2luIGNvbGxpc2lvbnNcbiAgICAgIHRoaXMuZ2FtZS5waHlzaWNzLmFyY2FkZS5vdmVybGFwKHRoaXMuaGVybywgdGhpcy5jb2lucywgZnVuY3Rpb24oaGVybywgY29pbikge1xuICAgICAgICBjb2luLmtpbGwoKTtcbiAgICAgICAgdGhpcy51cGRhdGVTY29yZSh0aGlzLnNjb3JlQ29pbik7XG4gICAgICB9LCBudWxsLCB0aGlzKTtcblxuICAgICAgLy8gQm9vc3RzIGNvbGxpc2lvbnNcbiAgICAgIHRoaXMuZ2FtZS5waHlzaWNzLmFyY2FkZS5vdmVybGFwKHRoaXMuaGVybywgdGhpcy5ib29zdHMsIGZ1bmN0aW9uKGhlcm8sIGJvb3N0KSB7XG4gICAgICAgIGJvb3N0LmtpbGwoKTtcbiAgICAgICAgdGhpcy51cGRhdGVTY29yZSh0aGlzLnNjb3JlQm9vc3QpO1xuICAgICAgICBoZXJvLmJvZHkudmVsb2NpdHkueSA9IHRoaXMuZ2FtZS5waHlzaWNzLmFyY2FkZS5ncmF2aXR5LnkgKiAtMSAqIDEuNTtcbiAgICAgIH0sIG51bGwsIHRoaXMpO1xuXG4gICAgICAvLyBCb3R1bGlzbSBjb2xsaXNpb25zLiAgSWYgaGVyb2sganVtcHMgb24gdG9wLCB0aGVuIGtpbGwsIG90aGVyd2lzZSBkaWVcbiAgICAgIHRoaXMuZ2FtZS5waHlzaWNzLmFyY2FkZS5jb2xsaWRlKHRoaXMuaGVybywgdGhpcy5ib3RzLCBmdW5jdGlvbihoZXJvLCBib3QpIHtcbiAgICAgICAgaWYgKGhlcm8uYm9keS50b3VjaGluZy5kb3duKSB7XG4gICAgICAgICAgYm90LmtpbGwoKTtcbiAgICAgICAgICB0aGlzLnVwZGF0ZVNjb3JlKHRoaXMuc2NvcmVCb3QpO1xuICAgICAgICAgIGhlcm8uYm9keS52ZWxvY2l0eS55ID0gdGhpcy5nYW1lLnBoeXNpY3MuYXJjYWRlLmdyYXZpdHkueSAqIC0xICogMC41O1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIHRoaXMuZ2FtZU92ZXIoKTtcbiAgICAgICAgfVxuICAgICAgfSwgbnVsbCwgdGhpcyk7XG5cbiAgICAgIC8vIEZvciBlYWNoIHBsYXRmb3JtLCBmaW5kIG91dCB3aGljaCBpcyB0aGUgaGlnaGVzdFxuICAgICAgLy8gaWYgb25lIGdvZXMgYmVsb3cgdGhlIGNhbWVyYSB2aWV3LCB0aGVuIGNyZWF0ZSBhIG5ld1xuICAgICAgLy8gb25lIGF0IGEgZGlzdGFuY2UgZnJvbSB0aGUgaGlnaGVzdCBvbmVcbiAgICAgIC8vIHRoZXNlIGFyZSBwb29sZWQgc28gdGhleSBhcmUgdmVyeSBwZXJmb3JtYW50LlxuICAgICAgdGhpcy5wbGF0Zm9ybXMuZm9yRWFjaEFsaXZlKGZ1bmN0aW9uKHApIHtcbiAgICAgICAgdmFyIHBsYXRmb3JtO1xuICAgICAgICB0aGlzLnBsYXRmb3JtWU1pbiA9IE1hdGgubWluKHRoaXMucGxhdGZvcm1ZTWluLCBwLnkpO1xuXG4gICAgICAgIC8vIENoZWNrIGlmIHRoaXMgb25lIGlzIG9mIHRoZSBzY3JlZW5cbiAgICAgICAgaWYgKHAueSA+IHRoaXMuY2FtZXJhLnkgKyB0aGlzLmdhbWUuaGVpZ2h0KSB7XG4gICAgICAgICAgcC5raWxsKCk7XG4gICAgICAgICAgcGxhdGZvcm0gPSB0aGlzLnBsYXRmb3Jtcy5nZXRGaXJzdERlYWQoKTtcbiAgICAgICAgICB0aGlzLnBsYWNlUGxhdGZvcm0odGhpcy5wbGF0Zm9ybXMuZ2V0Rmlyc3REZWFkKCksIHRoaXMucGxhdGZvcm1zLmdldFRvcCgpKTtcbiAgICAgICAgfVxuICAgICAgfSwgdGhpcyk7XG5cbiAgICAgIC8vIFJlbW92ZSBhbnkgZmx1ZmZcbiAgICAgIFtcImNvaW5zXCIsIFwiYm9vc3RzXCIsIFwiYm90c1wiXS5mb3JFYWNoKF8uYmluZChmdW5jdGlvbihwb29sKSB7XG4gICAgICAgIHRoaXNbcG9vbF0uZm9yRWFjaEFsaXZlKGZ1bmN0aW9uKHApIHtcbiAgICAgICAgICAvLyBDaGVjayBpZiB0aGlzIG9uZSBpcyBvZiB0aGUgc2NyZWVuXG4gICAgICAgICAgaWYgKHAueSA+IHRoaXMuY2FtZXJhLnkgKyB0aGlzLmdhbWUuaGVpZ2h0KSB7XG4gICAgICAgICAgICBwLmtpbGwoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0sIHRoaXMpO1xuICAgICAgfSwgdGhpcykpO1xuXG4gICAgICAvLyBVcGRhdGUgc2NvcmVcbiAgICAgIHRoaXMudXBkYXRlU2NvcmUoKTtcbiAgICB9LFxuXG4gICAgLy8gUGxhdGZvcm0gY29sbGlzaW9uXG4gICAgdXBkYXRlSGVyb1BsYXRmb3JtOiBmdW5jdGlvbihoZXJvKSB7XG4gICAgICBoZXJvLmJvZHkudmVsb2NpdHkueSA9IHRoaXMuZ2FtZS5waHlzaWNzLmFyY2FkZS5ncmF2aXR5LnkgKiAtMSAqIDAuNztcbiAgICB9LFxuXG4gICAgLy8gU2h1dGRvd25cbiAgICBzaHV0ZG93bjogZnVuY3Rpb24oKSB7XG4gICAgICAvLyBSZXNldCBldmVyeXRoaW5nLCBvciB0aGUgd29ybGQgd2lsbCBiZSBtZXNzZWQgdXBcbiAgICAgIHRoaXMud29ybGQuc2V0Qm91bmRzKDAsIDAsIHRoaXMuZ2FtZS53aWR0aCwgdGhpcy5nYW1lLmhlaWdodCk7XG4gICAgICB0aGlzLmN1cnNvciA9IG51bGw7XG4gICAgICB0aGlzLnJlc2V0Vmlld1RyYWNraW5nKCk7XG4gICAgICB0aGlzLnJlc2V0U2NvcmUoKTtcblxuICAgICAgW1wiaGVyb1wiLCBcInBsYXRmb3Jtc1wiLCBcImNvaW5zXCIsIFwiYm9vc3RzXCIsIFwic2NvcmVHcm91cFwiXS5mb3JFYWNoKF8uYmluZChmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgIHRoaXNbaXRlbV0uZGVzdHJveSgpO1xuICAgICAgICB0aGlzW2l0ZW1dID0gbnVsbDtcbiAgICAgIH0sIHRoaXMpKTtcbiAgICB9LFxuXG4gICAgLy8gR2FtZSBvdmVyXG4gICAgZ2FtZU92ZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgLy8gQ2FuJ3Qgc2VlbSB0byBmaW5kIGEgd2F5IHRvIHBhc3MgdGhlIHNjb3JlXG4gICAgICAvLyB2aWEgYSBzdGF0ZSBjaGFuZ2UuXG4gICAgICB0aGlzLmdhbWUucGlja2xlLnNjb3JlID0gdGhpcy5zY29yZTtcbiAgICAgIHRoaXMuZ2FtZS5zdGF0ZS5zdGFydChcImdhbWVvdmVyXCIpO1xuICAgIH0sXG5cbiAgICAvLyBBZGQgcGxhdGZvcm0gcG9vbCBhbmQgY3JlYXRlIGluaXRpYWwgb25lXG4gICAgYWRkUGxhdGZvcm1zOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMucGxhdGZvcm1zID0gdGhpcy5nYW1lLmFkZC5ncm91cCgpO1xuXG4gICAgICAvLyBBZGQgZmlyc3QgcGxhdGZvcm0uICBUT0RPOiBDaGFuZ2UgdG8gaXRzIG93biBwcmVmYWIsIHNwcml0ZVxuICAgICAgdGhpcy5iYXNlID0gbmV3IHByZWZhYnMuUGxhdGZvcm0odGhpcy5nYW1lLCB0aGlzLmdhbWUud2lkdGggKiAwLjUsIHRoaXMuc3RhcnRZLCB0aGlzLmdhbWUud2lkdGggKiAyKTtcbiAgICAgIHRoaXMuZ2FtZS5hZGQuZXhpc3RpbmcodGhpcy5iYXNlKTtcblxuICAgICAgLy8gQWRkIHNvbWUgYmFzZSBwbGF0Zm9ybXNcbiAgICAgIHZhciBwcmV2aW91cztcbiAgICAgIF8uZWFjaChfLnJhbmdlKDIwKSwgXy5iaW5kKGZ1bmN0aW9uKGkpIHtcbiAgICAgICAgdmFyIHAgPSBuZXcgcHJlZmFicy5QbGF0Zm9ybSh0aGlzLmdhbWUsIDAsIDApO1xuICAgICAgICB0aGlzLnBsYWNlUGxhdGZvcm0ocCwgcHJldmlvdXMsIHRoaXMud29ybGQuaGVpZ2h0IC0gdGhpcy5wbGF0Zm9ybVNwYWNlWSAtIHRoaXMucGxhdGZvcm1TcGFjZVkgKiBpKTtcbiAgICAgICAgdGhpcy5wbGF0Zm9ybXMuYWRkKHApO1xuICAgICAgICBwcmV2aW91cyA9IHA7XG4gICAgICB9LCB0aGlzKSk7XG4gICAgfSxcblxuICAgIC8vIFBsYWNlIHBsYXRmb3JtXG4gICAgcGxhY2VQbGF0Zm9ybTogZnVuY3Rpb24ocGxhdGZvcm0sIHByZXZpb3VzUGxhdGZvcm0sIG92ZXJyaWRlWSkge1xuICAgICAgcGxhdGZvcm0ucmVzZXRTZXR0aW5ncygpO1xuICAgICAgdmFyIHkgPSBvdmVycmlkZVkgfHwgdGhpcy5wbGF0Zm9ybVlNaW4gLSB0aGlzLnBsYXRmb3JtU3BhY2VZO1xuICAgICAgdmFyIG1pblggPSBwbGF0Zm9ybS5taW5YO1xuICAgICAgdmFyIG1heFggPSBwbGF0Zm9ybS5tYXhYO1xuXG4gICAgICAvLyBEZXRlcm1pbmUgeCBiYXNlZCBvbiBwcmV2aW91c1BsYXRmb3JtXG4gICAgICB2YXIgeCA9IHRoaXMucm5kLmludGVnZXJJblJhbmdlKG1pblgsIG1heFgpO1xuICAgICAgaWYgKHByZXZpb3VzUGxhdGZvcm0pIHtcbiAgICAgICAgeCA9IHRoaXMucm5kLmludGVnZXJJblJhbmdlKHByZXZpb3VzUGxhdGZvcm0ueCAtIHRoaXMucGxhdGZvcm1HYXBNYXgsIHByZXZpb3VzUGxhdGZvcm0ueCArIHRoaXMucGxhdGZvcm1HYXBNYXgpO1xuXG4gICAgICAgIC8vIFNvbWUgbG9naWMgdG8gdHJ5IHRvIHdyYXBcbiAgICAgICAgeCA9ICh4IDwgMCkgPyBNYXRoLm1pbihtYXhYLCB0aGlzLndvcmxkLndpZHRoICsgeCkgOiBNYXRoLm1heCh4LCBtaW5YKTtcbiAgICAgICAgeCA9ICh4ID4gdGhpcy53b3JsZC53aWR0aCkgPyBNYXRoLm1heChtaW5YLCB4IC0gdGhpcy53b3JsZC53aWR0aCkgOiBNYXRoLm1pbih4LCBtYXhYKTtcbiAgICAgIH1cblxuICAgICAgLy8gUGxhY2VcbiAgICAgIHBsYXRmb3JtLnJlc2V0KHgsIHkpO1xuXG4gICAgICAvLyBBZGQgc29tZSBmbHVmZlxuICAgICAgdGhpcy5mbHVmZlBsYXRmb3JtKHBsYXRmb3JtKTtcbiAgICB9LFxuXG4gICAgLy8gQWRkIHBvc3NpYmxlIGZsdWZmIHRvIHBsYXRmb3JtXG4gICAgZmx1ZmZQbGF0Zm9ybTogZnVuY3Rpb24ocGxhdGZvcm0pIHtcbiAgICAgIHZhciB4ID0gcGxhdGZvcm0ueDtcbiAgICAgIHZhciB5ID0gcGxhdGZvcm0ueSAtIHBsYXRmb3JtLmhlaWdodCAvIDIgLSAzMDtcblxuICAgICAgLy8gQWRkIGZsdWZmXG4gICAgICBpZiAoTWF0aC5yYW5kb20oKSA8PSB0aGlzLmhvdmVyQ2hhbmNlKSB7XG4gICAgICAgIHBsYXRmb3JtLmhvdmVyID0gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKE1hdGgucmFuZG9tKCkgPD0gdGhpcy5jb2luQ2hhbmNlKSB7XG4gICAgICAgIHRoaXMuYWRkV2l0aFBvb2wodGhpcy5jb2lucywgXCJDb2luXCIsIHgsIHkpO1xuICAgICAgfVxuICAgICAgZWxzZSBpZiAoTWF0aC5yYW5kb20oKSA8PSB0aGlzLmJvb3N0Q2hhbmNlKSB7XG4gICAgICAgIHRoaXMuYWRkV2l0aFBvb2wodGhpcy5ib29zdHMsIFwiQm9vc3RcIiwgeCwgeSk7XG4gICAgICB9XG4gICAgICBlbHNlIGlmIChNYXRoLnJhbmRvbSgpIDw9IHRoaXMuYm90Q2hhbmNlKSB7XG4gICAgICAgIHRoaXMuYWRkV2l0aFBvb2wodGhpcy5ib3RzLCBcIkJvdHVsaXNtXCIsIHgsIHkpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICAvLyBHZW5lcmljIGFkZCB3aXRoIHBvb2xpbmcgZnVuY3Rpb25hbGxpdHlcbiAgICBhZGRXaXRoUG9vbDogZnVuY3Rpb24ocG9vbCwgcHJlZmFiLCB4LCB5KSB7XG4gICAgICB2YXIgbyA9IHBvb2wuZ2V0Rmlyc3REZWFkKCk7XG4gICAgICBvID0gbyB8fCBuZXcgcHJlZmFic1twcmVmYWJdKHRoaXMuZ2FtZSwgeCwgeSk7XG5cbiAgICAgIC8vIFVzZSBjdXN0b20gcmVzZXQgaWYgYXZhaWxhYmxlXG4gICAgICBpZiAoby5yZXNldFBsYWNlbWVudCkge1xuICAgICAgICBvLnJlc2V0UGxhY2VtZW50KHgsIHkpO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIG8ucmVzZXQoeCwgeSk7XG4gICAgICB9XG5cbiAgICAgIHBvb2wuYWRkKG8pO1xuICAgIH0sXG5cbiAgICAvLyBVcGRhdGUgc2NvcmUuICBTY29yZSBpcyB0aGUgc2NvcmUgd2l0aG91dCBob3cgZmFyIHRoZXkgaGF2ZSBnb25lIHVwLlxuICAgIHVwZGF0ZVNjb3JlOiBmdW5jdGlvbihhZGRpdGlvbikge1xuICAgICAgYWRkaXRpb24gPSBhZGRpdGlvbiB8fCAwO1xuICAgICAgdGhpcy5zY29yZVVwID0gKC10aGlzLmNhbWVyYVlNaW4gPj0gOTk5OTk5OSkgPyAwIDpcbiAgICAgICAgTWF0aC5taW4oTWF0aC5tYXgoMCwgLXRoaXMuY2FtZXJhWU1pbiksIDk5OTk5OTkgLSAxKTtcbiAgICAgIHRoaXMuc2NvcmVDb2xsZWN0ID0gKHRoaXMuc2NvcmVDb2xsZWN0IHx8IDApICsgYWRkaXRpb247XG4gICAgICB0aGlzLnNjb3JlID0gTWF0aC5yb3VuZCh0aGlzLnNjb3JlVXAgKyB0aGlzLnNjb3JlQ29sbGVjdCk7XG5cbiAgICAgIC8vIFNjb3JlIHRleHRcbiAgICAgIGlmICghdGhpcy5zY29yZUdyb3VwKSB7XG4gICAgICAgIHRoaXMuc2NvcmVHcm91cCA9IHRoaXMuZ2FtZS5hZGQuZ3JvdXAoKTtcblxuICAgICAgICAvLyBTY29yZSBsYWJlbFxuICAgICAgICB0aGlzLnNjb3JlTGFiZWxJbWFnZSA9IHRoaXMuZ2FtZS5hZGQuc3ByaXRlKFxuICAgICAgICAgIHRoaXMucGFkZGluZyxcbiAgICAgICAgICB0aGlzLnBhZGRpbmcgKiAwLjg1LCBcInBsYXktc3ByaXRlc1wiLCBcInlvdXItc2NvcmUucG5nXCIpO1xuICAgICAgICB0aGlzLnNjb3JlTGFiZWxJbWFnZS5hbmNob3Iuc2V0VG8oMCwgMCk7XG4gICAgICAgIHRoaXMuc2NvcmVMYWJlbEltYWdlLnNjYWxlLnNldFRvKCh0aGlzLmdhbWUud2lkdGggLyA2KSAvIHRoaXMuc2NvcmVMYWJlbEltYWdlLndpZHRoKTtcbiAgICAgICAgdGhpcy5zY29yZUdyb3VwLmFkZCh0aGlzLnNjb3JlTGFiZWxJbWFnZSk7XG5cbiAgICAgICAgLy8gU2NvcmUgdGV4dFxuICAgICAgICB0aGlzLnNjb3JlVGV4dCA9IHRoaXMuZ2FtZS5hZGQudGV4dChcbiAgICAgICAgICB0aGlzLnNjb3JlTGFiZWxJbWFnZS53aWR0aCArICh0aGlzLnBhZGRpbmcgKiAyKSxcbiAgICAgICAgICB0aGlzLnBhZGRpbmcgKiAwLjI1LFxuICAgICAgICAgIHRoaXMuc2NvcmUudG9Mb2NhbGVTdHJpbmcoKSwge1xuICAgICAgICAgICAgZm9udDogXCJib2xkIFwiICsgKHRoaXMuZ2FtZS53b3JsZC5oZWlnaHQgLyA0MCkgKyBcInB4IERvc2lzXCIsXG4gICAgICAgICAgICBmaWxsOiBcIiMzOWI1NGFcIixcbiAgICAgICAgICAgIGFsaWduOiBcImxlZnRcIixcbiAgICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5zY29yZVRleHQuYW5jaG9yLnNldFRvKDAsIDApO1xuICAgICAgICB0aGlzLnNjb3JlR3JvdXAuYWRkKHRoaXMuc2NvcmVUZXh0KTtcblxuICAgICAgICB0aGlzLnNjb3JlR3JvdXAuZml4ZWRUb0NhbWVyYSA9IHRydWU7XG4gICAgICAgIHRoaXMuc2NvcmVHcm91cC5jYW1lcmFPZmZzZXQuc2V0VG8odGhpcy5wYWRkaW5nLCB0aGlzLnBhZGRpbmcpO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHRoaXMuc2NvcmVUZXh0LnRleHQgPSB0aGlzLnNjb3JlLnRvTG9jYWxlU3RyaW5nKCk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIC8vIFJlc2V0IHNjb3JlXG4gICAgcmVzZXRTY29yZTogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnNjb3JlVXAgPSAwO1xuICAgICAgdGhpcy5zY29yZUNvbGxlY3QgPSAwO1xuICAgICAgdGhpcy5zY29yZSA9IDA7XG4gICAgfSxcblxuICAgIC8vIFJlc2V0IHZpZXcgdHJhY2tpbmdcbiAgICByZXNldFZpZXdUcmFja2luZzogZnVuY3Rpb24oKSB7XG4gICAgICAvLyBDYW1lcmEgYW5kIHBsYXRmb3JtIHRyYWNraW5nIHZhcnNcbiAgICAgIHRoaXMuY2FtZXJhWU1pbiA9IDk5OTk5OTk7XG4gICAgICB0aGlzLnBsYXRmb3JtWU1pbiA9IDk5OTk5OTk7XG4gICAgfSxcblxuICAgIC8vIEdlbmVyYWwgdG91Y2hpbmdcbiAgICBpc1RvdWNoaW5nOiBmdW5jdGlvbihib2R5KSB7XG4gICAgICBpZiAoYm9keSAmJiBib2R5LnRvdWNoKSB7XG4gICAgICAgIHJldHVybiAoYm9keS50b3VjaGluZy51cCB8fCBib2R5LnRvdWNoaW5nLmRvd24gfHxcbiAgICAgICAgICBib2R5LnRvdWNoaW5nLmxlZnQgfHwgYm9keS50b3VjaGluZy5yaWdodCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH0pO1xuXG4gIC8vIEV4cG9ydFxuICBtb2R1bGUuZXhwb3J0cyA9IFBsYXk7XG59KSgpO1xuIl19
