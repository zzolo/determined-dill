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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy96em9sby9Db2RlL3BlcnNvbmFsL3BpY2tsZS1qdW1wZXIvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIi9Vc2Vycy96em9sby9Db2RlL3BlcnNvbmFsL3BpY2tsZS1qdW1wZXIvanMvZmFrZV9iZDU3NTQwYi5qcyIsIi9Vc2Vycy96em9sby9Db2RlL3BlcnNvbmFsL3BpY2tsZS1qdW1wZXIvanMvcGlja2xlLWp1bXBlci9wcmVmYWItYm9vc3QuanMiLCIvVXNlcnMvenpvbG8vQ29kZS9wZXJzb25hbC9waWNrbGUtanVtcGVyL2pzL3BpY2tsZS1qdW1wZXIvcHJlZmFiLWJvdHVsaXNtLmpzIiwiL1VzZXJzL3p6b2xvL0NvZGUvcGVyc29uYWwvcGlja2xlLWp1bXBlci9qcy9waWNrbGUtanVtcGVyL3ByZWZhYi1jb2luLmpzIiwiL1VzZXJzL3p6b2xvL0NvZGUvcGVyc29uYWwvcGlja2xlLWp1bXBlci9qcy9waWNrbGUtanVtcGVyL3ByZWZhYi1oZXJvLmpzIiwiL1VzZXJzL3p6b2xvL0NvZGUvcGVyc29uYWwvcGlja2xlLWp1bXBlci9qcy9waWNrbGUtanVtcGVyL3ByZWZhYi1wbGF0Zm9ybS5qcyIsIi9Vc2Vycy96em9sby9Db2RlL3BlcnNvbmFsL3BpY2tsZS1qdW1wZXIvanMvcGlja2xlLWp1bXBlci9zdGF0ZS1nYW1lb3Zlci5qcyIsIi9Vc2Vycy96em9sby9Db2RlL3BlcnNvbmFsL3BpY2tsZS1qdW1wZXIvanMvcGlja2xlLWp1bXBlci9zdGF0ZS1tZW51LmpzIiwiL1VzZXJzL3p6b2xvL0NvZGUvcGVyc29uYWwvcGlja2xlLWp1bXBlci9qcy9waWNrbGUtanVtcGVyL3N0YXRlLXBsYXkuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM1VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKiBnbG9iYWwgXzpmYWxzZSwgJDpmYWxzZSwgUGhhc2VyOmZhbHNlICovXG5cbi8qKlxuICogTWFpbiBKUyBmb3IgUGlja2xlIEp1bXBlclxuICovXG5cbihmdW5jdGlvbigpIHtcbiAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgLy8gRGVwZW5kZW5jaWVzXG4gIHZhciBzdGF0ZXMgPSB7XG4gICAgR2FtZW92ZXI6IHJlcXVpcmUoXCIuL3BpY2tsZS1qdW1wZXIvc3RhdGUtZ2FtZW92ZXIuanNcIiksXG4gICAgUGxheTogcmVxdWlyZShcIi4vcGlja2xlLWp1bXBlci9zdGF0ZS1wbGF5LmpzXCIpLFxuICAgIE1lbnU6IHJlcXVpcmUoXCIuL3BpY2tsZS1qdW1wZXIvc3RhdGUtbWVudS5qc1wiKSxcbiAgfTtcblxuICAvLyBDb25zdHJ1Y3RvcmUgZm9yIFBpY2tsZVxuICB2YXIgUGlja2xlID0gd2luZG93LlBpY2tsZSA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuICAgIHRoaXMuZWwgPSB0aGlzLm9wdGlvbnMuZWw7XG4gICAgdGhpcy4kZWwgPSAkKHRoaXMub3B0aW9ucy5lbCk7XG4gICAgdGhpcy4kID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gJChvcHRpb25zLmVsKS5maW5kO1xuICAgIH07XG5cbiAgICB0aGlzLndpZHRoID0gdGhpcy4kZWwud2lkdGgoKTtcbiAgICB0aGlzLmhlaWdodCA9ICQod2luZG93KS5oZWlnaHQoKTtcblxuICAgIC8vIFN0YXJ0XG4gICAgdGhpcy5zdGFydCgpO1xuICB9O1xuXG4gIC8vIEFkZCBwcm9wZXJ0aWVzXG4gIF8uZXh0ZW5kKFBpY2tsZS5wcm90b3R5cGUsIHtcbiAgICAvLyBTdGFydCBldmVyeXRoaW5nXG4gICAgc3RhcnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgLy8gQ3JlYXRlIFBoYXNlciBnYW1lXG4gICAgICB0aGlzLmdhbWUgPSBuZXcgUGhhc2VyLkdhbWUoXG4gICAgICAgIHRoaXMud2lkdGgsXG4gICAgICAgIHRoaXMuaGVpZ2h0LFxuICAgICAgICBQaGFzZXIuQVVUTyxcbiAgICAgICAgdGhpcy5lbC5yZXBsYWNlKFwiI1wiLCBcIlwiKSk7XG5cbiAgICAgIC8vIEFkZCByZWZlcmVuY2UgdG8gZ2FtZSwgc2luY2UgbW9zdCBwYXJ0cyBoYXZlIHRoaXMgcmVmZXJlbmNlXG4gICAgICAvLyBhbHJlYWR5XG4gICAgICB0aGlzLmdhbWUucGlja2xlID0gdGhpcztcblxuICAgICAgLy8gUmVnaXN0ZXIgc3RhdGVzXG4gICAgICB0aGlzLmdhbWUuc3RhdGUuYWRkKFwibWVudVwiLCBzdGF0ZXMuTWVudSk7XG4gICAgICB0aGlzLmdhbWUuc3RhdGUuYWRkKFwicGxheVwiLCBzdGF0ZXMuUGxheSk7XG4gICAgICB0aGlzLmdhbWUuc3RhdGUuYWRkKFwiZ2FtZW92ZXJcIiwgc3RhdGVzLkdhbWVvdmVyKTtcblxuICAgICAgLy8gSGlnaHNjb3JlXG4gICAgICB0aGlzLmhpZ2hzY29yZUxpbWl0ID0gMTA7XG4gICAgICB0aGlzLmdldEhpZ2hzY29yZXMoKTtcblxuICAgICAgLy8gU3RhcnQgd2l0aCBtZW51XG4gICAgICB0aGlzLmdhbWUuc3RhdGUuc3RhcnQoXCJtZW51XCIpO1xuXG4gICAgICAvLyBEZWJ1Z1xuICAgICAgaWYgKHRoaXMub3B0aW9ucy5kZWJ1ZyAmJiB0aGlzLmdhbWUuY2FtZXJhKSB7XG4gICAgICAgIHRoaXMuZ2FtZS5kZWJ1Zy5jYW1lcmFJbmZvKHRoaXMuZ2FtZS5jYW1lcmEsIDEwLCAxMCk7XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLm9wdGlvbnMuZGVidWcpIHtcbiAgICAgICAgdGhpcy5yZXNldEhpZ2hzY29yZXMoKTtcbiAgICAgICAgdGhpcy5nZXRIaWdoc2NvcmVzKCk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIC8vIEdldCBoaWdoIHNjb3Jlc1xuICAgIGdldEhpZ2hzY29yZXM6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHMgPSB3aW5kb3cubG9jYWxTdG9yYWdlLmdldEl0ZW0oXCJoaWdoc2NvcmVzXCIpO1xuICAgICAgcyA9IChzKSA/IEpTT04ucGFyc2UocykgOiBbXTtcbiAgICAgIHRoaXMuaGlnaHNjb3JlcyA9IHM7XG4gICAgICB0aGlzLnNvcnRIaWdoc2NvcmVzKCk7XG4gICAgICByZXR1cm4gdGhpcy5oaWdoc2NvcmVzO1xuICAgIH0sXG5cbiAgICAvLyBHZXQgaGlnaGVzdCBzY29yZVxuICAgIGdldEhpZ2hzY29yZTogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gXy5tYXgodGhpcy5oaWdoc2NvcmVzLCBcInNjb3JlXCIpO1xuICAgIH0sXG5cbiAgICAvLyBTZXQgc2luZ2xlIGhpZ2hzY29yZVxuICAgIHNldEhpZ2hzY29yZTogZnVuY3Rpb24oc2NvcmUsIG5hbWUpIHtcbiAgICAgIGlmICh0aGlzLmlzSGlnaHNjb3JlKHNjb3JlKSkge1xuICAgICAgICB0aGlzLnNvcnRIaWdoc2NvcmVzKCk7XG5cbiAgICAgICAgLy8gUmVtb3ZlIGxvd2VzdCBvbmUgaWYgbmVlZGVkXG4gICAgICAgIGlmICh0aGlzLmhpZ2hzY29yZXMubGVuZ3RoID49IHRoaXMuaGlnaHNjb3JlTGltaXQpIHtcbiAgICAgICAgICB0aGlzLmhpZ2hzY29yZXMuc2hpZnQoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEFkZCBuZXcgc2NvcmVcbiAgICAgICAgdGhpcy5oaWdoc2NvcmVzLnB1c2goe1xuICAgICAgICAgIG5hbWU6IG5hbWUsXG4gICAgICAgICAgc2NvcmU6IHNjb3JlXG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIFNvcnQgYW5kIHNldFxuICAgICAgICB0aGlzLnNvcnRIaWdoc2NvcmVzKCk7XG4gICAgICAgIHRoaXMuc2V0SGlnaHNjb3JlcygpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICAvLyBTb3J0IGhpZ2hzY29yZXNcbiAgICBzb3J0SGlnaHNjb3JlczogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLmhpZ2hzY29yZXMgPSBfLnNvcnRCeSh0aGlzLmhpZ2hzY29yZXMsIFwic2NvcmVcIik7XG4gICAgfSxcblxuICAgIC8vIElzIGhpZ2hzY29yZS4gIElzIHRoZSBzY29yZSBoaWdoZXIgdGhhbiB0aGUgbG93ZXN0XG4gICAgLy8gcmVjb3JkZWQgc2NvcmVcbiAgICBpc0hpZ2hzY29yZTogZnVuY3Rpb24oc2NvcmUpIHtcbiAgICAgIHZhciBtaW4gPSBfLm1pbih0aGlzLmhpZ2hzY29yZXMsIFwic2NvcmVcIikuc2NvcmU7XG4gICAgICByZXR1cm4gKHNjb3JlID4gbWluIHx8IHRoaXMuaGlnaHNjb3Jlcy5sZW5ndGggPCB0aGlzLmhpZ2hzY29yZUxpbWl0KTtcbiAgICB9LFxuXG4gICAgLy8gQ2hlY2sgaWYgc2NvcmUgaXMgaGlnaGVzdCBzY29yZVxuICAgIGlzSGlnaGVzdFNjb3JlOiBmdW5jdGlvbihzY29yZSkge1xuICAgICAgdmFyIG1heCA9IF8ubWF4KHRoaXMuaGlnaHNjb3JlcywgXCJzY29yZVwiKS5zY29yZSB8fCAwO1xuICAgICAgcmV0dXJuIChzY29yZSA+IG1heCk7XG4gICAgfSxcblxuICAgIC8vIFNldCBoaWdoc2NvcmVzXG4gICAgc2V0SGlnaHNjb3JlczogZnVuY3Rpb24oKSB7XG4gICAgICB3aW5kb3cubG9jYWxTdG9yYWdlLnNldEl0ZW0oXCJoaWdoc2NvcmVzXCIsIEpTT04uc3RyaW5naWZ5KHRoaXMuaGlnaHNjb3JlcykpO1xuICAgIH0sXG5cbiAgICAvLyBSZXNldCBoaWdoc2Nob3Jlc1xuICAgIHJlc2V0SGlnaHNjb3JlczogZnVuY3Rpb24oKSB7XG4gICAgICB3aW5kb3cubG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oXCJoaWdoc2NvcmVzXCIpO1xuICAgIH1cbiAgfSk7XG5cbiAgLy8gQ3JlYXRlIGFwcFxuICB2YXIgcDtcbiAgcCA9IG5ldyBQaWNrbGUoe1xuICAgIGVsOiBcIiNwaWNrbGUtanVtcGVyXCIsXG4gICAgZGVidWc6IGZhbHNlXG4gIH0pO1xufSkoKTtcbiIsIi8qIGdsb2JhbCBfOmZhbHNlLCBQaGFzZXI6ZmFsc2UgKi9cblxuLyoqXG4gKiBQcmVmYWIgKG9iamVjdHMpIGJvb3N0IGZvciBwbGF0Zm9ybXNcbiAqL1xuXG4oZnVuY3Rpb24oKSB7XG4gIFwidXNlIHN0cmljdFwiO1xuXG4gIC8vIENvbnN0cnVjdG9yIGZvciBCb29zdFxuICB2YXIgQm9vc3QgPSBmdW5jdGlvbihnYW1lLCB4LCB5KSB7XG4gICAgLy8gQ2FsbCBkZWZhdWx0IHNwcml0ZVxuICAgIFBoYXNlci5TcHJpdGUuY2FsbCh0aGlzLCBnYW1lLCB4LCB5LCBcInBsYXktc3ByaXRlc1wiLCBcImRpbGwucG5nXCIpO1xuXG4gICAgLy8gU2l6ZVxuICAgIHRoaXMuYW5jaG9yLnNldFRvKDAuNSwgMC41KTtcbiAgICB0aGlzLnNjYWxlLnNldFRvKCh0aGlzLmdhbWUud2lkdGggLyA5KSAvIHRoaXMud2lkdGgpO1xuXG4gICAgLy8gUGh5c2ljc1xuICAgIHRoaXMuZ2FtZS5waHlzaWNzLmFyY2FkZS5lbmFibGVCb2R5KHRoaXMpO1xuICAgIHRoaXMuYm9keS5hbGxvd0dyYXZpdHkgPSBmYWxzZTtcbiAgICB0aGlzLmJvZHkuaW1tb3ZhYmxlID0gdHJ1ZTtcbiAgfTtcblxuICAvLyBFeHRlbmQgZnJvbSBTcHJpdGVcbiAgQm9vc3QucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQaGFzZXIuU3ByaXRlLnByb3RvdHlwZSk7XG4gIEJvb3N0LnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEJvb3N0O1xuXG4gIC8vIEFkZCBtZXRob2RzXG4gIF8uZXh0ZW5kKEJvb3N0LnByb3RvdHlwZSwge1xuICAgIHVwZGF0ZTogZnVuY3Rpb24oKSB7XG5cbiAgICB9XG4gIH0pO1xuXG4gIC8vIEV4cG9ydFxuICBtb2R1bGUuZXhwb3J0cyA9IEJvb3N0O1xufSkoKTtcbiIsIi8qIGdsb2JhbCBfOmZhbHNlLCBQaGFzZXI6ZmFsc2UgKi9cblxuLyoqXG4gKiBQcmVmYWIgZm9yIEJvdHVsaXNtLCB0aGUgYmFkIGR1ZGVzXG4gKi9cblxuKGZ1bmN0aW9uKCkge1xuICBcInVzZSBzdHJpY3RcIjtcblxuICAvLyBDb25zdHJ1Y3RvclxuICB2YXIgQm90dWxpc20gPSBmdW5jdGlvbihnYW1lLCB4LCB5KSB7XG4gICAgLy8gQ2FsbCBkZWZhdWx0IHNwcml0ZVxuICAgIFBoYXNlci5TcHJpdGUuY2FsbCh0aGlzLCBnYW1lLCB4LCB5LCBcInBsYXktc3ByaXRlc1wiLCBcImJvdGNoeS5wbmdcIik7XG5cbiAgICAvLyBTaXplXG4gICAgdGhpcy5hbmNob3Iuc2V0VG8oMC41LCAwLjUpO1xuICAgIHRoaXMuc2NhbGUuc2V0VG8oKHRoaXMuZ2FtZS53aWR0aCAvIDEwKSAvIHRoaXMud2lkdGgpO1xuXG4gICAgLy8gQ29uZmlndXJlXG4gICAgdGhpcy5ob3ZlciA9IHRydWU7XG4gICAgdGhpcy5zZXRIb3ZlclNwZWVkKDEwMCk7XG4gICAgdGhpcy5ob3ZlclJhbmdlID0gMTAwO1xuXG4gICAgLy8gUGh5c2ljc1xuICAgIHRoaXMuZ2FtZS5waHlzaWNzLmFyY2FkZS5lbmFibGVCb2R5KHRoaXMpO1xuICAgIHRoaXMuYm9keS5hbGxvd0dyYXZpdHkgPSBmYWxzZTtcbiAgICB0aGlzLmJvZHkuaW1tb3ZhYmxlID0gdHJ1ZTtcblxuICAgIC8vIERldGVybWluZSBhbmNob3IgeCBib3VuZHNcbiAgICB0aGlzLnBhZGRpbmdYID0gMTA7XG4gICAgdGhpcy5yZXNldFBsYWNlbWVudCh4LCB5KTtcbiAgfTtcblxuICAvLyBFeHRlbmQgZnJvbSBTcHJpdGVcbiAgQm90dWxpc20ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQaGFzZXIuU3ByaXRlLnByb3RvdHlwZSk7XG4gIEJvdHVsaXNtLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEJvdHVsaXNtO1xuXG4gIC8vIEFkZCBtZXRob2RzXG4gIF8uZXh0ZW5kKEJvdHVsaXNtLnByb3RvdHlwZSwge1xuICAgIHVwZGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAvLyBEbyBob3ZlclxuICAgICAgaWYgKHRoaXMuaG92ZXIpIHtcbiAgICAgICAgdGhpcy5ib2R5LnZlbG9jaXR5LnggPSB0aGlzLmJvZHkudmVsb2NpdHkueCB8fCB0aGlzLmhvdmVyU3BlZWQ7XG4gICAgICAgIHRoaXMuYm9keS52ZWxvY2l0eS54ID0gKHRoaXMueCA8PSB0aGlzLm1pblgpID8gdGhpcy5ob3ZlclNwZWVkIDpcbiAgICAgICAgICAodGhpcy54ID49IHRoaXMubWF4WCkgPyAtdGhpcy5ob3ZlclNwZWVkIDogdGhpcy5ib2R5LnZlbG9jaXR5Lng7XG4gICAgICB9XG4gICAgfSxcblxuICAgIC8vIFNldCBob3ZlciBzcGVlZC4gIEFkZCBhIGJpdCBvZiB2YXJpYW5jZVxuICAgIHNldEhvdmVyU3BlZWQ6IGZ1bmN0aW9uKHNwZWVkKSB7XG4gICAgICB0aGlzLmhvdmVyU3BlZWQgPSBzcGVlZCArIHRoaXMuZ2FtZS5ybmQuaW50ZWdlckluUmFuZ2UoLTI1LCAyNSk7XG4gICAgfSxcblxuICAgIC8vIEdldCBhbmNob3IgYm91bmRzLiAgVGhpcyBpcyByZWxhdGl2ZSB0byB3aGVyZSB0aGUgcGxhdGZvcm0gaXNcbiAgICBnZXRBbmNob3JCb3VuZHNYOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMubWluWCA9IE1hdGgubWF4KHRoaXMueCAtIHRoaXMuaG92ZXJSYW5nZSwgdGhpcy5wYWRkaW5nWCArICh0aGlzLndpZHRoIC8gMikpO1xuICAgICAgdGhpcy5tYXhYID0gTWF0aC5taW4odGhpcy54ICsgdGhpcy5ob3ZlclJhbmdlLCB0aGlzLmdhbWUud2lkdGggLSAodGhpcy5wYWRkaW5nWCArICh0aGlzLndpZHRoIC8gMikpKTtcbiAgICAgIHJldHVybiBbdGhpcy5taW5YLCB0aGlzLm1heFhdO1xuICAgIH0sXG5cbiAgICAvLyBSZXNldCB0aGluZ3NcbiAgICByZXNldFBsYWNlbWVudDogZnVuY3Rpb24oeCwgeSkge1xuICAgICAgdGhpcy5yZXNldCh4LCB5KTtcbiAgICAgIHRoaXMuYm9keS52ZWxvY2l0eS54ID0gMDtcbiAgICAgIHRoaXMuZ2V0QW5jaG9yQm91bmRzWCgpO1xuICAgIH1cbiAgfSk7XG5cbiAgLy8gRXhwb3J0XG4gIG1vZHVsZS5leHBvcnRzID0gQm90dWxpc207XG59KSgpO1xuIiwiLyogZ2xvYmFsIF86ZmFsc2UsIFBoYXNlcjpmYWxzZSAqL1xuXG4vKipcbiAqIFByZWZhYiBDb2luIHR5cGUgaXRlbVxuICovXG5cbihmdW5jdGlvbigpIHtcbiAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgLy8gQ29uc3RydWN0b3IgZm9yIGNvaW5cbiAgdmFyIENvaW4gPSBmdW5jdGlvbihnYW1lLCB4LCB5KSB7XG4gICAgLy8gQ2FsbCBkZWZhdWx0IHNwcml0ZVxuICAgIFBoYXNlci5TcHJpdGUuY2FsbCh0aGlzLCBnYW1lLCB4LCB5LCBcInBsYXktc3ByaXRlc1wiLCBcIm1hZ2ljZGlsbC5wbmdcIik7XG5cbiAgICAvLyBDb25maWd1cmVcbiAgICB0aGlzLmFuY2hvci5zZXRUbygwLjUsIDAuNSk7XG4gICAgdGhpcy5zY2FsZS5zZXRUbygodGhpcy5nYW1lLndpZHRoIC8gMjApIC8gdGhpcy53aWR0aCk7XG5cbiAgICAvLyBQaHlzaWNzXG4gICAgdGhpcy5nYW1lLnBoeXNpY3MuYXJjYWRlLmVuYWJsZUJvZHkodGhpcyk7XG4gICAgdGhpcy5ib2R5LmFsbG93R3Jhdml0eSA9IGZhbHNlO1xuICAgIHRoaXMuYm9keS5pbW1vdmFibGUgPSB0cnVlO1xuICB9O1xuXG4gIC8vIEV4dGVuZCBmcm9tIFNwcml0ZVxuICBDb2luLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUGhhc2VyLlNwcml0ZS5wcm90b3R5cGUpO1xuICBDb2luLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IENvaW47XG5cbiAgLy8gQWRkIG1ldGhvZHNcbiAgXy5leHRlbmQoQ29pbi5wcm90b3R5cGUsIHtcbiAgICB1cGRhdGU6IGZ1bmN0aW9uKCkge1xuXG4gICAgfVxuICB9KTtcblxuICAvLyBFeHBvcnRcbiAgbW9kdWxlLmV4cG9ydHMgPSBDb2luO1xufSkoKTtcbiIsIi8qIGdsb2JhbCBfOmZhbHNlLCBQaGFzZXI6ZmFsc2UgKi9cblxuLyoqXG4gKiBQcmVmYWIgSGVyby9jaGFyYWN0ZXJcbiAqL1xuXG4oZnVuY3Rpb24oKSB7XG4gIFwidXNlIHN0cmljdFwiO1xuXG4gIC8vIENvbnN0cnVjdG9yXG4gIHZhciBIZXJvID0gZnVuY3Rpb24oZ2FtZSwgeCwgeSkge1xuICAgIC8vIENhbGwgZGVmYXVsdCBzcHJpdGVcbiAgICBQaGFzZXIuU3ByaXRlLmNhbGwodGhpcywgZ2FtZSwgeCwgeSwgXCJwbGF5LXNwcml0ZXNcIiwgXCJwaWNrbGUucG5nXCIpO1xuXG4gICAgLy8gQ29uZmlndXJlXG4gICAgdGhpcy5hbmNob3Iuc2V0VG8oMC41KTtcbiAgICB0aGlzLnNjYWxlLnNldFRvKCh0aGlzLmdhbWUud2lkdGggLyAyNSkgLyB0aGlzLndpZHRoKTtcbiAgICB0aGlzLmdhbWUucGh5c2ljcy5hcmNhZGUuZW5hYmxlQm9keSh0aGlzKTtcblxuICAgIC8vIFRyYWNrIHdoZXJlIHRoZSBoZXJvIHN0YXJ0ZWQgYW5kIGhvdyBtdWNoIHRoZSBkaXN0YW5jZVxuICAgIC8vIGhhcyBjaGFuZ2VkIGZyb20gdGhhdCBwb2ludFxuICAgIHRoaXMueU9yaWcgPSB0aGlzLnk7XG4gICAgdGhpcy55Q2hhbmdlID0gMDtcbiAgfTtcblxuICAvLyBFeHRlbmQgZnJvbSBTcHJpdGVcbiAgSGVyby5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFBoYXNlci5TcHJpdGUucHJvdG90eXBlKTtcbiAgSGVyby5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBIZXJvO1xuXG4gIC8vIEFkZCBtZXRob2RzXG4gIF8uZXh0ZW5kKEhlcm8ucHJvdG90eXBlLCB7XG4gICAgdXBkYXRlOiBmdW5jdGlvbigpIHtcbiAgICAgIC8vIFRyYWNrIHRoZSBtYXhpbXVtIGFtb3VudCB0aGF0IHRoZSBoZXJvIGhhcyB0cmF2ZWxsZWRcbiAgICAgIHRoaXMueUNoYW5nZSA9IE1hdGgubWF4KHRoaXMueUNoYW5nZSwgTWF0aC5hYnModGhpcy55IC0gdGhpcy55T3JpZykpO1xuXG4gICAgICAvLyBXcmFwIGFyb3VuZCBlZGdlcyBsZWZ0L3RpZ2h0IGVkZ2VzXG4gICAgICB0aGlzLmdhbWUud29ybGQud3JhcCh0aGlzLCB0aGlzLndpZHRoIC8gMiwgZmFsc2UsIHRydWUsIGZhbHNlKTtcbiAgICB9LFxuXG4gICAgLy8gUmVzZXQgcGxhY2VtZW50IGN1c3RvbVxuICAgIHJlc2V0UGxhY2VtZW50OiBmdW5jdGlvbih4LCB5KSB7XG4gICAgICB0aGlzLnJlc2V0KHgsIHkpO1xuICAgICAgdGhpcy55T3JpZyA9IHRoaXMueTtcbiAgICAgIHRoaXMueUNoYW5nZSA9IDA7XG4gICAgfVxuICB9KTtcblxuICAvLyBFeHBvcnRcbiAgbW9kdWxlLmV4cG9ydHMgPSBIZXJvO1xufSkoKTtcbiIsIi8qIGdsb2JhbCBfOmZhbHNlLCBQaGFzZXI6ZmFsc2UgKi9cblxuLyoqXG4gKiBQcmVmYWIgcGxhdGZvcm1cbiAqL1xuXG4oZnVuY3Rpb24oKSB7XG4gIFwidXNlIHN0cmljdFwiO1xuXG4gIC8vIENvbnN0cnVjdG9yXG4gIHZhciBQbGF0Zm9ybSA9IGZ1bmN0aW9uKGdhbWUsIHgsIHkpIHtcbiAgICAvLyBDYWxsIGRlZmF1bHQgc3ByaXRlXG4gICAgUGhhc2VyLlNwcml0ZS5jYWxsKHRoaXMsIGdhbWUsIHgsIHksIFwicGxheS1zcHJpdGVzXCIsIFwiZGlsbHliZWFuLnBuZ1wiKTtcblxuICAgIC8vIENvbmZpZ3VyZVxuICAgIHRoaXMuYW5jaG9yLnNldFRvKDAuNSwgMC41KTtcbiAgICB0aGlzLnNjYWxlLnNldFRvKCh0aGlzLmdhbWUud2lkdGggLyA1KSAvIHRoaXMud2lkdGgpO1xuICAgIHRoaXMuaG92ZXIgPSBmYWxzZTtcbiAgICB0aGlzLnNldEhvdmVyU3BlZWQoMTAwKTtcblxuICAgIC8vIFBoeXNpY3NcbiAgICB0aGlzLmdhbWUucGh5c2ljcy5hcmNhZGUuZW5hYmxlQm9keSh0aGlzKTtcbiAgICB0aGlzLmJvZHkuYWxsb3dHcmF2aXR5ID0gZmFsc2U7XG4gICAgdGhpcy5ib2R5LmltbW92YWJsZSA9IHRydWU7XG5cbiAgICAvLyBPbmx5IGFsbG93IGZvciBjb2xsaXNzaW9uIHVwXG4gICAgdGhpcy5ib2R5LmNoZWNrQ29sbGlzaW9uLmRvd24gPSBmYWxzZTtcbiAgICB0aGlzLmJvZHkuY2hlY2tDb2xsaXNpb24ubGVmdCA9IGZhbHNlO1xuICAgIHRoaXMuYm9keS5jaGVja0NvbGxpc2lvbi5yaWdodCA9IGZhbHNlO1xuXG4gICAgLy8gRGV0ZXJtaW5lIGFuY2hvciB4IGJvdW5kc1xuICAgIHRoaXMucGFkZGluZ1ggPSAxMDtcbiAgICB0aGlzLmdldEFuY2hvckJvdW5kc1goKTtcbiAgfTtcblxuICAvLyBFeHRlbmQgZnJvbSBTcHJpdGVcbiAgUGxhdGZvcm0ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQaGFzZXIuU3ByaXRlLnByb3RvdHlwZSk7XG4gIFBsYXRmb3JtLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFBsYXRmb3JtO1xuXG4gIC8vIEFkZCBtZXRob2RzXG4gIF8uZXh0ZW5kKFBsYXRmb3JtLnByb3RvdHlwZSwge1xuICAgIHVwZGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICBpZiAodGhpcy5ob3Zlcikge1xuICAgICAgICB0aGlzLmJvZHkudmVsb2NpdHkueCA9IHRoaXMuYm9keS52ZWxvY2l0eS54IHx8IHRoaXMuaG92ZXJTcGVlZDtcbiAgICAgICAgdGhpcy5ib2R5LnZlbG9jaXR5LnggPSAodGhpcy54IDw9IHRoaXMubWluWCkgPyB0aGlzLmhvdmVyU3BlZWQgOlxuICAgICAgICAgICh0aGlzLnggPj0gdGhpcy5tYXhYKSA/IC10aGlzLmhvdmVyU3BlZWQgOiB0aGlzLmJvZHkudmVsb2NpdHkueDtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLy8gU2V0IGhvdmVyIHNwZWVkLiAgQWRkIGEgYml0IG9mIHZhcmlhbmNlXG4gICAgc2V0SG92ZXJTcGVlZDogZnVuY3Rpb24oc3BlZWQpIHtcbiAgICAgIHRoaXMuaG92ZXJTcGVlZCA9IHNwZWVkICsgdGhpcy5nYW1lLnJuZC5pbnRlZ2VySW5SYW5nZSgtNTAsIDUwKTtcbiAgICB9LFxuXG4gICAgLy8gR2V0IGFuY2hvciBib3VuZHNcbiAgICBnZXRBbmNob3JCb3VuZHNYOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMubWluWCA9IHRoaXMucGFkZGluZ1ggKyAodGhpcy53aWR0aCAvIDIpO1xuICAgICAgdGhpcy5tYXhYID0gdGhpcy5nYW1lLndpZHRoIC0gKHRoaXMucGFkZGluZ1ggKyAodGhpcy53aWR0aCAvIDIpKTtcbiAgICAgIHJldHVybiBbdGhpcy5taW5YLCB0aGlzLm1heFhdO1xuICAgIH0sXG5cbiAgICAvLyBSZXNldCB0aGluZ3NcbiAgICByZXNldFNldHRpbmdzOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMucmVzZXQoMCwgMCk7XG4gICAgICB0aGlzLmJvZHkudmVsb2NpdHkueCA9IDA7XG4gICAgICB0aGlzLmhvdmVyID0gZmFsc2U7XG4gICAgICB0aGlzLmdldEFuY2hvckJvdW5kc1goKTtcbiAgICB9XG4gIH0pO1xuXG4gIC8vIEV4cG9ydFxuICBtb2R1bGUuZXhwb3J0cyA9IFBsYXRmb3JtO1xufSkoKTtcbiIsIi8qIGdsb2JhbCBfOmZhbHNlLCBQaGFzZXI6ZmFsc2UgKi9cblxuLyoqXG4gKiBHYW1lb3ZlciBzdGF0ZVxuICovXG5cbihmdW5jdGlvbigpIHtcbiAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgLy8gQ29uc3RydWN0b3JcbiAgdmFyIEdhbWVvdmVyID0gZnVuY3Rpb24oKSB7XG4gICAgUGhhc2VyLlN0YXRlLmNhbGwodGhpcyk7XG5cbiAgICAvLyBDb25maWd1cmVcbiAgICB0aGlzLnBhZGRpbmcgPSAxMDtcbiAgfTtcblxuICAvLyBFeHRlbmQgZnJvbSBTdGF0ZVxuICBHYW1lb3Zlci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFBoYXNlci5TdGF0ZS5wcm90b3R5cGUpO1xuICBHYW1lb3Zlci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBHYW1lb3ZlcjtcblxuICAvLyBBZGQgbWV0aG9kc1xuICBfLmV4dGVuZChHYW1lb3Zlci5wcm90b3R5cGUsIFBoYXNlci5TdGF0ZS5wcm90b3R5cGUsIHtcbiAgICAvLyBQcmVsb2FkXG4gICAgcHJlbG9hZDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLmdhbWUubG9hZC5pbWFnZShcImdhbWVvdmVyXCIsIFwiYXNzZXRzL2dhbWVvdmVyLnBuZ1wiKTtcbiAgICAgIHRoaXMuZ2FtZS5sb2FkLmltYWdlKFwicGxheVwiLCBcImFzc2V0cy90aXRsZS1wbGF5LnBuZ1wiKTtcbiAgICAgIHRoaXMuZ2FtZS5sb2FkLmltYWdlKFwieW91ci1zY29yZVwiLCBcImFzc2V0cy95b3VyLXNjb3JlLnBuZ1wiKTtcbiAgICB9LFxuXG4gICAgLy8gQ3JlYXRlXG4gICAgY3JlYXRlOiBmdW5jdGlvbigpIHtcbiAgICAgIC8vIFNldCBiYWNrZ3JvdW5kXG4gICAgICB0aGlzLmdhbWUuc3RhZ2UuYmFja2dyb3VuZENvbG9yID0gXCIjOGNjNjNmXCI7XG5cbiAgICAgIC8vIFBsYWNlIHRpdGxlXG4gICAgICB0aGlzLnRpdGxlSW1hZ2UgPSB0aGlzLmdhbWUuYWRkLnNwcml0ZSh0aGlzLmdhbWUud2lkdGggLyAyLCB0aGlzLnBhZGRpbmcgKiAzLCBcImdhbWVvdmVyXCIpO1xuICAgICAgdGhpcy50aXRsZUltYWdlLmFuY2hvci5zZXRUbygwLjUsIDApO1xuICAgICAgdGhpcy50aXRsZUltYWdlLnNjYWxlLnNldFRvKCh0aGlzLmdhbWUud2lkdGggLSAodGhpcy5wYWRkaW5nICogOCkpIC8gdGhpcy50aXRsZUltYWdlLndpZHRoKTtcbiAgICAgIHRoaXMuZ2FtZS5hZGQuZXhpc3RpbmcodGhpcy50aXRsZUltYWdlKTtcblxuICAgICAgLy8gSGlnaHNjb3JlIGxpc3QuICBDYW4ndCBzZWVtIHRvIGZpbmQgYSB3YXkgdG8gcGFzcyB0aGUgc2NvcmVcbiAgICAgIC8vIHZpYSBhIHN0YXRlIGNoYW5nZS5cbiAgICAgIHRoaXMuc2NvcmUgPSB0aGlzLmdhbWUucGlja2xlLnNjb3JlO1xuXG4gICAgICAvLyBTaG93IHNjb3JlXG4gICAgICB0aGlzLnNob3dTY29yZSgpO1xuXG4gICAgICAvLyBTaG93IGlucHV0IGlmIG5ldyBoaWdoc2NvcmUsIG90aGVyd2lzZSBzaG93IGxpc3RcbiAgICAgIGlmICh0aGlzLmdhbWUucGlja2xlLmlzSGlnaHNjb3JlKHRoaXMuc2NvcmUpKSB7XG4gICAgICAgIHRoaXMuaGlnaHNjb3JlSW5wdXQoKTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICB0aGlzLmhpZ2hzY29yZUxpc3QoKTtcbiAgICAgIH1cblxuICAgICAgLy8gUGxhY2UgcmUtcGxheVxuICAgICAgdGhpcy5yZXBsYXlJbWFnZSA9IHRoaXMuZ2FtZS5hZGQuc3ByaXRlKHRoaXMuZ2FtZS53aWR0aCAtIHRoaXMucGFkZGluZyAqIDIsIHRoaXMuZ2FtZS5oZWlnaHQgLSB0aGlzLnBhZGRpbmcgKiAyLCBcInBsYXlcIik7XG4gICAgICB0aGlzLnJlcGxheUltYWdlLmFuY2hvci5zZXRUbygxLCAxKTtcbiAgICAgIHRoaXMucmVwbGF5SW1hZ2Uuc2NhbGUuc2V0VG8oKHRoaXMuZ2FtZS53aWR0aCAqIDAuMjUpIC8gdGhpcy5yZXBsYXlJbWFnZS53aWR0aCk7XG4gICAgICB0aGlzLmdhbWUuYWRkLmV4aXN0aW5nKHRoaXMucmVwbGF5SW1hZ2UpO1xuXG4gICAgICAvLyBBZGQgaG92ZXIgZm9yIG1vdXNlXG4gICAgICB0aGlzLnJlcGxheUltYWdlLmlucHV0RW5hYmxlZCA9IHRydWU7XG4gICAgICB0aGlzLnJlcGxheUltYWdlLmV2ZW50cy5vbklucHV0T3Zlci5hZGQoZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMucmVwbGF5SW1hZ2Uub3JpZ2luYWxUaW50ID0gdGhpcy5yZXBsYXlJbWFnZS50aW50O1xuICAgICAgICB0aGlzLnJlcGxheUltYWdlLnRpbnQgPSAwLjUgKiAweEZGRkZGRjtcbiAgICAgIH0sIHRoaXMpO1xuXG4gICAgICB0aGlzLnJlcGxheUltYWdlLmV2ZW50cy5vbklucHV0T3V0LmFkZChmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5yZXBsYXlJbWFnZS50aW50ID0gdGhpcy5yZXBsYXlJbWFnZS5vcmlnaW5hbFRpbnQ7XG4gICAgICB9LCB0aGlzKTtcblxuICAgICAgLy8gQWRkIGludGVyYWN0aW9ucyBmb3Igc3RhcnRpbmdcbiAgICAgIHRoaXMucmVwbGF5SW1hZ2UuZXZlbnRzLm9uSW5wdXREb3duLmFkZCh0aGlzLnJlcGxheSwgdGhpcyk7XG5cbiAgICAgIC8vIElucHV0XG4gICAgICB0aGlzLmxlZnRCdXR0b24gPSB0aGlzLmdhbWUuaW5wdXQua2V5Ym9hcmQuYWRkS2V5KFBoYXNlci5LZXlib2FyZC5MRUZUKTtcbiAgICAgIHRoaXMucmlnaHRCdXR0b24gPSB0aGlzLmdhbWUuaW5wdXQua2V5Ym9hcmQuYWRkS2V5KFBoYXNlci5LZXlib2FyZC5SSUdIVCk7XG4gICAgICB0aGlzLnVwQnV0dG9uID0gdGhpcy5nYW1lLmlucHV0LmtleWJvYXJkLmFkZEtleShQaGFzZXIuS2V5Ym9hcmQuVVApO1xuICAgICAgdGhpcy5kb3duQnV0dG9uID0gdGhpcy5nYW1lLmlucHV0LmtleWJvYXJkLmFkZEtleShQaGFzZXIuS2V5Ym9hcmQuRE9XTik7XG4gICAgICB0aGlzLmFjdGlvbkJ1dHRvbiA9IHRoaXMuZ2FtZS5pbnB1dC5rZXlib2FyZC5hZGRLZXkoUGhhc2VyLktleWJvYXJkLlNQQUNFQkFSKTtcblxuICAgICAgdGhpcy5sZWZ0QnV0dG9uLm9uRG93bi5hZGQoZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICh0aGlzLmhJbnB1dCkge1xuICAgICAgICAgIHRoaXMubW92ZUN1cnNvcigtMSk7XG4gICAgICAgIH1cbiAgICAgIH0sIHRoaXMpO1xuXG4gICAgICB0aGlzLnJpZ2h0QnV0dG9uLm9uRG93bi5hZGQoZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICh0aGlzLmhJbnB1dCkge1xuICAgICAgICAgIHRoaXMubW92ZUN1cnNvcigxKTtcbiAgICAgICAgfVxuICAgICAgfSwgdGhpcyk7XG5cbiAgICAgIHRoaXMudXBCdXR0b24ub25Eb3duLmFkZChmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHRoaXMuaElucHV0KSB7XG4gICAgICAgICAgdGhpcy5tb3ZlTGV0dGVyKDEpO1xuICAgICAgICB9XG4gICAgICB9LCB0aGlzKTtcblxuICAgICAgdGhpcy5kb3duQnV0dG9uLm9uRG93bi5hZGQoZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICh0aGlzLmhJbnB1dCkge1xuICAgICAgICAgIHRoaXMubW92ZUxldHRlcigtMSk7XG4gICAgICAgIH1cbiAgICAgIH0sIHRoaXMpO1xuXG4gICAgICB0aGlzLmFjdGlvbkJ1dHRvbi5vbkRvd24uYWRkKGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgc2F2ZWQ7XG5cbiAgICAgICAgaWYgKHRoaXMuaElucHV0KSB7XG4gICAgICAgICAgc2F2ZWQgPSB0aGlzLnNhdmVIaWdoc2NvcmUoKTtcbiAgICAgICAgICBpZiAoc2F2ZWQpIHtcbiAgICAgICAgICAgIHRoaXMuaGlnaHNjb3JlTGlzdCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICB0aGlzLnJlcGxheSgpO1xuICAgICAgICB9XG4gICAgICB9LCB0aGlzKTtcbiAgICB9LFxuXG4gICAgLy8gVXBkYXRlXG4gICAgdXBkYXRlOiBmdW5jdGlvbigpIHtcbiAgICB9LFxuXG4gICAgLy8gU2h1dGRvd24sIGNsZWFuIHVwIG9uIHN0YXRlIGNoYW5nZVxuICAgIHNodXRkb3duOiBmdW5jdGlvbigpIHtcbiAgICAgIFtcInRpdGxlVGV4dFwiLCBcInJlcGxheVRleHRcIl0uZm9yRWFjaChfLmJpbmQoZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICBpZiAodGhpc1tpdGVtXSAmJiB0aGlzW2l0ZW1dLmRlc3Ryb3kpIHtcbiAgICAgICAgICB0aGlzW2l0ZW1dLmRlc3Ryb3koKTtcbiAgICAgICAgICB0aGlzW2l0ZW1dID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgfSwgdGhpcykpO1xuICAgIH0sXG5cbiAgICAvLyBIYW5kbGUgcmVwbGF5XG4gICAgcmVwbGF5OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuZ2FtZS5zdGF0ZS5zdGFydChcIm1lbnVcIik7XG4gICAgfSxcblxuICAgIC8vIFNob3cgaGlnaHNjb3JlXG4gICAgc2hvd1Njb3JlOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2NvcmVHcm91cCA9IHRoaXMuZ2FtZS5hZGQuZ3JvdXAoKTtcblxuICAgICAgLy8gUGxhY2UgbGFiZWxcbiAgICAgIHRoaXMueW91clNjb3JlSW1hZ2UgPSB0aGlzLmdhbWUuYWRkLnNwcml0ZShcbiAgICAgICAgdGhpcy5nYW1lLndpZHRoIC8gMiArICh0aGlzLnBhZGRpbmcgKiAzKSxcbiAgICAgICAgdGhpcy50aXRsZUltYWdlLmhlaWdodCArICh0aGlzLnBhZGRpbmcgKiA3LjUpLCBcInlvdXItc2NvcmVcIik7XG4gICAgICB0aGlzLnlvdXJTY29yZUltYWdlLmFuY2hvci5zZXRUbygxLCAwKTtcbiAgICAgIHRoaXMueW91clNjb3JlSW1hZ2Uuc2NhbGUuc2V0VG8oKCh0aGlzLmdhbWUud2lkdGggLyAyKSAtICh0aGlzLnBhZGRpbmcgKiA2KSkgLyB0aGlzLnlvdXJTY29yZUltYWdlLndpZHRoKTtcblxuICAgICAgLy8gU2NvcmVcbiAgICAgIHRoaXMuc2NvcmVUZXh0ID0gbmV3IFBoYXNlci5UZXh0KFxuICAgICAgICB0aGlzLmdhbWUsXG4gICAgICAgIHRoaXMuZ2FtZS53aWR0aCAvIDIgKyAodGhpcy5wYWRkaW5nICogNSksXG4gICAgICAgIHRoaXMudGl0bGVJbWFnZS5oZWlnaHQgKyAodGhpcy5wYWRkaW5nICogNiksXG4gICAgICAgIHRoaXMuc2NvcmUudG9Mb2NhbGVTdHJpbmcoKSwge1xuICAgICAgICAgIGZvbnQ6IFwiYm9sZCBcIiArICh0aGlzLmdhbWUud29ybGQuaGVpZ2h0IC8gMTUpICsgXCJweCBEb3Npc1wiLFxuICAgICAgICAgIGZpbGw6IFwiIzM5YjU0YVwiLFxuICAgICAgICAgIGFsaWduOiBcImxlZnRcIixcbiAgICAgICAgfSk7XG4gICAgICB0aGlzLnNjb3JlVGV4dC5hbmNob3Iuc2V0VG8oMCwgMCk7XG5cbiAgICAgIC8vIEZvbnQgbG9hZGluZyB0aGluZ1xuICAgICAgXy5kZWxheShfLmJpbmQoZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuc2NvcmVHcm91cC5hZGQodGhpcy55b3VyU2NvcmVJbWFnZSk7XG4gICAgICAgIHRoaXMuc2NvcmVHcm91cC5hZGQodGhpcy5zY29yZVRleHQpO1xuICAgICAgfSwgdGhpcyksIDEwMDApO1xuICAgIH0sXG5cbiAgICAvLyBNYWtlIGhpZ2hlc3Qgc2NvcmUgaW5wdXRcbiAgICBoaWdoc2NvcmVJbnB1dDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLmhJbnB1dCA9IHRydWU7XG4gICAgICB0aGlzLmhJbnB1dEluZGV4ID0gMDtcbiAgICAgIHRoaXMuaElucHV0cyA9IHRoaXMuZ2FtZS5hZGQuZ3JvdXAoKTtcbiAgICAgIHZhciB5ID0gdGhpcy5nYW1lLndvcmxkLmhlaWdodCAqIDAuNztcblxuICAgICAgLy8gRmlyc3QgaW5wdXRcbiAgICAgIHZhciBvbmUgPSBuZXcgUGhhc2VyLlRleHQoXG4gICAgICAgIHRoaXMuZ2FtZSxcbiAgICAgICAgdGhpcy5nYW1lLndvcmxkLndpZHRoICogMC4zMzMzMyxcbiAgICAgICAgeSxcbiAgICAgICAgXCJBXCIsIHtcbiAgICAgICAgICBmb250OiBcImJvbGQgXCIgKyAodGhpcy5nYW1lLndvcmxkLmhlaWdodCAvIDE1KSArIFwicHggRG9zaXNcIixcbiAgICAgICAgICBmaWxsOiBcIiNGRkZGRkZcIixcbiAgICAgICAgICBhbGlnbjogXCJjZW50ZXJcIixcbiAgICAgICAgfSk7XG4gICAgICBvbmUuYW5jaG9yLnNldCgwLjUpO1xuICAgICAgdGhpcy5oSW5wdXRzLmFkZChvbmUpO1xuXG4gICAgICAvLyBTZWNvbmQgaW5wdXRcbiAgICAgIHZhciBzZWNvbmQgPSBuZXcgUGhhc2VyLlRleHQoXG4gICAgICAgIHRoaXMuZ2FtZSxcbiAgICAgICAgdGhpcy5nYW1lLndvcmxkLndpZHRoICogMC41LFxuICAgICAgICB5LFxuICAgICAgICBcIkFcIiwge1xuICAgICAgICAgIGZvbnQ6IFwiYm9sZCBcIiArICh0aGlzLmdhbWUud29ybGQuaGVpZ2h0IC8gMTUpICsgXCJweCBEb3Npc1wiLFxuICAgICAgICAgIGZpbGw6IFwiI0ZGRkZGRlwiLFxuICAgICAgICAgIGFsaWduOiBcImNlbnRlclwiLFxuICAgICAgICB9KTtcbiAgICAgIHNlY29uZC5hbmNob3Iuc2V0KDAuNSk7XG4gICAgICB0aGlzLmhJbnB1dHMuYWRkKHNlY29uZCk7XG5cbiAgICAgIC8vIFNlY29uZCBpbnB1dFxuICAgICAgdmFyIHRoaXJkID0gbmV3IFBoYXNlci5UZXh0KFxuICAgICAgICB0aGlzLmdhbWUsXG4gICAgICAgIHRoaXMuZ2FtZS53b3JsZC53aWR0aCAqIDAuNjY2NjYsXG4gICAgICAgIHksXG4gICAgICAgIFwiQVwiLCB7XG4gICAgICAgICAgZm9udDogXCJib2xkIFwiICsgKHRoaXMuZ2FtZS53b3JsZC5oZWlnaHQgLyAxNSkgKyBcInB4IERvc2lzXCIsXG4gICAgICAgICAgZmlsbDogXCIjRkZGRkZGXCIsXG4gICAgICAgICAgYWxpZ246IFwiY2VudGVyXCIsXG4gICAgICAgIH0pO1xuICAgICAgdGhpcmQuYW5jaG9yLnNldCgwLjUpO1xuICAgICAgdGhpcy5oSW5wdXRzLmFkZCh0aGlyZCk7XG5cbiAgICAgIC8vIEN1cnNvclxuICAgICAgdGhpcy5oQ3Vyc29yID0gdGhpcy5nYW1lLmFkZC50ZXh0KFxuICAgICAgICBvbmUueCxcbiAgICAgICAgb25lLnkgLSAodGhpcy5nYW1lLndvcmxkLmhlaWdodCAvIDIwKSxcbiAgICAgICAgXCJfXCIsIHtcbiAgICAgICAgICBmb250OiBcImJvbGQgXCIgKyAodGhpcy5nYW1lLndvcmxkLmhlaWdodCAvIDUpICsgXCJweCBBcmlhbFwiLFxuICAgICAgICAgIGZpbGw6IFwiI0ZGRkZGRlwiLFxuICAgICAgICAgIGFsaWduOiBcImNlbnRlclwiLFxuICAgICAgICB9KTtcbiAgICAgIHRoaXMuaEN1cnNvci5hbmNob3Iuc2V0KDAuNSk7XG5cbiAgICAgIC8vIEhhbmRsZSBpbml0YWwgY3Vyc29yXG4gICAgICB0aGlzLm1vdmVDdXJzb3IoMCk7XG4gICAgfSxcblxuICAgIC8vIE1vdmUgY3Vyc29yXG4gICAgbW92ZUN1cnNvcjogZnVuY3Rpb24oYW1vdW50KSB7XG4gICAgICB2YXIgbmV3SW5kZXggPSB0aGlzLmhJbnB1dEluZGV4ICsgYW1vdW50O1xuICAgICAgdGhpcy5oSW5wdXRJbmRleCA9IChuZXdJbmRleCA8IDApID8gdGhpcy5oSW5wdXRzLmxlbmd0aCAtIDEgOlxuICAgICAgICAobmV3SW5kZXggPj0gdGhpcy5oSW5wdXRzLmxlbmd0aCkgPyAwIDogbmV3SW5kZXg7XG4gICAgICB2YXIgaSA9IHRoaXMuaElucHV0cy5nZXRDaGlsZEF0KHRoaXMuaElucHV0SW5kZXgpO1xuXG4gICAgICAvLyBNb3ZlIGN1cnNvclxuICAgICAgdGhpcy5oQ3Vyc29yLnggPSBpLng7XG4gICAgICB0aGlzLmhJbnB1dHMuZm9yRWFjaChmdW5jdGlvbihpbnB1dCkge1xuICAgICAgICBpbnB1dC5maWxsID0gXCIjRkZGRkZGXCI7XG4gICAgICB9KTtcblxuICAgICAgaS5maWxsID0gXCIjRkZEREJCXCI7XG5cbiAgICAgIC8vIFRPRE86IEhpZ2hsaWdodCBpbnB1dC5cbiAgICB9LFxuXG4gICAgLy8gTW92ZSBsZXR0ZXJcbiAgICBtb3ZlTGV0dGVyOiBmdW5jdGlvbihhbW91bnQpIHtcbiAgICAgIHZhciBpID0gdGhpcy5oSW5wdXRzLmdldENoaWxkQXQodGhpcy5oSW5wdXRJbmRleCk7XG4gICAgICB2YXIgdCA9IGkudGV4dDtcbiAgICAgIHZhciBuID0gKHQgPT09IFwiQVwiICYmIGFtb3VudCA9PT0gLTEpID8gXCJaXCIgOlxuICAgICAgICAodCA9PT0gXCJaXCIgJiYgYW1vdW50ID09PSAxKSA/IFwiQVwiIDpcbiAgICAgICAgU3RyaW5nLmZyb21DaGFyQ29kZSh0LmNoYXJDb2RlQXQoMCkgKyBhbW91bnQpO1xuXG4gICAgICBpLnRleHQgPSBuO1xuICAgIH0sXG5cbiAgICAvLyBTYXZlIGhpZ2hzY29yZVxuICAgIHNhdmVIaWdoc2NvcmU6IGZ1bmN0aW9uKCkge1xuICAgICAgLy8gR2V0IG5hbWVcbiAgICAgIHZhciBuYW1lID0gXCJcIjtcbiAgICAgIHRoaXMuaElucHV0cy5mb3JFYWNoKGZ1bmN0aW9uKGlucHV0KSB7XG4gICAgICAgIG5hbWUgPSBuYW1lICsgaW5wdXQudGV4dDtcbiAgICAgIH0pO1xuXG4gICAgICAvLyBEb24ndCBhbGxvdyBBQUFcbiAgICAgIGlmIChuYW1lID09PSBcIkFBQVwiKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgLy8gU2F2ZSBoaWdoc2NvcmVcbiAgICAgIHRoaXMuZ2FtZS5waWNrbGUuc2V0SGlnaHNjb3JlKHRoaXMuc2NvcmUsIG5hbWUpO1xuXG4gICAgICAvLyBSZW1vdmUgaW5wdXRcbiAgICAgIHRoaXMuaElucHV0ID0gZmFsc2U7XG4gICAgICB0aGlzLmhJbnB1dHMuZGVzdHJveSgpO1xuICAgICAgdGhpcy5oQ3Vyc29yLmRlc3Ryb3koKTtcblxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSxcblxuICAgIC8vIEhpZ2hzY29yZSBsaXN0XG4gICAgaGlnaHNjb3JlTGlzdDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLmhpZ2hzY29yZUxpbWl0ID0gMztcbiAgICAgIHRoaXMuaGlnaHNjb3JlTGlzdEdyb3VwID0gdGhpcy5nYW1lLmFkZC5ncm91cCgpO1xuICAgICAgdGhpcy5nYW1lLnBpY2tsZS5zb3J0SGlnaHNjb3JlcygpO1xuICAgICAgdmFyIGZvbnRTaXplID0gdGhpcy5nYW1lLndvcmxkLmhlaWdodCAvIDE3LjU7XG5cbiAgICAgIGlmICh0aGlzLmdhbWUucGlja2xlLmhpZ2hzY29yZXMubGVuZ3RoID4gMCkge1xuICAgICAgICBfLmVhY2godGhpcy5nYW1lLnBpY2tsZS5oaWdoc2NvcmVzLnJldmVyc2UoKS5zbGljZSgwLCAzKSwgXy5iaW5kKGZ1bmN0aW9uKGgsIGkpIHtcbiAgICAgICAgICAvLyBOYW1lXG4gICAgICAgICAgdmFyIG5hbWUgPSBuZXcgUGhhc2VyLlRleHQoXG4gICAgICAgICAgICB0aGlzLmdhbWUsXG4gICAgICAgICAgICB0aGlzLmdhbWUud2lkdGggLyAyICsgKHRoaXMucGFkZGluZyAqIDMpLFxuICAgICAgICAgICAgKHRoaXMuZ2FtZS5oZWlnaHQgKiAwLjYpICsgKChmb250U2l6ZSArIHRoaXMucGFkZGluZykgKiBpKSxcbiAgICAgICAgICAgIGgubmFtZSwge1xuICAgICAgICAgICAgICBmb250OiBcImJvbGQgXCIgKyAodGhpcy5nYW1lLndvcmxkLmhlaWdodCAvIDE1KSArIFwicHggRG9zaXNcIixcbiAgICAgICAgICAgICAgZmlsbDogXCIjYjhmNGJjXCIsXG4gICAgICAgICAgICAgIGFsaWduOiBcInJpZ2h0XCIsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICBuYW1lLmFuY2hvci5zZXRUbygxLCAwKTtcblxuICAgICAgICAgIC8vIFNjb3JlXG4gICAgICAgICAgdmFyIHNjb3JlID0gbmV3IFBoYXNlci5UZXh0KFxuICAgICAgICAgICAgdGhpcy5nYW1lLFxuICAgICAgICAgICAgdGhpcy5nYW1lLndpZHRoIC8gMiArICh0aGlzLnBhZGRpbmcgKiA1KSxcbiAgICAgICAgICAgICh0aGlzLmdhbWUuaGVpZ2h0ICogMC42KSArICgoZm9udFNpemUgKyB0aGlzLnBhZGRpbmcpICogaSksXG4gICAgICAgICAgICBoLnNjb3JlLnRvTG9jYWxlU3RyaW5nKCksIHtcbiAgICAgICAgICAgICAgZm9udDogXCJib2xkIFwiICsgKHRoaXMuZ2FtZS53b3JsZC5oZWlnaHQgLyAxNSkgKyBcInB4IERvc2lzXCIsXG4gICAgICAgICAgICAgIGZpbGw6IFwiIzM5YjU0YVwiLFxuICAgICAgICAgICAgICBhbGlnbjogXCJsZWZ0XCIsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICBzY29yZS5hbmNob3Iuc2V0VG8oMCwgMCk7XG5cbiAgICAgICAgICAvLyBGb250IGxvYWRpbmcgdGhpbmdcbiAgICAgICAgICBfLmRlbGF5KF8uYmluZChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuaGlnaHNjb3JlTGlzdEdyb3VwLmFkZChuYW1lKTtcbiAgICAgICAgICAgIHRoaXMuaGlnaHNjb3JlTGlzdEdyb3VwLmFkZChzY29yZSk7XG4gICAgICAgICAgfSwgdGhpcyksIDEwMDApO1xuICAgICAgICB9LCB0aGlzKSk7XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICAvLyBFeHBvcnRcbiAgbW9kdWxlLmV4cG9ydHMgPSBHYW1lb3Zlcjtcbn0pKCk7XG4iLCIvKiBnbG9iYWwgXzpmYWxzZSwgUGhhc2VyOmZhbHNlICovXG5cbi8qKlxuICogTWVudSBzdGF0ZVxuICovXG5cbihmdW5jdGlvbigpIHtcbiAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgLy8gQ29uc3RydWN0b3JcbiAgdmFyIE1lbnUgPSBmdW5jdGlvbigpIHtcbiAgICBQaGFzZXIuU3RhdGUuY2FsbCh0aGlzKTtcblxuICAgIC8vIENvbmZpZ1xuICAgIHRoaXMucGFkZGluZyA9IDIwO1xuICB9O1xuXG4gIC8vIEV4dGVuZCBmcm9tIFN0YXRlXG4gIE1lbnUucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQaGFzZXIuU3RhdGUucHJvdG90eXBlKTtcbiAgTWVudS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBNZW51O1xuXG4gIC8vIEFkZCBtZXRob2RzXG4gIF8uZXh0ZW5kKE1lbnUucHJvdG90eXBlLCBQaGFzZXIuU3RhdGUucHJvdG90eXBlLCB7XG4gICAgLy8gUHJlbG9hZFxuICAgIHByZWxvYWQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5nYW1lLmxvYWQuaW1hZ2UoXCJ0aXRsZVwiLCBcImFzc2V0cy90aXRsZS5wbmdcIik7XG4gICAgICB0aGlzLmdhbWUubG9hZC5pbWFnZShcInBsYXlcIiwgXCJhc3NldHMvdGl0bGUtcGxheS5wbmdcIik7XG4gICAgfSxcblxuICAgIC8vIENyZWF0ZVxuICAgIGNyZWF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAvLyBTZXQgYmFja2dyb3VuZFxuICAgICAgdGhpcy5nYW1lLnN0YWdlLmJhY2tncm91bmRDb2xvciA9IFwiI2I4ZjRiY1wiO1xuXG4gICAgICAvLyBQbGFjZSB0aXRsZVxuICAgICAgdGhpcy50aXRsZUltYWdlID0gdGhpcy5nYW1lLmFkZC5zcHJpdGUodGhpcy5nYW1lLndpZHRoIC8gMiwgdGhpcy5wYWRkaW5nICogMywgXCJ0aXRsZVwiKTtcbiAgICAgIHRoaXMudGl0bGVJbWFnZS5hbmNob3Iuc2V0VG8oMC41LCAwKTtcbiAgICAgIHRoaXMudGl0bGVJbWFnZS5zY2FsZS5zZXRUbygodGhpcy5nYW1lLndpZHRoIC0gKHRoaXMucGFkZGluZyAqIDIpKSAvIHRoaXMudGl0bGVJbWFnZS53aWR0aCk7XG4gICAgICB0aGlzLmdhbWUuYWRkLmV4aXN0aW5nKHRoaXMudGl0bGVJbWFnZSk7XG5cbiAgICAgIC8vIFBsYWNlIHBsYXlcbiAgICAgIHRoaXMucGxheUltYWdlID0gdGhpcy5nYW1lLmFkZC5zcHJpdGUodGhpcy5nYW1lLndpZHRoIC8gMiwgdGhpcy5nYW1lLmhlaWdodCAtIHRoaXMucGFkZGluZyAqIDMsIFwicGxheVwiKTtcbiAgICAgIHRoaXMucGxheUltYWdlLmFuY2hvci5zZXRUbygwLjQsIDEpO1xuICAgICAgdGhpcy5wbGF5SW1hZ2Uuc2NhbGUuc2V0VG8oKHRoaXMuZ2FtZS53aWR0aCAqIDAuNzUpIC8gdGhpcy50aXRsZUltYWdlLndpZHRoKTtcbiAgICAgIHRoaXMuZ2FtZS5hZGQuZXhpc3RpbmcodGhpcy5wbGF5SW1hZ2UpO1xuXG4gICAgICAvLyBBZGQgaG92ZXIgZm9yIG1vdXNlXG4gICAgICB0aGlzLnBsYXlJbWFnZS5pbnB1dEVuYWJsZWQgPSB0cnVlO1xuICAgICAgdGhpcy5wbGF5SW1hZ2UuZXZlbnRzLm9uSW5wdXRPdmVyLmFkZChmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5wbGF5SW1hZ2Uub3JpZ2luYWxUaW50ID0gdGhpcy5wbGF5SW1hZ2UudGludDtcbiAgICAgICAgdGhpcy5wbGF5SW1hZ2UudGludCA9IDAuNSAqIDB4RkZGRkZGO1xuICAgICAgfSwgdGhpcyk7XG5cbiAgICAgIHRoaXMucGxheUltYWdlLmV2ZW50cy5vbklucHV0T3V0LmFkZChmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5wbGF5SW1hZ2UudGludCA9IHRoaXMucGxheUltYWdlLm9yaWdpbmFsVGludDtcbiAgICAgIH0sIHRoaXMpO1xuXG4gICAgICAvLyBBZGQgbW91c2UgaW50ZXJhY3Rpb25cbiAgICAgIHRoaXMucGxheUltYWdlLmV2ZW50cy5vbklucHV0RG93bi5hZGQodGhpcy5nbywgdGhpcyk7XG5cbiAgICAgIC8vIEFkZCBrZXlib2FyZCBpbnRlcmFjdGlvblxuICAgICAgdGhpcy5hY3Rpb25CdXR0b24gPSB0aGlzLmdhbWUuaW5wdXQua2V5Ym9hcmQuYWRkS2V5KFBoYXNlci5LZXlib2FyZC5TUEFDRUJBUik7XG4gICAgICB0aGlzLmFjdGlvbkJ1dHRvbi5vbkRvd24uYWRkKGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLmdvKCk7XG4gICAgICB9LCB0aGlzKTtcbiAgICB9LFxuXG4gICAgLy8gU3RhcnQgcGxheWluZ1xuICAgIGdvOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuZ2FtZS5zdGF0ZS5zdGFydChcInBsYXlcIik7XG4gICAgfSxcblxuICAgIC8vIFVwZGF0ZVxuICAgIHVwZGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgfVxuICB9KTtcblxuICAvLyBFeHBvcnRcbiAgbW9kdWxlLmV4cG9ydHMgPSBNZW51O1xufSkoKTtcbiIsIi8qIGdsb2JhbCBfOmZhbHNlLCBQaGFzZXI6ZmFsc2UgKi9cblxuLyoqXG4gKiBQbGF5IHN0YXRlXG4gKi9cblxuKGZ1bmN0aW9uKCkge1xuICBcInVzZSBzdHJpY3RcIjtcblxuICAvLyBEZXBlbmRlbmNpZXNcbiAgdmFyIHByZWZhYnMgPSB7XG4gICAgQm9vc3Q6IHJlcXVpcmUoXCIuL3ByZWZhYi1ib29zdC5qc1wiKSxcbiAgICBCb3R1bGlzbTogcmVxdWlyZShcIi4vcHJlZmFiLWJvdHVsaXNtLmpzXCIpLFxuICAgIENvaW46IHJlcXVpcmUoXCIuL3ByZWZhYi1jb2luLmpzXCIpLFxuICAgIEhlcm86IHJlcXVpcmUoXCIuL3ByZWZhYi1oZXJvLmpzXCIpLFxuICAgIFBsYXRmb3JtOiByZXF1aXJlKFwiLi9wcmVmYWItcGxhdGZvcm0uanNcIilcbiAgfTtcblxuICAvLyBDb25zdHJ1Y3RvclxuICB2YXIgUGxheSA9IGZ1bmN0aW9uKCkge1xuICAgIFBoYXNlci5TdGF0ZS5jYWxsKHRoaXMpO1xuICB9O1xuXG4gIC8vIEV4dGVuZCBmcm9tIFN0YXRlXG4gIFBsYXkucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQaGFzZXIuU3RhdGUucHJvdG90eXBlKTtcbiAgUGxheS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBQbGF5O1xuXG4gIC8vIEFkZCBtZXRob2RzXG4gIF8uZXh0ZW5kKFBsYXkucHJvdG90eXBlLCBQaGFzZXIuU3RhdGUucHJvdG90eXBlLCB7XG4gICAgLy8gUHJlbG9hZFxuICAgIHByZWxvYWQ6IGZ1bmN0aW9uKCkge1xuICAgICAgLy8gTG9hZCB1cCBnYW1lIGltYWdlc1xuICAgICAgdGhpcy5nYW1lLmxvYWQuYXRsYXMoXCJwbGF5LXNwcml0ZXNcIiwgXCJhc3NldHMvZGV0ZXJtaW5lZC1kaWxsLXNwcml0ZXMucG5nXCIsIFwiYXNzZXRzL2RldGVybWluZWQtZGlsbC1zcHJpdGVzLmpzb25cIik7XG4gICAgfSxcblxuICAgIC8vIENyZWF0ZVxuICAgIGNyZWF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAvLyBTZXQgYmFja2dyb3VuZFxuICAgICAgdGhpcy5nYW1lLnN0YWdlLmJhY2tncm91bmRDb2xvciA9IFwiI2I4ZjRiY1wiO1xuXG4gICAgICAvLyBTZXQgaW5pdGlhbCBkaWZmaWN1bHR5XG4gICAgICB0aGlzLnNldERpZmZpY3VsdHkoKTtcblxuICAgICAgLy8gU2NvcmluZ1xuICAgICAgdGhpcy5zY29yZUNvaW4gPSAxMDA7XG4gICAgICB0aGlzLnNjb3JlQm9vc3QgPSA1MDA7XG4gICAgICB0aGlzLnNjb3JlQm90ID0gMTAwMDtcblxuICAgICAgLy8gU3BhY2luZ1xuICAgICAgdGhpcy5wYWRkaW5nID0gMTA7XG5cbiAgICAgIC8vIEluaXRpYWxpemUgdHJhY2tpbmcgdmFyaWFibGVzXG4gICAgICB0aGlzLnJlc2V0Vmlld1RyYWNraW5nKCk7XG5cbiAgICAgIC8vIFNjYWxpbmdcbiAgICAgIHRoaXMuZ2FtZS5zY2FsZS5zY2FsZU1vZGUgPSBQaGFzZXIuU2NhbGVNYW5hZ2VyLlNIT1dfQUxMO1xuICAgICAgdGhpcy5nYW1lLnNjYWxlLm1heFdpZHRoID0gdGhpcy5nYW1lLndpZHRoO1xuICAgICAgdGhpcy5nYW1lLnNjYWxlLm1heEhlaWdodCA9IHRoaXMuZ2FtZS5oZWlnaHQ7XG4gICAgICB0aGlzLmdhbWUuc2NhbGUucGFnZUFsaWduSG9yaXpvbnRhbGx5ID0gdHJ1ZTtcbiAgICAgIHRoaXMuZ2FtZS5zY2FsZS5wYWdlQWxpZ25WZXJ0aWNhbGx5ID0gdHJ1ZTtcblxuICAgICAgLy8gUGh5c2ljc1xuICAgICAgdGhpcy5nYW1lLnBoeXNpY3Muc3RhcnRTeXN0ZW0oUGhhc2VyLlBoeXNpY3MuQVJDQURFKTtcbiAgICAgIHRoaXMuZ2FtZS5waHlzaWNzLmFyY2FkZS5ncmF2aXR5LnkgPSAxMDAwO1xuXG4gICAgICAvLyBEZXRlcm1pbmUgd2hlcmUgZmlyc3QgcGxhdGZvcm0gYW5kIGhlcm8gd2lsbCBiZVxuICAgICAgdGhpcy5zdGFydFkgPSB0aGlzLmdhbWUuaGVpZ2h0IC0gNTtcbiAgICAgIHRoaXMuaGVybyA9IG5ldyBwcmVmYWJzLkhlcm8odGhpcy5nYW1lLCAwLCAwKTtcbiAgICAgIHRoaXMuaGVyby5yZXNldFBsYWNlbWVudCh0aGlzLmdhbWUud2lkdGggKiAwLjUsIHRoaXMuc3RhcnRZIC0gdGhpcy5oZXJvLmhlaWdodCk7XG4gICAgICB0aGlzLmdhbWUuYWRkLmV4aXN0aW5nKHRoaXMuaGVybyk7XG5cbiAgICAgIC8vIENvbnRhaW5lcnNcbiAgICAgIHRoaXMuY29pbnMgPSB0aGlzLmdhbWUuYWRkLmdyb3VwKCk7XG4gICAgICB0aGlzLmJvb3N0cyA9IHRoaXMuZ2FtZS5hZGQuZ3JvdXAoKTtcbiAgICAgIHRoaXMuYm90cyA9IHRoaXMuZ2FtZS5hZGQuZ3JvdXAoKTtcblxuICAgICAgLy8gUGxhdGZvcm1zXG4gICAgICB0aGlzLmFkZFBsYXRmb3JtcygpO1xuXG4gICAgICAvLyBJbml0aWFsaXplIHNjb3JlXG4gICAgICB0aGlzLnJlc2V0U2NvcmUoKTtcbiAgICAgIHRoaXMudXBkYXRlU2NvcmUoKTtcblxuICAgICAgLy8gQ3Vyc29ycywgaW5wdXRcbiAgICAgIHRoaXMuY3Vyc29ycyA9IHRoaXMuZ2FtZS5pbnB1dC5rZXlib2FyZC5jcmVhdGVDdXJzb3JLZXlzKCk7XG4gICAgICB0aGlzLmFjdGlvbkJ1dHRvbiA9IHRoaXMuZ2FtZS5pbnB1dC5rZXlib2FyZC5hZGRLZXkoUGhhc2VyLktleWJvYXJkLlNQQUNFQkFSKTtcbiAgICB9LFxuXG4gICAgLy8gVXBkYXRlXG4gICAgdXBkYXRlOiBmdW5jdGlvbigpIHtcbiAgICAgIC8vIFRoaXMgaXMgd2hlcmUgdGhlIG1haW4gbWFnaWMgaGFwcGVuc1xuICAgICAgLy8gdGhlIHkgb2Zmc2V0IGFuZCB0aGUgaGVpZ2h0IG9mIHRoZSB3b3JsZCBhcmUgYWRqdXN0ZWRcbiAgICAgIC8vIHRvIG1hdGNoIHRoZSBoaWdoZXN0IHBvaW50IHRoZSBoZXJvIGhhcyByZWFjaGVkXG4gICAgICB0aGlzLndvcmxkLnNldEJvdW5kcygwLCAtdGhpcy5oZXJvLnlDaGFuZ2UsIHRoaXMuZ2FtZS53b3JsZC53aWR0aCxcbiAgICAgICAgdGhpcy5nYW1lLmhlaWdodCArIHRoaXMuaGVyby55Q2hhbmdlKTtcblxuICAgICAgLy8gVGhlIGJ1aWx0IGluIGNhbWVyYSBmb2xsb3cgbWV0aG9kcyB3b24ndCB3b3JrIGZvciBvdXIgbmVlZHNcbiAgICAgIC8vIHRoaXMgaXMgYSBjdXN0b20gZm9sbG93IHN0eWxlIHRoYXQgd2lsbCBub3QgZXZlciBtb3ZlIGRvd24sIGl0IG9ubHkgbW92ZXMgdXBcbiAgICAgIHRoaXMuY2FtZXJhWU1pbiA9IE1hdGgubWluKHRoaXMuY2FtZXJhWU1pbiwgdGhpcy5oZXJvLnkgLSB0aGlzLmdhbWUuaGVpZ2h0IC8gMik7XG4gICAgICB0aGlzLmNhbWVyYS55ID0gdGhpcy5jYW1lcmFZTWluO1xuXG4gICAgICAvLyBJZiBoZXJvIGZhbGxzIGJlbG93IGNhbWVyYVxuICAgICAgaWYgKHRoaXMuaGVyby55ID4gdGhpcy5jYW1lcmFZTWluICsgdGhpcy5nYW1lLmhlaWdodCArIDIwMCkge1xuICAgICAgICB0aGlzLmdhbWVPdmVyKCk7XG4gICAgICB9XG5cbiAgICAgIC8vIE1vdmUgaGVyb1xuICAgICAgdGhpcy5oZXJvLmJvZHkudmVsb2NpdHkueCA9XG4gICAgICAgICh0aGlzLmN1cnNvcnMubGVmdC5pc0Rvd24pID8gLSh0aGlzLmdhbWUucGh5c2ljcy5hcmNhZGUuZ3Jhdml0eS55IC8gNSkgOlxuICAgICAgICAodGhpcy5jdXJzb3JzLnJpZ2h0LmlzRG93bikgPyAodGhpcy5nYW1lLnBoeXNpY3MuYXJjYWRlLmdyYXZpdHkueSAvIDUpIDogMDtcblxuICAgICAgLy8gUGxhdGZvcm0gY29sbGlzaW9uc1xuICAgICAgdGhpcy5nYW1lLnBoeXNpY3MuYXJjYWRlLmNvbGxpZGUodGhpcy5oZXJvLCB0aGlzLnBsYXRmb3JtcywgdGhpcy51cGRhdGVIZXJvUGxhdGZvcm0sIG51bGwsIHRoaXMpO1xuICAgICAgdGhpcy5nYW1lLnBoeXNpY3MuYXJjYWRlLmNvbGxpZGUodGhpcy5oZXJvLCB0aGlzLmJhc2UsIHRoaXMudXBkYXRlSGVyb1BsYXRmb3JtLCBudWxsLCB0aGlzKTtcblxuICAgICAgLy8gQ29pbiBjb2xsaXNpb25zXG4gICAgICB0aGlzLmdhbWUucGh5c2ljcy5hcmNhZGUub3ZlcmxhcCh0aGlzLmhlcm8sIHRoaXMuY29pbnMsIGZ1bmN0aW9uKGhlcm8sIGNvaW4pIHtcbiAgICAgICAgY29pbi5raWxsKCk7XG4gICAgICAgIHRoaXMudXBkYXRlU2NvcmUodGhpcy5zY29yZUNvaW4pO1xuICAgICAgfSwgbnVsbCwgdGhpcyk7XG5cbiAgICAgIC8vIEJvb3N0cyBjb2xsaXNpb25zXG4gICAgICB0aGlzLmdhbWUucGh5c2ljcy5hcmNhZGUub3ZlcmxhcCh0aGlzLmhlcm8sIHRoaXMuYm9vc3RzLCBmdW5jdGlvbihoZXJvLCBib29zdCkge1xuICAgICAgICBib29zdC5raWxsKCk7XG4gICAgICAgIHRoaXMudXBkYXRlU2NvcmUodGhpcy5zY29yZUJvb3N0KTtcbiAgICAgICAgaGVyby5ib2R5LnZlbG9jaXR5LnkgPSB0aGlzLmdhbWUucGh5c2ljcy5hcmNhZGUuZ3Jhdml0eS55ICogLTEgKiAxLjU7XG4gICAgICB9LCBudWxsLCB0aGlzKTtcblxuICAgICAgLy8gQm90dWxpc20gY29sbGlzaW9ucy4gIElmIGhlcm9rIGp1bXBzIG9uIHRvcCwgdGhlbiBraWxsLCBvdGhlcndpc2UgZGllXG4gICAgICB0aGlzLmdhbWUucGh5c2ljcy5hcmNhZGUuY29sbGlkZSh0aGlzLmhlcm8sIHRoaXMuYm90cywgZnVuY3Rpb24oaGVybywgYm90KSB7XG4gICAgICAgIGlmIChoZXJvLmJvZHkudG91Y2hpbmcuZG93bikge1xuICAgICAgICAgIGJvdC5raWxsKCk7XG4gICAgICAgICAgdGhpcy51cGRhdGVTY29yZSh0aGlzLnNjb3JlQm90KTtcbiAgICAgICAgICBoZXJvLmJvZHkudmVsb2NpdHkueSA9IHRoaXMuZ2FtZS5waHlzaWNzLmFyY2FkZS5ncmF2aXR5LnkgKiAtMSAqIDAuNTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICB0aGlzLmdhbWVPdmVyKCk7XG4gICAgICAgIH1cbiAgICAgIH0sIG51bGwsIHRoaXMpO1xuXG4gICAgICAvLyBGb3IgZWFjaCBwbGF0Zm9ybSwgZmluZCBvdXQgd2hpY2ggaXMgdGhlIGhpZ2hlc3RcbiAgICAgIC8vIGlmIG9uZSBnb2VzIGJlbG93IHRoZSBjYW1lcmEgdmlldywgdGhlbiBjcmVhdGUgYSBuZXdcbiAgICAgIC8vIG9uZSBhdCBhIGRpc3RhbmNlIGZyb20gdGhlIGhpZ2hlc3Qgb25lXG4gICAgICAvLyB0aGVzZSBhcmUgcG9vbGVkIHNvIHRoZXkgYXJlIHZlcnkgcGVyZm9ybWFudC5cbiAgICAgIHRoaXMucGxhdGZvcm1zLmZvckVhY2hBbGl2ZShmdW5jdGlvbihwKSB7XG4gICAgICAgIHZhciBwbGF0Zm9ybTtcbiAgICAgICAgdGhpcy5wbGF0Zm9ybVlNaW4gPSBNYXRoLm1pbih0aGlzLnBsYXRmb3JtWU1pbiwgcC55KTtcblxuICAgICAgICAvLyBDaGVjayBpZiB0aGlzIG9uZSBpcyBvZiB0aGUgc2NyZWVuXG4gICAgICAgIGlmIChwLnkgPiB0aGlzLmNhbWVyYS55ICsgdGhpcy5nYW1lLmhlaWdodCkge1xuICAgICAgICAgIHAua2lsbCgpO1xuICAgICAgICAgIHBsYXRmb3JtID0gdGhpcy5wbGF0Zm9ybXMuZ2V0Rmlyc3REZWFkKCk7XG4gICAgICAgICAgdGhpcy5wbGFjZVBsYXRmb3JtKHRoaXMucGxhdGZvcm1zLmdldEZpcnN0RGVhZCgpLCB0aGlzLnBsYXRmb3Jtcy5nZXRUb3AoKSk7XG4gICAgICAgIH1cbiAgICAgIH0sIHRoaXMpO1xuXG4gICAgICAvLyBSZW1vdmUgYW55IGZsdWZmXG4gICAgICBbXCJjb2luc1wiLCBcImJvb3N0c1wiLCBcImJvdHNcIl0uZm9yRWFjaChfLmJpbmQoZnVuY3Rpb24ocG9vbCkge1xuICAgICAgICB0aGlzW3Bvb2xdLmZvckVhY2hBbGl2ZShmdW5jdGlvbihwKSB7XG4gICAgICAgICAgLy8gQ2hlY2sgaWYgdGhpcyBvbmUgaXMgb2YgdGhlIHNjcmVlblxuICAgICAgICAgIGlmIChwLnkgPiB0aGlzLmNhbWVyYS55ICsgdGhpcy5nYW1lLmhlaWdodCkge1xuICAgICAgICAgICAgcC5raWxsKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9LCB0aGlzKTtcbiAgICAgIH0sIHRoaXMpKTtcblxuICAgICAgLy8gVXBkYXRlIHNjb3JlXG4gICAgICB0aGlzLnVwZGF0ZVNjb3JlKCk7XG5cbiAgICAgIC8vIFVwZGF0ZSBkaWZmaWN1bHRcbiAgICAgIHRoaXMuc2V0RGlmZmljdWx0eSgpO1xuICAgIH0sXG5cbiAgICAvLyBQbGF0Zm9ybSBjb2xsaXNpb25cbiAgICB1cGRhdGVIZXJvUGxhdGZvcm06IGZ1bmN0aW9uKGhlcm8pIHtcbiAgICAgIGhlcm8uYm9keS52ZWxvY2l0eS55ID0gdGhpcy5nYW1lLnBoeXNpY3MuYXJjYWRlLmdyYXZpdHkueSAqIC0xICogMC43O1xuICAgIH0sXG5cbiAgICAvLyBTaHV0ZG93blxuICAgIHNodXRkb3duOiBmdW5jdGlvbigpIHtcbiAgICAgIC8vIFJlc2V0IGV2ZXJ5dGhpbmcsIG9yIHRoZSB3b3JsZCB3aWxsIGJlIG1lc3NlZCB1cFxuICAgICAgdGhpcy53b3JsZC5zZXRCb3VuZHMoMCwgMCwgdGhpcy5nYW1lLndpZHRoLCB0aGlzLmdhbWUuaGVpZ2h0KTtcbiAgICAgIHRoaXMuY3Vyc29yID0gbnVsbDtcbiAgICAgIHRoaXMucmVzZXRWaWV3VHJhY2tpbmcoKTtcbiAgICAgIHRoaXMucmVzZXRTY29yZSgpO1xuXG4gICAgICBbXCJoZXJvXCIsIFwicGxhdGZvcm1zXCIsIFwiY29pbnNcIiwgXCJib29zdHNcIiwgXCJzY29yZUdyb3VwXCJdLmZvckVhY2goXy5iaW5kKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgdGhpc1tpdGVtXS5kZXN0cm95KCk7XG4gICAgICAgIHRoaXNbaXRlbV0gPSBudWxsO1xuICAgICAgfSwgdGhpcykpO1xuICAgIH0sXG5cbiAgICAvLyBHYW1lIG92ZXJcbiAgICBnYW1lT3ZlcjogZnVuY3Rpb24oKSB7XG4gICAgICAvLyBDYW4ndCBzZWVtIHRvIGZpbmQgYSB3YXkgdG8gcGFzcyB0aGUgc2NvcmVcbiAgICAgIC8vIHZpYSBhIHN0YXRlIGNoYW5nZS5cbiAgICAgIHRoaXMuZ2FtZS5waWNrbGUuc2NvcmUgPSB0aGlzLnNjb3JlO1xuICAgICAgdGhpcy5nYW1lLnN0YXRlLnN0YXJ0KFwiZ2FtZW92ZXJcIik7XG4gICAgfSxcblxuICAgIC8vIEFkZCBwbGF0Zm9ybSBwb29sIGFuZCBjcmVhdGUgaW5pdGlhbCBvbmVcbiAgICBhZGRQbGF0Zm9ybXM6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5wbGF0Zm9ybXMgPSB0aGlzLmdhbWUuYWRkLmdyb3VwKCk7XG5cbiAgICAgIC8vIEFkZCBmaXJzdCBwbGF0Zm9ybS4gIFRPRE86IENoYW5nZSB0byBpdHMgb3duIHByZWZhYiwgc3ByaXRlXG4gICAgICB0aGlzLmJhc2UgPSBuZXcgcHJlZmFicy5QbGF0Zm9ybSh0aGlzLmdhbWUsIHRoaXMuZ2FtZS53aWR0aCAqIDAuNSwgdGhpcy5zdGFydFksIHRoaXMuZ2FtZS53aWR0aCAqIDIpO1xuICAgICAgdGhpcy5nYW1lLmFkZC5leGlzdGluZyh0aGlzLmJhc2UpO1xuXG4gICAgICAvLyBBZGQgc29tZSBiYXNlIHBsYXRmb3Jtc1xuICAgICAgdmFyIHByZXZpb3VzO1xuICAgICAgXy5lYWNoKF8ucmFuZ2UoMjApLCBfLmJpbmQoZnVuY3Rpb24oaSkge1xuICAgICAgICB2YXIgcCA9IG5ldyBwcmVmYWJzLlBsYXRmb3JtKHRoaXMuZ2FtZSwgMCwgMCk7XG4gICAgICAgIHRoaXMucGxhY2VQbGF0Zm9ybShwLCBwcmV2aW91cywgdGhpcy53b3JsZC5oZWlnaHQgLSB0aGlzLnBsYXRmb3JtU3BhY2VZIC0gdGhpcy5wbGF0Zm9ybVNwYWNlWSAqIGkpO1xuICAgICAgICB0aGlzLnBsYXRmb3Jtcy5hZGQocCk7XG4gICAgICAgIHByZXZpb3VzID0gcDtcbiAgICAgIH0sIHRoaXMpKTtcbiAgICB9LFxuXG4gICAgLy8gUGxhY2UgcGxhdGZvcm1cbiAgICBwbGFjZVBsYXRmb3JtOiBmdW5jdGlvbihwbGF0Zm9ybSwgcHJldmlvdXNQbGF0Zm9ybSwgb3ZlcnJpZGVZKSB7XG4gICAgICBwbGF0Zm9ybS5yZXNldFNldHRpbmdzKCk7XG4gICAgICB2YXIgeSA9IG92ZXJyaWRlWSB8fCB0aGlzLnBsYXRmb3JtWU1pbiAtIHRoaXMucGxhdGZvcm1TcGFjZVk7XG4gICAgICB2YXIgbWluWCA9IHBsYXRmb3JtLm1pblg7XG4gICAgICB2YXIgbWF4WCA9IHBsYXRmb3JtLm1heFg7XG5cbiAgICAgIC8vIERldGVybWluZSB4IGJhc2VkIG9uIHByZXZpb3VzUGxhdGZvcm1cbiAgICAgIHZhciB4ID0gdGhpcy5ybmQuaW50ZWdlckluUmFuZ2UobWluWCwgbWF4WCk7XG4gICAgICBpZiAocHJldmlvdXNQbGF0Zm9ybSkge1xuICAgICAgICB4ID0gdGhpcy5ybmQuaW50ZWdlckluUmFuZ2UocHJldmlvdXNQbGF0Zm9ybS54IC0gdGhpcy5wbGF0Zm9ybUdhcE1heCwgcHJldmlvdXNQbGF0Zm9ybS54ICsgdGhpcy5wbGF0Zm9ybUdhcE1heCk7XG5cbiAgICAgICAgLy8gU29tZSBsb2dpYyB0byB0cnkgdG8gd3JhcFxuICAgICAgICB4ID0gKHggPCAwKSA/IE1hdGgubWluKG1heFgsIHRoaXMud29ybGQud2lkdGggKyB4KSA6IE1hdGgubWF4KHgsIG1pblgpO1xuICAgICAgICB4ID0gKHggPiB0aGlzLndvcmxkLndpZHRoKSA/IE1hdGgubWF4KG1pblgsIHggLSB0aGlzLndvcmxkLndpZHRoKSA6IE1hdGgubWluKHgsIG1heFgpO1xuICAgICAgfVxuXG4gICAgICAvLyBQbGFjZVxuICAgICAgcGxhdGZvcm0ucmVzZXQoeCwgeSk7XG5cbiAgICAgIC8vIEFkZCBzb21lIGZsdWZmXG4gICAgICB0aGlzLmZsdWZmUGxhdGZvcm0ocGxhdGZvcm0pO1xuICAgIH0sXG5cbiAgICAvLyBBZGQgcG9zc2libGUgZmx1ZmYgdG8gcGxhdGZvcm1cbiAgICBmbHVmZlBsYXRmb3JtOiBmdW5jdGlvbihwbGF0Zm9ybSkge1xuICAgICAgdmFyIHggPSBwbGF0Zm9ybS54O1xuICAgICAgdmFyIHkgPSBwbGF0Zm9ybS55IC0gcGxhdGZvcm0uaGVpZ2h0IC8gMiAtIDMwO1xuXG4gICAgICAvLyBBZGQgZmx1ZmZcbiAgICAgIGlmIChNYXRoLnJhbmRvbSgpIDw9IHRoaXMuaG92ZXJDaGFuY2UpIHtcbiAgICAgICAgcGxhdGZvcm0uaG92ZXIgPSB0cnVlO1xuICAgICAgfVxuICAgICAgZWxzZSBpZiAoTWF0aC5yYW5kb20oKSA8PSB0aGlzLmNvaW5DaGFuY2UpIHtcbiAgICAgICAgdGhpcy5hZGRXaXRoUG9vbCh0aGlzLmNvaW5zLCBcIkNvaW5cIiwgeCwgeSk7XG4gICAgICB9XG4gICAgICBlbHNlIGlmIChNYXRoLnJhbmRvbSgpIDw9IHRoaXMuYm9vc3RDaGFuY2UpIHtcbiAgICAgICAgdGhpcy5hZGRXaXRoUG9vbCh0aGlzLmJvb3N0cywgXCJCb29zdFwiLCB4LCB5KTtcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKE1hdGgucmFuZG9tKCkgPD0gdGhpcy5ib3RDaGFuY2UpIHtcbiAgICAgICAgdGhpcy5hZGRXaXRoUG9vbCh0aGlzLmJvdHMsIFwiQm90dWxpc21cIiwgeCwgeSk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIC8vIEdlbmVyaWMgYWRkIHdpdGggcG9vbGluZyBmdW5jdGlvbmFsbGl0eVxuICAgIGFkZFdpdGhQb29sOiBmdW5jdGlvbihwb29sLCBwcmVmYWIsIHgsIHkpIHtcbiAgICAgIHZhciBvID0gcG9vbC5nZXRGaXJzdERlYWQoKTtcbiAgICAgIG8gPSBvIHx8IG5ldyBwcmVmYWJzW3ByZWZhYl0odGhpcy5nYW1lLCB4LCB5KTtcblxuICAgICAgLy8gVXNlIGN1c3RvbSByZXNldCBpZiBhdmFpbGFibGVcbiAgICAgIGlmIChvLnJlc2V0UGxhY2VtZW50KSB7XG4gICAgICAgIG8ucmVzZXRQbGFjZW1lbnQoeCwgeSk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgby5yZXNldCh4LCB5KTtcbiAgICAgIH1cblxuICAgICAgcG9vbC5hZGQobyk7XG4gICAgfSxcblxuICAgIC8vIFVwZGF0ZSBzY29yZS4gIFNjb3JlIGlzIHRoZSBzY29yZSB3aXRob3V0IGhvdyBmYXIgdGhleSBoYXZlIGdvbmUgdXAuXG4gICAgdXBkYXRlU2NvcmU6IGZ1bmN0aW9uKGFkZGl0aW9uKSB7XG4gICAgICBhZGRpdGlvbiA9IGFkZGl0aW9uIHx8IDA7XG4gICAgICB0aGlzLnNjb3JlVXAgPSAoLXRoaXMuY2FtZXJhWU1pbiA+PSA5OTk5OTk5KSA/IDAgOlxuICAgICAgICBNYXRoLm1pbihNYXRoLm1heCgwLCAtdGhpcy5jYW1lcmFZTWluKSwgOTk5OTk5OSAtIDEpO1xuICAgICAgdGhpcy5zY29yZUNvbGxlY3QgPSAodGhpcy5zY29yZUNvbGxlY3QgfHwgMCkgKyBhZGRpdGlvbjtcbiAgICAgIHRoaXMuc2NvcmUgPSBNYXRoLnJvdW5kKHRoaXMuc2NvcmVVcCArIHRoaXMuc2NvcmVDb2xsZWN0KTtcblxuICAgICAgLy8gU2NvcmUgdGV4dFxuICAgICAgaWYgKCF0aGlzLnNjb3JlR3JvdXApIHtcbiAgICAgICAgdGhpcy5zY29yZUdyb3VwID0gdGhpcy5nYW1lLmFkZC5ncm91cCgpO1xuXG4gICAgICAgIC8vIFNjb3JlIGxhYmVsXG4gICAgICAgIHRoaXMuc2NvcmVMYWJlbEltYWdlID0gdGhpcy5nYW1lLmFkZC5zcHJpdGUoXG4gICAgICAgICAgdGhpcy5wYWRkaW5nLFxuICAgICAgICAgIHRoaXMucGFkZGluZyAqIDAuODUsIFwicGxheS1zcHJpdGVzXCIsIFwieW91ci1zY29yZS5wbmdcIik7XG4gICAgICAgIHRoaXMuc2NvcmVMYWJlbEltYWdlLmFuY2hvci5zZXRUbygwLCAwKTtcbiAgICAgICAgdGhpcy5zY29yZUxhYmVsSW1hZ2Uuc2NhbGUuc2V0VG8oKHRoaXMuZ2FtZS53aWR0aCAvIDYpIC8gdGhpcy5zY29yZUxhYmVsSW1hZ2Uud2lkdGgpO1xuICAgICAgICB0aGlzLnNjb3JlR3JvdXAuYWRkKHRoaXMuc2NvcmVMYWJlbEltYWdlKTtcblxuICAgICAgICAvLyBTY29yZSB0ZXh0XG4gICAgICAgIHRoaXMuc2NvcmVUZXh0ID0gdGhpcy5nYW1lLmFkZC50ZXh0KFxuICAgICAgICAgIHRoaXMuc2NvcmVMYWJlbEltYWdlLndpZHRoICsgKHRoaXMucGFkZGluZyAqIDIpLFxuICAgICAgICAgIHRoaXMucGFkZGluZyAqIDAuMjUsXG4gICAgICAgICAgdGhpcy5zY29yZS50b0xvY2FsZVN0cmluZygpLCB7XG4gICAgICAgICAgICBmb250OiBcImJvbGQgXCIgKyAodGhpcy5nYW1lLndvcmxkLmhlaWdodCAvIDQwKSArIFwicHggRG9zaXNcIixcbiAgICAgICAgICAgIGZpbGw6IFwiIzM5YjU0YVwiLFxuICAgICAgICAgICAgYWxpZ246IFwibGVmdFwiLFxuICAgICAgICAgIH0pO1xuICAgICAgICB0aGlzLnNjb3JlVGV4dC5hbmNob3Iuc2V0VG8oMCwgMCk7XG4gICAgICAgIHRoaXMuc2NvcmVHcm91cC5hZGQodGhpcy5zY29yZVRleHQpO1xuXG4gICAgICAgIHRoaXMuc2NvcmVHcm91cC5maXhlZFRvQ2FtZXJhID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5zY29yZUdyb3VwLmNhbWVyYU9mZnNldC5zZXRUbyh0aGlzLnBhZGRpbmcsIHRoaXMucGFkZGluZyk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgdGhpcy5zY29yZVRleHQudGV4dCA9IHRoaXMuc2NvcmUudG9Mb2NhbGVTdHJpbmcoKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLy8gUmVzZXQgc2NvcmVcbiAgICByZXNldFNjb3JlOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2NvcmVVcCA9IDA7XG4gICAgICB0aGlzLnNjb3JlQ29sbGVjdCA9IDA7XG4gICAgICB0aGlzLnNjb3JlID0gMDtcbiAgICB9LFxuXG4gICAgLy8gUmVzZXQgdmlldyB0cmFja2luZ1xuICAgIHJlc2V0Vmlld1RyYWNraW5nOiBmdW5jdGlvbigpIHtcbiAgICAgIC8vIENhbWVyYSBhbmQgcGxhdGZvcm0gdHJhY2tpbmcgdmFyc1xuICAgICAgdGhpcy5jYW1lcmFZTWluID0gOTk5OTk5OTtcbiAgICAgIHRoaXMucGxhdGZvcm1ZTWluID0gOTk5OTk5OTtcbiAgICB9LFxuXG4gICAgLy8gR2VuZXJhbCB0b3VjaGluZ1xuICAgIGlzVG91Y2hpbmc6IGZ1bmN0aW9uKGJvZHkpIHtcbiAgICAgIGlmIChib2R5ICYmIGJvZHkudG91Y2gpIHtcbiAgICAgICAgcmV0dXJuIChib2R5LnRvdWNoaW5nLnVwIHx8IGJvZHkudG91Y2hpbmcuZG93biB8fFxuICAgICAgICAgIGJvZHkudG91Y2hpbmcubGVmdCB8fCBib2R5LnRvdWNoaW5nLnJpZ2h0KTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0sXG5cbiAgICAvLyBEZXRlcm1pbmUgZGlmZmljdWx0eVxuICAgIHNldERpZmZpY3VsdHk6IGZ1bmN0aW9uKCkge1xuICAgICAgLy8gSW5pdGlhbCBzdGF0ZVxuICAgICAgdGhpcy5wbGF0Zm9ybVNwYWNlWSA9IDExMDtcbiAgICAgIHRoaXMucGxhdGZvcm1HYXBNYXggPSAyMDA7XG4gICAgICB0aGlzLmhvdmVyQ2hhbmNlID0gMC4xO1xuICAgICAgdGhpcy5jb2luQ2hhbmNlID0gMC4zO1xuICAgICAgdGhpcy5ib29zdENoYW5jZSA9IDAuMztcbiAgICAgIHRoaXMuYm90Q2hhbmNlID0gMC4wO1xuXG4gICAgICAvLyBJbml0aWxhIHBoeXNpY3MgdGltZVxuICAgICAgLy90aGlzLmdhbWUudGltZS5zbG93TW90aW9uID0gMTtcblxuICAgICAgLy8gRGVmYXVsdFxuICAgICAgaWYgKHRoaXMuY2FtZXJhWU1pbiA+IC10aGlzLmdhbWUuaGVpZ2h0KSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuXG4gICAgICAvLyBGaXJzdCBsZXZlbFxuICAgICAgZWxzZSBpZiAodGhpcy5jYW1lcmFZTWluID4gLTEwMDAwKSB7XG4gICAgICAgIHRoaXMuaG92ZXJDaGFuY2UgPSAwLjI7XG4gICAgICAgIHRoaXMuY29pbkNoYW5jZSA9IDAuMztcbiAgICAgICAgdGhpcy5ib29zdENoYW5jZSA9IDAuMztcbiAgICAgICAgdGhpcy5ib3RDaGFuY2UgPSAwLjE7XG4gICAgICB9XG5cbiAgICAgIC8vIFNlY29uZCBsZXZlbFxuICAgICAgZWxzZSBpZiAodGhpcy5jYW1lcmFZTWluID4gLTIwMDAwKSB7XG4gICAgICAgIHRoaXMuaG92ZXJDaGFuY2UgPSAwLjM7XG4gICAgICAgIHRoaXMuY29pbkNoYW5jZSA9IDAuMztcbiAgICAgICAgdGhpcy5ib29zdENoYW5jZSA9IDAuNDtcbiAgICAgICAgdGhpcy5ib3RDaGFuY2UgPSAwLjI7XG4gICAgICAgIHRoaXMuZ2FtZS5zdGFnZS5iYWNrZ3JvdW5kQ29sb3IgPSBcIiM4Q0VFOTRcIjtcbiAgICAgIH1cblxuICAgICAgLy8gVGhpcmQgbGV2ZWxcbiAgICAgIGVsc2UgaWYgKHRoaXMuY2FtZXJhWU1pbiA+IC0zMDAwMCkge1xuICAgICAgICB0aGlzLmhvdmVyQ2hhbmNlID0gMC40O1xuICAgICAgICB0aGlzLmNvaW5DaGFuY2UgPSAwLjI7XG4gICAgICAgIHRoaXMuYm9vc3RDaGFuY2UgPSAwLjQ7XG4gICAgICAgIHRoaXMuYm90Q2hhbmNlID0gMC4zO1xuICAgICAgICB0aGlzLmdhbWUuc3RhZ2UuYmFja2dyb3VuZENvbG9yID0gXCIjNUZFNzZCXCI7XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICAvLyBFeHBvcnRcbiAgbW9kdWxlLmV4cG9ydHMgPSBQbGF5O1xufSkoKTtcbiJdfQ==
