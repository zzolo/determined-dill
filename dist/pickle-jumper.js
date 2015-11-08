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

},{"./pickle-jumper/state-gameover.js":9,"./pickle-jumper/state-menu.js":10,"./pickle-jumper/state-play.js":11}],2:[function(require,module,exports){
/* global _:false, Phaser:false */

/**
 * Prefab base platform
 */

(function() {
  "use strict";

  // Constructor
  var Base = function(game, x, y) {
    // Call default sprite
    Phaser.Sprite.call(this, game, x, y, "game-sprites", "jar.png");

    // Configure
    this.anchor.setTo(0.5, 0.5);
    this.scale.setTo((this.game.width / 2) / this.width);

    // Physics
    this.game.physics.arcade.enableBody(this);
    this.body.allowGravity = false;
    this.body.immovable = true;
  };

  // Extend from Sprite
  Base.prototype = Object.create(Phaser.Sprite.prototype);
  Base.prototype.constructor = Base;

  // Add methods
  _.extend(Base.prototype, {
    update: function() {
    }
  });

  // Export
  module.exports = Base;
})();

},{}],3:[function(require,module,exports){
/* global _:false, Phaser:false */

/**
 * Prefab (objects) boost for boost/dill
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

},{}],4:[function(require,module,exports){
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

},{}],5:[function(require,module,exports){
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

},{}],6:[function(require,module,exports){
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

    // Animations
    var upFrames = Phaser.Animation.generateFrameNames("pickle-jump-", 1, 4, ".png", 2);
    var downFrames = Phaser.Animation.generateFrameNames("pickle-jump-", 4, 1, ".png", 2);
    this.jumpUp = this.animations.add("jump-up", upFrames);
    this.JumpDown = this.animations.add("jump-down", downFrames);
    this.jump = this.animations.add("jump", upFrames.concat(downFrames));
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

      // When heading down, animate to down
      if (this.body.velocity.y > 0 && this.goingUp) {
        this.onFire = false;
        this.goingUp = false;
        this.doJumpDown();
      }

      // Else when heading up, note
      else if (this.body.velocity.y < 0 && !this.goingUp) {
        this.goingUp = true;
        this.doJumpUp();
      }
    },

    // Reset placement custom
    resetPlacement: function(x, y) {
      this.reset(x, y);
      this.yOrig = this.y;
      this.yChange = 0;
    },

    // Jump up
    doJumpUp: function() {
      if (!this.onFire) {
        this.animations.play("jump-up", 15, false);
      }
    },

    // Jump down
    doJumpDown: function() {
      if (!this.onFire) {
        this.animations.play("jump-down", 15, false);
      }
    },

    // On fire
    setOnFire: function() {
      this.onFire = true;
      this.loadTexture("pickle-sprites", "pickle-rocket.png");
    },

    // Off fire
    putOutFire: function() {
      this.onFire = false;
    }
  });

  // Export
  module.exports = Hero;
})();

},{}],7:[function(require,module,exports){
/* global _:false, Phaser:false */

/**
 * Prefab (objects) boost for pepper
 */

(function() {
  "use strict";

  // Constructor for Boost
  var Pepper = function(game, x, y) {
    // Call default sprite
    Phaser.Sprite.call(this, game, x, y, "game-sprites", "ghost-pepper.png");

    // Size
    this.anchor.setTo(0.5, 0.5);
    this.scale.setTo((this.game.width / 18) / this.width);

    // Physics
    this.game.physics.arcade.enableBody(this);
    this.body.allowGravity = false;
    this.body.immovable = true;
  };

  // Extend from Sprite
  Pepper.prototype = Object.create(Phaser.Sprite.prototype);
  Pepper.prototype.constructor = Pepper;

  // Add methods
  _.extend(Pepper.prototype, {
    update: function() {

    }
  });

  // Export
  module.exports = Pepper;
})();

},{}],8:[function(require,module,exports){
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

},{}],9:[function(require,module,exports){
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

},{}],10:[function(require,module,exports){
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

},{}],11:[function(require,module,exports){
/* global _:false, Phaser:false */

/**
 * Play state
 */

(function() {
  "use strict";

  // Dependencies
  var prefabs = {
    Boost: require("./prefab-boost.js"),
    Pepper: require("./prefab-pepper.js"),
    Botulism: require("./prefab-botulism.js"),
    Coin: require("./prefab-coin.js"),
    Hero: require("./prefab-hero.js"),
    Platform: require("./prefab-platform.js"),
    Base: require("./prefab-base.js")
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
      // Set initial difficulty and level settings
      this.createSuperLevelBG();
      this.setDifficulty();

      // Scoring
      this.scoreCoin = 100;
      this.scoreBoost = 500;
      this.scorePepper = 750;
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
      this.hero.resetPlacement(this.game.width * 0.5, this.startY - this.hero.height - 50);
      this.game.add.existing(this.hero);

      // Containers
      this.coins = this.game.add.group();
      this.boosts = this.game.add.group();
      this.peppers = this.game.add.group();
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

      // If hero is going down, then no longer on fire
      if (this.hero.body.velocity.y > 0) {
        this.putOutFire();
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

      // Boosts collisions.  Don't do anything if on fire
      if (!this.onFire) {
        this.game.physics.arcade.overlap(this.hero, this.boosts, function(hero, boost) {
          boost.kill();
          this.updateScore(this.scoreBoost);
          hero.body.velocity.y = this.game.physics.arcade.gravity.y * -1 * 1.5;
        }, null, this);
      }

      // Pepper collisions
      this.game.physics.arcade.overlap(this.hero, this.peppers, function(hero, pepper) {
        pepper.kill();
        this.updateScore(this.scorePepper);
        this.setOnFire();
        hero.body.velocity.y = this.game.physics.arcade.gravity.y * -1 * 3;
      }, null, this);

      // Botulism collisions.  If herok jumps on top, then kill, otherwise die, and
      // ignore if on fire.
      if (!this.onFire) {
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
      }

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
      ["coins", "boosts", "bots", "peppers"].forEach(_.bind(function(pool) {
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
      this.putOutFire();
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

      // Add first platform.
      this.base = new prefabs.Base(this.game, this.game.width * 0.5, this.startY, this.game.width * 2);
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
      else if (Math.random() <= this.pepperChance) {
        this.addWithPool(this.peppers, "Pepper", x, y);
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
      this.pepperChance = 0.1;

      // Set initial background
      this.game.stage.backgroundColor = "#937D6F";

      // Initila physics time
      //this.game.time.slowMotion = 1;

      // First level
      if (this.cameraYMin > -20000) {
        // Default
        return;
      }

      // Second level
      else if (this.cameraYMin > -40000) {
        this.hoverChance = 0.3;
        this.coinChance = 0.3;
        this.boostChance = 0.4;
        this.botChance = 0.2;
        this.game.stage.backgroundColor = "#BDDEB6";
      }

      // Third level
      else if (this.cameraYMin > -60000) {
        this.hoverChance = 0.4;
        this.coinChance = 0.2;
        this.boostChance = 0.4;
        this.botChance = 0.3;
        this.game.stage.backgroundColor = "#B1E0EC";
      }

      // Fourth level
      else if (this.cameraYMin > -80000) {
        this.bgGroup.visible = true;
        this.hoverChance = 0.4;
        this.coinChance = 0.2;
        this.boostChance = 0.4;
        this.botChance = 0.3;
      }
    },

    // Create super level gradient
    createSuperLevelBG: function() {
      this.slbgBM = this.game.make.bitmapData(this.game.width, this.game.height);

      // Create gradient
      var gradient = this.slbgBM.context.createLinearGradient(
        0, this.game.height / 2, this.game.width, this.game.height / 2);
      gradient.addColorStop(0, "#4F3F9A");
      gradient.addColorStop(1, "#E70B8D");

      // Add to bitmap
      this.slbgBM.context.fillStyle = gradient;
      this.slbgBM.context.fillRect(0, 0, this.game.width, this.game.height);

      // Create background group so that we can put this there later
      this.bgGroup = this.game.add.group();
      this.bgGroup.fixedToCamera = true;

      // Add crazy background and then hide since adding in middle
      // really messes with things
      this.bgGroup.create(0, 0, this.slbgBM);
      this.bgGroup.visible = false;
    },

    // Set on fire
    setOnFire: function() {
      this.onFire = true;
      this.hero.setOnFire();
    },

    // Set off fire
    putOutFire: function() {
      this.onFire = false;
      this.hero.putOutFire();
    }
  });

  // Export
  module.exports = Play;
})();

},{"./prefab-base.js":2,"./prefab-boost.js":3,"./prefab-botulism.js":4,"./prefab-coin.js":5,"./prefab-hero.js":6,"./prefab-pepper.js":7,"./prefab-platform.js":8}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy96em9sby9Db2RlL3BlcnNvbmFsL3BpY2tsZS1qdW1wZXIvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIi9Vc2Vycy96em9sby9Db2RlL3BlcnNvbmFsL3BpY2tsZS1qdW1wZXIvanMvZmFrZV9hODM5NDRiZS5qcyIsIi9Vc2Vycy96em9sby9Db2RlL3BlcnNvbmFsL3BpY2tsZS1qdW1wZXIvanMvcGlja2xlLWp1bXBlci9wcmVmYWItYmFzZS5qcyIsIi9Vc2Vycy96em9sby9Db2RlL3BlcnNvbmFsL3BpY2tsZS1qdW1wZXIvanMvcGlja2xlLWp1bXBlci9wcmVmYWItYm9vc3QuanMiLCIvVXNlcnMvenpvbG8vQ29kZS9wZXJzb25hbC9waWNrbGUtanVtcGVyL2pzL3BpY2tsZS1qdW1wZXIvcHJlZmFiLWJvdHVsaXNtLmpzIiwiL1VzZXJzL3p6b2xvL0NvZGUvcGVyc29uYWwvcGlja2xlLWp1bXBlci9qcy9waWNrbGUtanVtcGVyL3ByZWZhYi1jb2luLmpzIiwiL1VzZXJzL3p6b2xvL0NvZGUvcGVyc29uYWwvcGlja2xlLWp1bXBlci9qcy9waWNrbGUtanVtcGVyL3ByZWZhYi1oZXJvLmpzIiwiL1VzZXJzL3p6b2xvL0NvZGUvcGVyc29uYWwvcGlja2xlLWp1bXBlci9qcy9waWNrbGUtanVtcGVyL3ByZWZhYi1wZXBwZXIuanMiLCIvVXNlcnMvenpvbG8vQ29kZS9wZXJzb25hbC9waWNrbGUtanVtcGVyL2pzL3BpY2tsZS1qdW1wZXIvcHJlZmFiLXBsYXRmb3JtLmpzIiwiL1VzZXJzL3p6b2xvL0NvZGUvcGVyc29uYWwvcGlja2xlLWp1bXBlci9qcy9waWNrbGUtanVtcGVyL3N0YXRlLWdhbWVvdmVyLmpzIiwiL1VzZXJzL3p6b2xvL0NvZGUvcGVyc29uYWwvcGlja2xlLWp1bXBlci9qcy9waWNrbGUtanVtcGVyL3N0YXRlLW1lbnUuanMiLCIvVXNlcnMvenpvbG8vQ29kZS9wZXJzb25hbC9waWNrbGUtanVtcGVyL2pzL3BpY2tsZS1qdW1wZXIvc3RhdGUtcGxheS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNVQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qIGdsb2JhbCBfOmZhbHNlLCAkOmZhbHNlLCBQaGFzZXI6ZmFsc2UgKi9cblxuLyoqXG4gKiBNYWluIEpTIGZvciBQaWNrbGUgSnVtcGVyXG4gKi9cblxuKGZ1bmN0aW9uKCkge1xuICBcInVzZSBzdHJpY3RcIjtcblxuICAvLyBEZXBlbmRlbmNpZXNcbiAgdmFyIHN0YXRlcyA9IHtcbiAgICBHYW1lb3ZlcjogcmVxdWlyZShcIi4vcGlja2xlLWp1bXBlci9zdGF0ZS1nYW1lb3Zlci5qc1wiKSxcbiAgICBQbGF5OiByZXF1aXJlKFwiLi9waWNrbGUtanVtcGVyL3N0YXRlLXBsYXkuanNcIiksXG4gICAgTWVudTogcmVxdWlyZShcIi4vcGlja2xlLWp1bXBlci9zdGF0ZS1tZW51LmpzXCIpLFxuICB9O1xuXG4gIC8vIENvbnN0cnVjdG9yZSBmb3IgUGlja2xlXG4gIHZhciBQaWNrbGUgPSB3aW5kb3cuUGlja2xlID0gZnVuY3Rpb24ob3B0aW9ucykge1xuICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG4gICAgdGhpcy5lbCA9IHRoaXMub3B0aW9ucy5lbDtcbiAgICB0aGlzLiRlbCA9ICQodGhpcy5vcHRpb25zLmVsKTtcbiAgICB0aGlzLiQgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiAkKG9wdGlvbnMuZWwpLmZpbmQ7XG4gICAgfTtcblxuICAgIHRoaXMud2lkdGggPSB0aGlzLiRlbC53aWR0aCgpO1xuICAgIHRoaXMuaGVpZ2h0ID0gJCh3aW5kb3cpLmhlaWdodCgpO1xuXG4gICAgLy8gU3RhcnRcbiAgICB0aGlzLnN0YXJ0KCk7XG4gIH07XG5cbiAgLy8gQWRkIHByb3BlcnRpZXNcbiAgXy5leHRlbmQoUGlja2xlLnByb3RvdHlwZSwge1xuICAgIC8vIFN0YXJ0IGV2ZXJ5dGhpbmdcbiAgICBzdGFydDogZnVuY3Rpb24oKSB7XG4gICAgICAvLyBDcmVhdGUgUGhhc2VyIGdhbWVcbiAgICAgIHRoaXMuZ2FtZSA9IG5ldyBQaGFzZXIuR2FtZShcbiAgICAgICAgdGhpcy53aWR0aCxcbiAgICAgICAgdGhpcy5oZWlnaHQsXG4gICAgICAgIFBoYXNlci5BVVRPLFxuICAgICAgICB0aGlzLmVsLnJlcGxhY2UoXCIjXCIsIFwiXCIpKTtcblxuICAgICAgLy8gQWRkIHJlZmVyZW5jZSB0byBnYW1lLCBzaW5jZSBtb3N0IHBhcnRzIGhhdmUgdGhpcyByZWZlcmVuY2VcbiAgICAgIC8vIGFscmVhZHlcbiAgICAgIHRoaXMuZ2FtZS5waWNrbGUgPSB0aGlzO1xuXG4gICAgICAvLyBSZWdpc3RlciBzdGF0ZXNcbiAgICAgIHRoaXMuZ2FtZS5zdGF0ZS5hZGQoXCJtZW51XCIsIHN0YXRlcy5NZW51KTtcbiAgICAgIHRoaXMuZ2FtZS5zdGF0ZS5hZGQoXCJwbGF5XCIsIHN0YXRlcy5QbGF5KTtcbiAgICAgIHRoaXMuZ2FtZS5zdGF0ZS5hZGQoXCJnYW1lb3ZlclwiLCBzdGF0ZXMuR2FtZW92ZXIpO1xuXG4gICAgICAvLyBIaWdoc2NvcmVcbiAgICAgIHRoaXMuaGlnaHNjb3JlTGltaXQgPSAxMDtcbiAgICAgIHRoaXMuZ2V0SGlnaHNjb3JlcygpO1xuXG4gICAgICAvLyBTdGFydCB3aXRoIG1lbnVcbiAgICAgIHRoaXMuZ2FtZS5zdGF0ZS5zdGFydChcIm1lbnVcIik7XG5cbiAgICAgIC8vIERlYnVnXG4gICAgICBpZiAodGhpcy5vcHRpb25zLmRlYnVnICYmIHRoaXMuZ2FtZS5jYW1lcmEpIHtcbiAgICAgICAgdGhpcy5nYW1lLmRlYnVnLmNhbWVyYUluZm8odGhpcy5nYW1lLmNhbWVyYSwgMTAsIDEwKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMub3B0aW9ucy5kZWJ1Zykge1xuICAgICAgICB0aGlzLnJlc2V0SGlnaHNjb3JlcygpO1xuICAgICAgICB0aGlzLmdldEhpZ2hzY29yZXMoKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLy8gR2V0IGhpZ2ggc2NvcmVzXG4gICAgZ2V0SGlnaHNjb3JlczogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgcyA9IHdpbmRvdy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbShcImhpZ2hzY29yZXNcIik7XG4gICAgICBzID0gKHMpID8gSlNPTi5wYXJzZShzKSA6IFtdO1xuICAgICAgdGhpcy5oaWdoc2NvcmVzID0gcztcbiAgICAgIHRoaXMuc29ydEhpZ2hzY29yZXMoKTtcbiAgICAgIHJldHVybiB0aGlzLmhpZ2hzY29yZXM7XG4gICAgfSxcblxuICAgIC8vIEdldCBoaWdoZXN0IHNjb3JlXG4gICAgZ2V0SGlnaHNjb3JlOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBfLm1heCh0aGlzLmhpZ2hzY29yZXMsIFwic2NvcmVcIik7XG4gICAgfSxcblxuICAgIC8vIFNldCBzaW5nbGUgaGlnaHNjb3JlXG4gICAgc2V0SGlnaHNjb3JlOiBmdW5jdGlvbihzY29yZSwgbmFtZSkge1xuICAgICAgaWYgKHRoaXMuaXNIaWdoc2NvcmUoc2NvcmUpKSB7XG4gICAgICAgIHRoaXMuc29ydEhpZ2hzY29yZXMoKTtcblxuICAgICAgICAvLyBSZW1vdmUgbG93ZXN0IG9uZSBpZiBuZWVkZWRcbiAgICAgICAgaWYgKHRoaXMuaGlnaHNjb3Jlcy5sZW5ndGggPj0gdGhpcy5oaWdoc2NvcmVMaW1pdCkge1xuICAgICAgICAgIHRoaXMuaGlnaHNjb3Jlcy5zaGlmdCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQWRkIG5ldyBzY29yZVxuICAgICAgICB0aGlzLmhpZ2hzY29yZXMucHVzaCh7XG4gICAgICAgICAgbmFtZTogbmFtZSxcbiAgICAgICAgICBzY29yZTogc2NvcmVcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gU29ydCBhbmQgc2V0XG4gICAgICAgIHRoaXMuc29ydEhpZ2hzY29yZXMoKTtcbiAgICAgICAgdGhpcy5zZXRIaWdoc2NvcmVzKCk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIC8vIFNvcnQgaGlnaHNjb3Jlc1xuICAgIHNvcnRIaWdoc2NvcmVzOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuaGlnaHNjb3JlcyA9IF8uc29ydEJ5KHRoaXMuaGlnaHNjb3JlcywgXCJzY29yZVwiKTtcbiAgICB9LFxuXG4gICAgLy8gSXMgaGlnaHNjb3JlLiAgSXMgdGhlIHNjb3JlIGhpZ2hlciB0aGFuIHRoZSBsb3dlc3RcbiAgICAvLyByZWNvcmRlZCBzY29yZVxuICAgIGlzSGlnaHNjb3JlOiBmdW5jdGlvbihzY29yZSkge1xuICAgICAgdmFyIG1pbiA9IF8ubWluKHRoaXMuaGlnaHNjb3JlcywgXCJzY29yZVwiKS5zY29yZTtcbiAgICAgIHJldHVybiAoc2NvcmUgPiBtaW4gfHwgdGhpcy5oaWdoc2NvcmVzLmxlbmd0aCA8IHRoaXMuaGlnaHNjb3JlTGltaXQpO1xuICAgIH0sXG5cbiAgICAvLyBDaGVjayBpZiBzY29yZSBpcyBoaWdoZXN0IHNjb3JlXG4gICAgaXNIaWdoZXN0U2NvcmU6IGZ1bmN0aW9uKHNjb3JlKSB7XG4gICAgICB2YXIgbWF4ID0gXy5tYXgodGhpcy5oaWdoc2NvcmVzLCBcInNjb3JlXCIpLnNjb3JlIHx8IDA7XG4gICAgICByZXR1cm4gKHNjb3JlID4gbWF4KTtcbiAgICB9LFxuXG4gICAgLy8gU2V0IGhpZ2hzY29yZXNcbiAgICBzZXRIaWdoc2NvcmVzOiBmdW5jdGlvbigpIHtcbiAgICAgIHdpbmRvdy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbShcImhpZ2hzY29yZXNcIiwgSlNPTi5zdHJpbmdpZnkodGhpcy5oaWdoc2NvcmVzKSk7XG4gICAgfSxcblxuICAgIC8vIFJlc2V0IGhpZ2hzY2hvcmVzXG4gICAgcmVzZXRIaWdoc2NvcmVzOiBmdW5jdGlvbigpIHtcbiAgICAgIHdpbmRvdy5sb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbShcImhpZ2hzY29yZXNcIik7XG4gICAgfVxuICB9KTtcblxuICAvLyBDcmVhdGUgYXBwXG4gIHZhciBwO1xuICBwID0gbmV3IFBpY2tsZSh7XG4gICAgZWw6IFwiI3BpY2tsZS1qdW1wZXJcIixcbiAgICBkZWJ1ZzogZmFsc2VcbiAgfSk7XG59KSgpO1xuIiwiLyogZ2xvYmFsIF86ZmFsc2UsIFBoYXNlcjpmYWxzZSAqL1xuXG4vKipcbiAqIFByZWZhYiBiYXNlIHBsYXRmb3JtXG4gKi9cblxuKGZ1bmN0aW9uKCkge1xuICBcInVzZSBzdHJpY3RcIjtcblxuICAvLyBDb25zdHJ1Y3RvclxuICB2YXIgQmFzZSA9IGZ1bmN0aW9uKGdhbWUsIHgsIHkpIHtcbiAgICAvLyBDYWxsIGRlZmF1bHQgc3ByaXRlXG4gICAgUGhhc2VyLlNwcml0ZS5jYWxsKHRoaXMsIGdhbWUsIHgsIHksIFwiZ2FtZS1zcHJpdGVzXCIsIFwiamFyLnBuZ1wiKTtcblxuICAgIC8vIENvbmZpZ3VyZVxuICAgIHRoaXMuYW5jaG9yLnNldFRvKDAuNSwgMC41KTtcbiAgICB0aGlzLnNjYWxlLnNldFRvKCh0aGlzLmdhbWUud2lkdGggLyAyKSAvIHRoaXMud2lkdGgpO1xuXG4gICAgLy8gUGh5c2ljc1xuICAgIHRoaXMuZ2FtZS5waHlzaWNzLmFyY2FkZS5lbmFibGVCb2R5KHRoaXMpO1xuICAgIHRoaXMuYm9keS5hbGxvd0dyYXZpdHkgPSBmYWxzZTtcbiAgICB0aGlzLmJvZHkuaW1tb3ZhYmxlID0gdHJ1ZTtcbiAgfTtcblxuICAvLyBFeHRlbmQgZnJvbSBTcHJpdGVcbiAgQmFzZS5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFBoYXNlci5TcHJpdGUucHJvdG90eXBlKTtcbiAgQmFzZS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBCYXNlO1xuXG4gIC8vIEFkZCBtZXRob2RzXG4gIF8uZXh0ZW5kKEJhc2UucHJvdG90eXBlLCB7XG4gICAgdXBkYXRlOiBmdW5jdGlvbigpIHtcbiAgICB9XG4gIH0pO1xuXG4gIC8vIEV4cG9ydFxuICBtb2R1bGUuZXhwb3J0cyA9IEJhc2U7XG59KSgpO1xuIiwiLyogZ2xvYmFsIF86ZmFsc2UsIFBoYXNlcjpmYWxzZSAqL1xuXG4vKipcbiAqIFByZWZhYiAob2JqZWN0cykgYm9vc3QgZm9yIGJvb3N0L2RpbGxcbiAqL1xuXG4oZnVuY3Rpb24oKSB7XG4gIFwidXNlIHN0cmljdFwiO1xuXG4gIC8vIENvbnN0cnVjdG9yIGZvciBCb29zdFxuICB2YXIgQm9vc3QgPSBmdW5jdGlvbihnYW1lLCB4LCB5KSB7XG4gICAgLy8gQ2FsbCBkZWZhdWx0IHNwcml0ZVxuICAgIFBoYXNlci5TcHJpdGUuY2FsbCh0aGlzLCBnYW1lLCB4LCB5LCBcImdhbWUtc3ByaXRlc1wiLCBcImRpbGwucG5nXCIpO1xuXG4gICAgLy8gU2l6ZVxuICAgIHRoaXMuYW5jaG9yLnNldFRvKDAuNSwgMC41KTtcbiAgICB0aGlzLnNjYWxlLnNldFRvKCh0aGlzLmdhbWUud2lkdGggLyA5KSAvIHRoaXMud2lkdGgpO1xuXG4gICAgLy8gUGh5c2ljc1xuICAgIHRoaXMuZ2FtZS5waHlzaWNzLmFyY2FkZS5lbmFibGVCb2R5KHRoaXMpO1xuICAgIHRoaXMuYm9keS5hbGxvd0dyYXZpdHkgPSBmYWxzZTtcbiAgICB0aGlzLmJvZHkuaW1tb3ZhYmxlID0gdHJ1ZTtcbiAgfTtcblxuICAvLyBFeHRlbmQgZnJvbSBTcHJpdGVcbiAgQm9vc3QucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQaGFzZXIuU3ByaXRlLnByb3RvdHlwZSk7XG4gIEJvb3N0LnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEJvb3N0O1xuXG4gIC8vIEFkZCBtZXRob2RzXG4gIF8uZXh0ZW5kKEJvb3N0LnByb3RvdHlwZSwge1xuICAgIHVwZGF0ZTogZnVuY3Rpb24oKSB7XG5cbiAgICB9XG4gIH0pO1xuXG4gIC8vIEV4cG9ydFxuICBtb2R1bGUuZXhwb3J0cyA9IEJvb3N0O1xufSkoKTtcbiIsIi8qIGdsb2JhbCBfOmZhbHNlLCBQaGFzZXI6ZmFsc2UgKi9cblxuLyoqXG4gKiBQcmVmYWIgZm9yIEJvdHVsaXNtLCB0aGUgYmFkIGR1ZGVzXG4gKi9cblxuKGZ1bmN0aW9uKCkge1xuICBcInVzZSBzdHJpY3RcIjtcblxuICAvLyBDb25zdHJ1Y3RvclxuICB2YXIgQm90dWxpc20gPSBmdW5jdGlvbihnYW1lLCB4LCB5KSB7XG4gICAgLy8gQ2FsbCBkZWZhdWx0IHNwcml0ZVxuICAgIFBoYXNlci5TcHJpdGUuY2FsbCh0aGlzLCBnYW1lLCB4LCB5LCBcImdhbWUtc3ByaXRlc1wiLCBcImJvdGNoeS5wbmdcIik7XG5cbiAgICAvLyBTaXplXG4gICAgdGhpcy5hbmNob3Iuc2V0VG8oMC41LCAwLjUpO1xuICAgIHRoaXMuc2NhbGUuc2V0VG8oKHRoaXMuZ2FtZS53aWR0aCAvIDEwKSAvIHRoaXMud2lkdGgpO1xuXG4gICAgLy8gQ29uZmlndXJlXG4gICAgdGhpcy5ob3ZlciA9IHRydWU7XG4gICAgdGhpcy5zZXRIb3ZlclNwZWVkKDEwMCk7XG4gICAgdGhpcy5ob3ZlclJhbmdlID0gMTAwO1xuXG4gICAgLy8gUGh5c2ljc1xuICAgIHRoaXMuZ2FtZS5waHlzaWNzLmFyY2FkZS5lbmFibGVCb2R5KHRoaXMpO1xuICAgIHRoaXMuYm9keS5hbGxvd0dyYXZpdHkgPSBmYWxzZTtcbiAgICB0aGlzLmJvZHkuaW1tb3ZhYmxlID0gdHJ1ZTtcblxuICAgIC8vIERldGVybWluZSBhbmNob3IgeCBib3VuZHNcbiAgICB0aGlzLnBhZGRpbmdYID0gMTA7XG4gICAgdGhpcy5yZXNldFBsYWNlbWVudCh4LCB5KTtcbiAgfTtcblxuICAvLyBFeHRlbmQgZnJvbSBTcHJpdGVcbiAgQm90dWxpc20ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQaGFzZXIuU3ByaXRlLnByb3RvdHlwZSk7XG4gIEJvdHVsaXNtLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEJvdHVsaXNtO1xuXG4gIC8vIEFkZCBtZXRob2RzXG4gIF8uZXh0ZW5kKEJvdHVsaXNtLnByb3RvdHlwZSwge1xuICAgIHVwZGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAvLyBEbyBob3ZlclxuICAgICAgaWYgKHRoaXMuaG92ZXIpIHtcbiAgICAgICAgdGhpcy5ib2R5LnZlbG9jaXR5LnggPSB0aGlzLmJvZHkudmVsb2NpdHkueCB8fCB0aGlzLmhvdmVyU3BlZWQ7XG4gICAgICAgIHRoaXMuYm9keS52ZWxvY2l0eS54ID0gKHRoaXMueCA8PSB0aGlzLm1pblgpID8gdGhpcy5ob3ZlclNwZWVkIDpcbiAgICAgICAgICAodGhpcy54ID49IHRoaXMubWF4WCkgPyAtdGhpcy5ob3ZlclNwZWVkIDogdGhpcy5ib2R5LnZlbG9jaXR5Lng7XG4gICAgICB9XG4gICAgfSxcblxuICAgIC8vIFNldCBob3ZlciBzcGVlZC4gIEFkZCBhIGJpdCBvZiB2YXJpYW5jZVxuICAgIHNldEhvdmVyU3BlZWQ6IGZ1bmN0aW9uKHNwZWVkKSB7XG4gICAgICB0aGlzLmhvdmVyU3BlZWQgPSBzcGVlZCArIHRoaXMuZ2FtZS5ybmQuaW50ZWdlckluUmFuZ2UoLTI1LCAyNSk7XG4gICAgfSxcblxuICAgIC8vIEdldCBhbmNob3IgYm91bmRzLiAgVGhpcyBpcyByZWxhdGl2ZSB0byB3aGVyZSB0aGUgcGxhdGZvcm0gaXNcbiAgICBnZXRBbmNob3JCb3VuZHNYOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMubWluWCA9IE1hdGgubWF4KHRoaXMueCAtIHRoaXMuaG92ZXJSYW5nZSwgdGhpcy5wYWRkaW5nWCArICh0aGlzLndpZHRoIC8gMikpO1xuICAgICAgdGhpcy5tYXhYID0gTWF0aC5taW4odGhpcy54ICsgdGhpcy5ob3ZlclJhbmdlLCB0aGlzLmdhbWUud2lkdGggLSAodGhpcy5wYWRkaW5nWCArICh0aGlzLndpZHRoIC8gMikpKTtcbiAgICAgIHJldHVybiBbdGhpcy5taW5YLCB0aGlzLm1heFhdO1xuICAgIH0sXG5cbiAgICAvLyBSZXNldCB0aGluZ3NcbiAgICByZXNldFBsYWNlbWVudDogZnVuY3Rpb24oeCwgeSkge1xuICAgICAgdGhpcy5yZXNldCh4LCB5KTtcbiAgICAgIHRoaXMuYm9keS52ZWxvY2l0eS54ID0gMDtcbiAgICAgIHRoaXMuZ2V0QW5jaG9yQm91bmRzWCgpO1xuICAgIH1cbiAgfSk7XG5cbiAgLy8gRXhwb3J0XG4gIG1vZHVsZS5leHBvcnRzID0gQm90dWxpc207XG59KSgpO1xuIiwiLyogZ2xvYmFsIF86ZmFsc2UsIFBoYXNlcjpmYWxzZSAqL1xuXG4vKipcbiAqIFByZWZhYiBDb2luIHR5cGUgaXRlbVxuICovXG5cbihmdW5jdGlvbigpIHtcbiAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgLy8gQ29uc3RydWN0b3IgZm9yIGNvaW5cbiAgdmFyIENvaW4gPSBmdW5jdGlvbihnYW1lLCB4LCB5KSB7XG4gICAgLy8gQ2FsbCBkZWZhdWx0IHNwcml0ZVxuICAgIFBoYXNlci5TcHJpdGUuY2FsbCh0aGlzLCBnYW1lLCB4LCB5LCBcImdhbWUtc3ByaXRlc1wiLCBcIm1hZ2ljZGlsbC5wbmdcIik7XG5cbiAgICAvLyBDb25maWd1cmVcbiAgICB0aGlzLmFuY2hvci5zZXRUbygwLjUsIDAuNSk7XG4gICAgdGhpcy5zY2FsZS5zZXRUbygodGhpcy5nYW1lLndpZHRoIC8gMjApIC8gdGhpcy53aWR0aCk7XG5cbiAgICAvLyBQaHlzaWNzXG4gICAgdGhpcy5nYW1lLnBoeXNpY3MuYXJjYWRlLmVuYWJsZUJvZHkodGhpcyk7XG4gICAgdGhpcy5ib2R5LmFsbG93R3Jhdml0eSA9IGZhbHNlO1xuICAgIHRoaXMuYm9keS5pbW1vdmFibGUgPSB0cnVlO1xuICB9O1xuXG4gIC8vIEV4dGVuZCBmcm9tIFNwcml0ZVxuICBDb2luLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUGhhc2VyLlNwcml0ZS5wcm90b3R5cGUpO1xuICBDb2luLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IENvaW47XG5cbiAgLy8gQWRkIG1ldGhvZHNcbiAgXy5leHRlbmQoQ29pbi5wcm90b3R5cGUsIHtcbiAgICB1cGRhdGU6IGZ1bmN0aW9uKCkge1xuXG4gICAgfVxuICB9KTtcblxuICAvLyBFeHBvcnRcbiAgbW9kdWxlLmV4cG9ydHMgPSBDb2luO1xufSkoKTtcbiIsIi8qIGdsb2JhbCBfOmZhbHNlLCBQaGFzZXI6ZmFsc2UgKi9cblxuLyoqXG4gKiBQcmVmYWIgSGVyby9jaGFyYWN0ZXJcbiAqL1xuXG4oZnVuY3Rpb24oKSB7XG4gIFwidXNlIHN0cmljdFwiO1xuXG4gIC8vIENvbnN0cnVjdG9yXG4gIHZhciBIZXJvID0gZnVuY3Rpb24oZ2FtZSwgeCwgeSkge1xuICAgIC8vIENhbGwgZGVmYXVsdCBzcHJpdGVcbiAgICBQaGFzZXIuU3ByaXRlLmNhbGwodGhpcywgZ2FtZSwgeCwgeSwgXCJwaWNrbGUtc3ByaXRlc1wiLCBcInBpY2tsZS1kZWZhdWx0LnBuZ1wiKTtcblxuICAgIC8vIENvbmZpZ3VyZVxuICAgIHRoaXMuYW5jaG9yLnNldFRvKDAuNSk7XG4gICAgdGhpcy5zY2FsZS5zZXRUbygodGhpcy5nYW1lLndpZHRoIC8gMjUpIC8gdGhpcy53aWR0aCk7XG4gICAgdGhpcy5nYW1lLnBoeXNpY3MuYXJjYWRlLmVuYWJsZUJvZHkodGhpcyk7XG5cbiAgICAvLyBUcmFjayB3aGVyZSB0aGUgaGVybyBzdGFydGVkIGFuZCBob3cgbXVjaCB0aGUgZGlzdGFuY2VcbiAgICAvLyBoYXMgY2hhbmdlZCBmcm9tIHRoYXQgcG9pbnRcbiAgICB0aGlzLnlPcmlnID0gdGhpcy55O1xuICAgIHRoaXMueUNoYW5nZSA9IDA7XG5cbiAgICAvLyBBbmltYXRpb25zXG4gICAgdmFyIHVwRnJhbWVzID0gUGhhc2VyLkFuaW1hdGlvbi5nZW5lcmF0ZUZyYW1lTmFtZXMoXCJwaWNrbGUtanVtcC1cIiwgMSwgNCwgXCIucG5nXCIsIDIpO1xuICAgIHZhciBkb3duRnJhbWVzID0gUGhhc2VyLkFuaW1hdGlvbi5nZW5lcmF0ZUZyYW1lTmFtZXMoXCJwaWNrbGUtanVtcC1cIiwgNCwgMSwgXCIucG5nXCIsIDIpO1xuICAgIHRoaXMuanVtcFVwID0gdGhpcy5hbmltYXRpb25zLmFkZChcImp1bXAtdXBcIiwgdXBGcmFtZXMpO1xuICAgIHRoaXMuSnVtcERvd24gPSB0aGlzLmFuaW1hdGlvbnMuYWRkKFwianVtcC1kb3duXCIsIGRvd25GcmFtZXMpO1xuICAgIHRoaXMuanVtcCA9IHRoaXMuYW5pbWF0aW9ucy5hZGQoXCJqdW1wXCIsIHVwRnJhbWVzLmNvbmNhdChkb3duRnJhbWVzKSk7XG4gIH07XG5cbiAgLy8gRXh0ZW5kIGZyb20gU3ByaXRlXG4gIEhlcm8ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQaGFzZXIuU3ByaXRlLnByb3RvdHlwZSk7XG4gIEhlcm8ucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gSGVybztcblxuICAvLyBBZGQgbWV0aG9kc1xuICBfLmV4dGVuZChIZXJvLnByb3RvdHlwZSwge1xuICAgIHVwZGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAvLyBUcmFjayB0aGUgbWF4aW11bSBhbW91bnQgdGhhdCB0aGUgaGVybyBoYXMgdHJhdmVsbGVkXG4gICAgICB0aGlzLnlDaGFuZ2UgPSBNYXRoLm1heCh0aGlzLnlDaGFuZ2UsIE1hdGguYWJzKHRoaXMueSAtIHRoaXMueU9yaWcpKTtcblxuICAgICAgLy8gV3JhcCBhcm91bmQgZWRnZXMgbGVmdC90aWdodCBlZGdlc1xuICAgICAgdGhpcy5nYW1lLndvcmxkLndyYXAodGhpcywgdGhpcy53aWR0aCAvIDIsIGZhbHNlLCB0cnVlLCBmYWxzZSk7XG5cbiAgICAgIC8vIFdoZW4gaGVhZGluZyBkb3duLCBhbmltYXRlIHRvIGRvd25cbiAgICAgIGlmICh0aGlzLmJvZHkudmVsb2NpdHkueSA+IDAgJiYgdGhpcy5nb2luZ1VwKSB7XG4gICAgICAgIHRoaXMub25GaXJlID0gZmFsc2U7XG4gICAgICAgIHRoaXMuZ29pbmdVcCA9IGZhbHNlO1xuICAgICAgICB0aGlzLmRvSnVtcERvd24oKTtcbiAgICAgIH1cblxuICAgICAgLy8gRWxzZSB3aGVuIGhlYWRpbmcgdXAsIG5vdGVcbiAgICAgIGVsc2UgaWYgKHRoaXMuYm9keS52ZWxvY2l0eS55IDwgMCAmJiAhdGhpcy5nb2luZ1VwKSB7XG4gICAgICAgIHRoaXMuZ29pbmdVcCA9IHRydWU7XG4gICAgICAgIHRoaXMuZG9KdW1wVXAoKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLy8gUmVzZXQgcGxhY2VtZW50IGN1c3RvbVxuICAgIHJlc2V0UGxhY2VtZW50OiBmdW5jdGlvbih4LCB5KSB7XG4gICAgICB0aGlzLnJlc2V0KHgsIHkpO1xuICAgICAgdGhpcy55T3JpZyA9IHRoaXMueTtcbiAgICAgIHRoaXMueUNoYW5nZSA9IDA7XG4gICAgfSxcblxuICAgIC8vIEp1bXAgdXBcbiAgICBkb0p1bXBVcDogZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoIXRoaXMub25GaXJlKSB7XG4gICAgICAgIHRoaXMuYW5pbWF0aW9ucy5wbGF5KFwianVtcC11cFwiLCAxNSwgZmFsc2UpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICAvLyBKdW1wIGRvd25cbiAgICBkb0p1bXBEb3duOiBmdW5jdGlvbigpIHtcbiAgICAgIGlmICghdGhpcy5vbkZpcmUpIHtcbiAgICAgICAgdGhpcy5hbmltYXRpb25zLnBsYXkoXCJqdW1wLWRvd25cIiwgMTUsIGZhbHNlKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLy8gT24gZmlyZVxuICAgIHNldE9uRmlyZTogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLm9uRmlyZSA9IHRydWU7XG4gICAgICB0aGlzLmxvYWRUZXh0dXJlKFwicGlja2xlLXNwcml0ZXNcIiwgXCJwaWNrbGUtcm9ja2V0LnBuZ1wiKTtcbiAgICB9LFxuXG4gICAgLy8gT2ZmIGZpcmVcbiAgICBwdXRPdXRGaXJlOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMub25GaXJlID0gZmFsc2U7XG4gICAgfVxuICB9KTtcblxuICAvLyBFeHBvcnRcbiAgbW9kdWxlLmV4cG9ydHMgPSBIZXJvO1xufSkoKTtcbiIsIi8qIGdsb2JhbCBfOmZhbHNlLCBQaGFzZXI6ZmFsc2UgKi9cblxuLyoqXG4gKiBQcmVmYWIgKG9iamVjdHMpIGJvb3N0IGZvciBwZXBwZXJcbiAqL1xuXG4oZnVuY3Rpb24oKSB7XG4gIFwidXNlIHN0cmljdFwiO1xuXG4gIC8vIENvbnN0cnVjdG9yIGZvciBCb29zdFxuICB2YXIgUGVwcGVyID0gZnVuY3Rpb24oZ2FtZSwgeCwgeSkge1xuICAgIC8vIENhbGwgZGVmYXVsdCBzcHJpdGVcbiAgICBQaGFzZXIuU3ByaXRlLmNhbGwodGhpcywgZ2FtZSwgeCwgeSwgXCJnYW1lLXNwcml0ZXNcIiwgXCJnaG9zdC1wZXBwZXIucG5nXCIpO1xuXG4gICAgLy8gU2l6ZVxuICAgIHRoaXMuYW5jaG9yLnNldFRvKDAuNSwgMC41KTtcbiAgICB0aGlzLnNjYWxlLnNldFRvKCh0aGlzLmdhbWUud2lkdGggLyAxOCkgLyB0aGlzLndpZHRoKTtcblxuICAgIC8vIFBoeXNpY3NcbiAgICB0aGlzLmdhbWUucGh5c2ljcy5hcmNhZGUuZW5hYmxlQm9keSh0aGlzKTtcbiAgICB0aGlzLmJvZHkuYWxsb3dHcmF2aXR5ID0gZmFsc2U7XG4gICAgdGhpcy5ib2R5LmltbW92YWJsZSA9IHRydWU7XG4gIH07XG5cbiAgLy8gRXh0ZW5kIGZyb20gU3ByaXRlXG4gIFBlcHBlci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFBoYXNlci5TcHJpdGUucHJvdG90eXBlKTtcbiAgUGVwcGVyLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFBlcHBlcjtcblxuICAvLyBBZGQgbWV0aG9kc1xuICBfLmV4dGVuZChQZXBwZXIucHJvdG90eXBlLCB7XG4gICAgdXBkYXRlOiBmdW5jdGlvbigpIHtcblxuICAgIH1cbiAgfSk7XG5cbiAgLy8gRXhwb3J0XG4gIG1vZHVsZS5leHBvcnRzID0gUGVwcGVyO1xufSkoKTtcbiIsIi8qIGdsb2JhbCBfOmZhbHNlLCBQaGFzZXI6ZmFsc2UgKi9cblxuLyoqXG4gKiBQcmVmYWIgcGxhdGZvcm1cbiAqL1xuXG4oZnVuY3Rpb24oKSB7XG4gIFwidXNlIHN0cmljdFwiO1xuXG4gIC8vIENvbnN0cnVjdG9yXG4gIHZhciBQbGF0Zm9ybSA9IGZ1bmN0aW9uKGdhbWUsIHgsIHkpIHtcbiAgICAvLyBDYWxsIGRlZmF1bHQgc3ByaXRlXG4gICAgUGhhc2VyLlNwcml0ZS5jYWxsKHRoaXMsIGdhbWUsIHgsIHksIFwiZ2FtZS1zcHJpdGVzXCIsIFwiZGlsbHliZWFuLnBuZ1wiKTtcblxuICAgIC8vIENvbmZpZ3VyZVxuICAgIHRoaXMuYW5jaG9yLnNldFRvKDAuNSwgMC41KTtcbiAgICB0aGlzLnNjYWxlLnNldFRvKCh0aGlzLmdhbWUud2lkdGggLyA1KSAvIHRoaXMud2lkdGgpO1xuICAgIHRoaXMuaG92ZXIgPSBmYWxzZTtcbiAgICB0aGlzLnNldEhvdmVyU3BlZWQoMTAwKTtcblxuICAgIC8vIFBoeXNpY3NcbiAgICB0aGlzLmdhbWUucGh5c2ljcy5hcmNhZGUuZW5hYmxlQm9keSh0aGlzKTtcbiAgICB0aGlzLmJvZHkuYWxsb3dHcmF2aXR5ID0gZmFsc2U7XG4gICAgdGhpcy5ib2R5LmltbW92YWJsZSA9IHRydWU7XG5cbiAgICAvLyBPbmx5IGFsbG93IGZvciBjb2xsaXNzaW9uIHVwXG4gICAgdGhpcy5ib2R5LmNoZWNrQ29sbGlzaW9uLmRvd24gPSBmYWxzZTtcbiAgICB0aGlzLmJvZHkuY2hlY2tDb2xsaXNpb24ubGVmdCA9IGZhbHNlO1xuICAgIHRoaXMuYm9keS5jaGVja0NvbGxpc2lvbi5yaWdodCA9IGZhbHNlO1xuXG4gICAgLy8gRGV0ZXJtaW5lIGFuY2hvciB4IGJvdW5kc1xuICAgIHRoaXMucGFkZGluZ1ggPSAxMDtcbiAgICB0aGlzLmdldEFuY2hvckJvdW5kc1goKTtcbiAgfTtcblxuICAvLyBFeHRlbmQgZnJvbSBTcHJpdGVcbiAgUGxhdGZvcm0ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQaGFzZXIuU3ByaXRlLnByb3RvdHlwZSk7XG4gIFBsYXRmb3JtLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFBsYXRmb3JtO1xuXG4gIC8vIEFkZCBtZXRob2RzXG4gIF8uZXh0ZW5kKFBsYXRmb3JtLnByb3RvdHlwZSwge1xuICAgIHVwZGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICBpZiAodGhpcy5ob3Zlcikge1xuICAgICAgICB0aGlzLmJvZHkudmVsb2NpdHkueCA9IHRoaXMuYm9keS52ZWxvY2l0eS54IHx8IHRoaXMuaG92ZXJTcGVlZDtcbiAgICAgICAgdGhpcy5ib2R5LnZlbG9jaXR5LnggPSAodGhpcy54IDw9IHRoaXMubWluWCkgPyB0aGlzLmhvdmVyU3BlZWQgOlxuICAgICAgICAgICh0aGlzLnggPj0gdGhpcy5tYXhYKSA/IC10aGlzLmhvdmVyU3BlZWQgOiB0aGlzLmJvZHkudmVsb2NpdHkueDtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLy8gU2V0IGhvdmVyIHNwZWVkLiAgQWRkIGEgYml0IG9mIHZhcmlhbmNlXG4gICAgc2V0SG92ZXJTcGVlZDogZnVuY3Rpb24oc3BlZWQpIHtcbiAgICAgIHRoaXMuaG92ZXJTcGVlZCA9IHNwZWVkICsgdGhpcy5nYW1lLnJuZC5pbnRlZ2VySW5SYW5nZSgtNTAsIDUwKTtcbiAgICB9LFxuXG4gICAgLy8gR2V0IGFuY2hvciBib3VuZHNcbiAgICBnZXRBbmNob3JCb3VuZHNYOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMubWluWCA9IHRoaXMucGFkZGluZ1ggKyAodGhpcy53aWR0aCAvIDIpO1xuICAgICAgdGhpcy5tYXhYID0gdGhpcy5nYW1lLndpZHRoIC0gKHRoaXMucGFkZGluZ1ggKyAodGhpcy53aWR0aCAvIDIpKTtcbiAgICAgIHJldHVybiBbdGhpcy5taW5YLCB0aGlzLm1heFhdO1xuICAgIH0sXG5cbiAgICAvLyBSZXNldCB0aGluZ3NcbiAgICByZXNldFNldHRpbmdzOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMucmVzZXQoMCwgMCk7XG4gICAgICB0aGlzLmJvZHkudmVsb2NpdHkueCA9IDA7XG4gICAgICB0aGlzLmhvdmVyID0gZmFsc2U7XG4gICAgICB0aGlzLmdldEFuY2hvckJvdW5kc1goKTtcbiAgICB9XG4gIH0pO1xuXG4gIC8vIEV4cG9ydFxuICBtb2R1bGUuZXhwb3J0cyA9IFBsYXRmb3JtO1xufSkoKTtcbiIsIi8qIGdsb2JhbCBfOmZhbHNlLCBQaGFzZXI6ZmFsc2UgKi9cblxuLyoqXG4gKiBHYW1lb3ZlciBzdGF0ZVxuICovXG5cbihmdW5jdGlvbigpIHtcbiAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgLy8gQ29uc3RydWN0b3JcbiAgdmFyIEdhbWVvdmVyID0gZnVuY3Rpb24oKSB7XG4gICAgUGhhc2VyLlN0YXRlLmNhbGwodGhpcyk7XG5cbiAgICAvLyBDb25maWd1cmVcbiAgICB0aGlzLnBhZGRpbmcgPSAxMDtcbiAgfTtcblxuICAvLyBFeHRlbmQgZnJvbSBTdGF0ZVxuICBHYW1lb3Zlci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFBoYXNlci5TdGF0ZS5wcm90b3R5cGUpO1xuICBHYW1lb3Zlci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBHYW1lb3ZlcjtcblxuICAvLyBBZGQgbWV0aG9kc1xuICBfLmV4dGVuZChHYW1lb3Zlci5wcm90b3R5cGUsIFBoYXNlci5TdGF0ZS5wcm90b3R5cGUsIHtcbiAgICAvLyBQcmVsb2FkXG4gICAgcHJlbG9hZDogZnVuY3Rpb24oKSB7XG4gICAgICAvLyBMb2FkIHVwIGdhbWUgaW1hZ2VzXG4gICAgICB0aGlzLmdhbWUubG9hZC5hdGxhcyhcImdhbWVvdmVyLXNwcml0ZXNcIiwgXCJhc3NldHMvZ2FtZW92ZXItc3ByaXRlcy5wbmdcIiwgXCJhc3NldHMvZ2FtZW92ZXItc3ByaXRlcy5qc29uXCIpO1xuICAgIH0sXG5cbiAgICAvLyBDcmVhdGVcbiAgICBjcmVhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgLy8gU2V0IGJhY2tncm91bmRcbiAgICAgIHRoaXMuZ2FtZS5zdGFnZS5iYWNrZ3JvdW5kQ29sb3IgPSBcIiM4Y2M2M2ZcIjtcblxuICAgICAgLy8gUGxhY2UgdGl0bGVcbiAgICAgIHRoaXMudGl0bGVJbWFnZSA9IHRoaXMuZ2FtZS5hZGQuc3ByaXRlKHRoaXMuZ2FtZS53aWR0aCAvIDIsIHRoaXMucGFkZGluZyAqIDMsIFwiZ2FtZW92ZXItc3ByaXRlc1wiLCBcImdhbWVvdmVyLnBuZ1wiKTtcbiAgICAgIHRoaXMudGl0bGVJbWFnZS5hbmNob3Iuc2V0VG8oMC41LCAwKTtcbiAgICAgIHRoaXMudGl0bGVJbWFnZS5zY2FsZS5zZXRUbygodGhpcy5nYW1lLndpZHRoIC0gKHRoaXMucGFkZGluZyAqIDgpKSAvIHRoaXMudGl0bGVJbWFnZS53aWR0aCk7XG4gICAgICB0aGlzLmdhbWUuYWRkLmV4aXN0aW5nKHRoaXMudGl0bGVJbWFnZSk7XG5cbiAgICAgIC8vIEhpZ2hzY29yZSBsaXN0LiAgQ2FuJ3Qgc2VlbSB0byBmaW5kIGEgd2F5IHRvIHBhc3MgdGhlIHNjb3JlXG4gICAgICAvLyB2aWEgYSBzdGF0ZSBjaGFuZ2UuXG4gICAgICB0aGlzLnNjb3JlID0gdGhpcy5nYW1lLnBpY2tsZS5zY29yZTtcblxuICAgICAgLy8gU2hvdyBzY29yZVxuICAgICAgdGhpcy5zaG93U2NvcmUoKTtcblxuICAgICAgLy8gU2hvdyBpbnB1dCBpZiBuZXcgaGlnaHNjb3JlLCBvdGhlcndpc2Ugc2hvdyBsaXN0XG4gICAgICBpZiAodGhpcy5nYW1lLnBpY2tsZS5pc0hpZ2hzY29yZSh0aGlzLnNjb3JlKSkge1xuICAgICAgICB0aGlzLmhpZ2hzY29yZUlucHV0KCk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgdGhpcy5oaWdoc2NvcmVMaXN0KCk7XG4gICAgICB9XG5cbiAgICAgIC8vIFBsYWNlIHJlLXBsYXlcbiAgICAgIHRoaXMucmVwbGF5SW1hZ2UgPSB0aGlzLmdhbWUuYWRkLnNwcml0ZSh0aGlzLmdhbWUud2lkdGggLSB0aGlzLnBhZGRpbmcgKiAyLFxuICAgICAgICB0aGlzLmdhbWUuaGVpZ2h0IC0gdGhpcy5wYWRkaW5nICogMiwgXCJnYW1lb3Zlci1zcHJpdGVzXCIsIFwidGl0bGUtcGxheS5wbmdcIik7XG4gICAgICB0aGlzLnJlcGxheUltYWdlLmFuY2hvci5zZXRUbygxLCAxKTtcbiAgICAgIHRoaXMucmVwbGF5SW1hZ2Uuc2NhbGUuc2V0VG8oKHRoaXMuZ2FtZS53aWR0aCAqIDAuMjUpIC8gdGhpcy5yZXBsYXlJbWFnZS53aWR0aCk7XG4gICAgICB0aGlzLmdhbWUuYWRkLmV4aXN0aW5nKHRoaXMucmVwbGF5SW1hZ2UpO1xuXG4gICAgICAvLyBBZGQgaG92ZXIgZm9yIG1vdXNlXG4gICAgICB0aGlzLnJlcGxheUltYWdlLmlucHV0RW5hYmxlZCA9IHRydWU7XG4gICAgICB0aGlzLnJlcGxheUltYWdlLmV2ZW50cy5vbklucHV0T3Zlci5hZGQoZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMucmVwbGF5SW1hZ2Uub3JpZ2luYWxUaW50ID0gdGhpcy5yZXBsYXlJbWFnZS50aW50O1xuICAgICAgICB0aGlzLnJlcGxheUltYWdlLnRpbnQgPSAwLjUgKiAweEZGRkZGRjtcbiAgICAgIH0sIHRoaXMpO1xuXG4gICAgICB0aGlzLnJlcGxheUltYWdlLmV2ZW50cy5vbklucHV0T3V0LmFkZChmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5yZXBsYXlJbWFnZS50aW50ID0gdGhpcy5yZXBsYXlJbWFnZS5vcmlnaW5hbFRpbnQ7XG4gICAgICB9LCB0aGlzKTtcblxuICAgICAgLy8gQWRkIGludGVyYWN0aW9ucyBmb3Igc3RhcnRpbmdcbiAgICAgIHRoaXMucmVwbGF5SW1hZ2UuZXZlbnRzLm9uSW5wdXREb3duLmFkZCh0aGlzLnJlcGxheSwgdGhpcyk7XG5cbiAgICAgIC8vIElucHV0XG4gICAgICB0aGlzLmxlZnRCdXR0b24gPSB0aGlzLmdhbWUuaW5wdXQua2V5Ym9hcmQuYWRkS2V5KFBoYXNlci5LZXlib2FyZC5MRUZUKTtcbiAgICAgIHRoaXMucmlnaHRCdXR0b24gPSB0aGlzLmdhbWUuaW5wdXQua2V5Ym9hcmQuYWRkS2V5KFBoYXNlci5LZXlib2FyZC5SSUdIVCk7XG4gICAgICB0aGlzLnVwQnV0dG9uID0gdGhpcy5nYW1lLmlucHV0LmtleWJvYXJkLmFkZEtleShQaGFzZXIuS2V5Ym9hcmQuVVApO1xuICAgICAgdGhpcy5kb3duQnV0dG9uID0gdGhpcy5nYW1lLmlucHV0LmtleWJvYXJkLmFkZEtleShQaGFzZXIuS2V5Ym9hcmQuRE9XTik7XG4gICAgICB0aGlzLmFjdGlvbkJ1dHRvbiA9IHRoaXMuZ2FtZS5pbnB1dC5rZXlib2FyZC5hZGRLZXkoUGhhc2VyLktleWJvYXJkLlNQQUNFQkFSKTtcblxuICAgICAgdGhpcy5sZWZ0QnV0dG9uLm9uRG93bi5hZGQoZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICh0aGlzLmhJbnB1dCkge1xuICAgICAgICAgIHRoaXMubW92ZUN1cnNvcigtMSk7XG4gICAgICAgIH1cbiAgICAgIH0sIHRoaXMpO1xuXG4gICAgICB0aGlzLnJpZ2h0QnV0dG9uLm9uRG93bi5hZGQoZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICh0aGlzLmhJbnB1dCkge1xuICAgICAgICAgIHRoaXMubW92ZUN1cnNvcigxKTtcbiAgICAgICAgfVxuICAgICAgfSwgdGhpcyk7XG5cbiAgICAgIHRoaXMudXBCdXR0b24ub25Eb3duLmFkZChmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHRoaXMuaElucHV0KSB7XG4gICAgICAgICAgdGhpcy5tb3ZlTGV0dGVyKDEpO1xuICAgICAgICB9XG4gICAgICB9LCB0aGlzKTtcblxuICAgICAgdGhpcy5kb3duQnV0dG9uLm9uRG93bi5hZGQoZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICh0aGlzLmhJbnB1dCkge1xuICAgICAgICAgIHRoaXMubW92ZUxldHRlcigtMSk7XG4gICAgICAgIH1cbiAgICAgIH0sIHRoaXMpO1xuXG4gICAgICB0aGlzLmFjdGlvbkJ1dHRvbi5vbkRvd24uYWRkKGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgc2F2ZWQ7XG5cbiAgICAgICAgaWYgKHRoaXMuaElucHV0KSB7XG4gICAgICAgICAgc2F2ZWQgPSB0aGlzLnNhdmVIaWdoc2NvcmUoKTtcbiAgICAgICAgICBpZiAoc2F2ZWQpIHtcbiAgICAgICAgICAgIHRoaXMuaGlnaHNjb3JlTGlzdCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICB0aGlzLnJlcGxheSgpO1xuICAgICAgICB9XG4gICAgICB9LCB0aGlzKTtcbiAgICB9LFxuXG4gICAgLy8gVXBkYXRlXG4gICAgdXBkYXRlOiBmdW5jdGlvbigpIHtcbiAgICB9LFxuXG4gICAgLy8gU2h1dGRvd24sIGNsZWFuIHVwIG9uIHN0YXRlIGNoYW5nZVxuICAgIHNodXRkb3duOiBmdW5jdGlvbigpIHtcbiAgICAgIFtcInRpdGxlVGV4dFwiLCBcInJlcGxheVRleHRcIl0uZm9yRWFjaChfLmJpbmQoZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICBpZiAodGhpc1tpdGVtXSAmJiB0aGlzW2l0ZW1dLmRlc3Ryb3kpIHtcbiAgICAgICAgICB0aGlzW2l0ZW1dLmRlc3Ryb3koKTtcbiAgICAgICAgICB0aGlzW2l0ZW1dID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgfSwgdGhpcykpO1xuICAgIH0sXG5cbiAgICAvLyBIYW5kbGUgcmVwbGF5XG4gICAgcmVwbGF5OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuZ2FtZS5zdGF0ZS5zdGFydChcIm1lbnVcIik7XG4gICAgfSxcblxuICAgIC8vIFNob3cgaGlnaHNjb3JlXG4gICAgc2hvd1Njb3JlOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2NvcmVHcm91cCA9IHRoaXMuZ2FtZS5hZGQuZ3JvdXAoKTtcblxuICAgICAgLy8gUGxhY2UgbGFiZWxcbiAgICAgIHRoaXMueW91clNjb3JlSW1hZ2UgPSB0aGlzLmdhbWUuYWRkLnNwcml0ZShcbiAgICAgICAgdGhpcy5nYW1lLndpZHRoIC8gMiArICh0aGlzLnBhZGRpbmcgKiAzKSxcbiAgICAgICAgdGhpcy50aXRsZUltYWdlLmhlaWdodCArICh0aGlzLnBhZGRpbmcgKiA3LjUpLCBcImdhbWVvdmVyLXNwcml0ZXNcIiwgXCJ5b3VyLXNjb3JlLnBuZ1wiKTtcbiAgICAgIHRoaXMueW91clNjb3JlSW1hZ2UuYW5jaG9yLnNldFRvKDEsIDApO1xuICAgICAgdGhpcy55b3VyU2NvcmVJbWFnZS5zY2FsZS5zZXRUbygoKHRoaXMuZ2FtZS53aWR0aCAvIDIpIC0gKHRoaXMucGFkZGluZyAqIDYpKSAvIHRoaXMueW91clNjb3JlSW1hZ2Uud2lkdGgpO1xuXG4gICAgICAvLyBTY29yZVxuICAgICAgdGhpcy5zY29yZVRleHQgPSBuZXcgUGhhc2VyLlRleHQoXG4gICAgICAgIHRoaXMuZ2FtZSxcbiAgICAgICAgdGhpcy5nYW1lLndpZHRoIC8gMiArICh0aGlzLnBhZGRpbmcgKiA1KSxcbiAgICAgICAgdGhpcy50aXRsZUltYWdlLmhlaWdodCArICh0aGlzLnBhZGRpbmcgKiA2KSxcbiAgICAgICAgdGhpcy5zY29yZS50b0xvY2FsZVN0cmluZygpLCB7XG4gICAgICAgICAgZm9udDogXCJib2xkIFwiICsgKHRoaXMuZ2FtZS53b3JsZC5oZWlnaHQgLyAxNSkgKyBcInB4IERvc2lzXCIsXG4gICAgICAgICAgZmlsbDogXCIjMzliNTRhXCIsXG4gICAgICAgICAgYWxpZ246IFwibGVmdFwiLFxuICAgICAgICB9KTtcbiAgICAgIHRoaXMuc2NvcmVUZXh0LmFuY2hvci5zZXRUbygwLCAwKTtcblxuICAgICAgLy8gRm9udCBsb2FkaW5nIHRoaW5nXG4gICAgICBfLmRlbGF5KF8uYmluZChmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5zY29yZUdyb3VwLmFkZCh0aGlzLnlvdXJTY29yZUltYWdlKTtcbiAgICAgICAgdGhpcy5zY29yZUdyb3VwLmFkZCh0aGlzLnNjb3JlVGV4dCk7XG4gICAgICB9LCB0aGlzKSwgMTAwMCk7XG4gICAgfSxcblxuICAgIC8vIE1ha2UgaGlnaGVzdCBzY29yZSBpbnB1dFxuICAgIGhpZ2hzY29yZUlucHV0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuaElucHV0ID0gdHJ1ZTtcbiAgICAgIHRoaXMuaElucHV0SW5kZXggPSAwO1xuICAgICAgdGhpcy5oSW5wdXRzID0gdGhpcy5nYW1lLmFkZC5ncm91cCgpO1xuICAgICAgdmFyIHkgPSB0aGlzLmdhbWUud29ybGQuaGVpZ2h0ICogMC43O1xuXG4gICAgICAvLyBGaXJzdCBpbnB1dFxuICAgICAgdmFyIG9uZSA9IG5ldyBQaGFzZXIuVGV4dChcbiAgICAgICAgdGhpcy5nYW1lLFxuICAgICAgICB0aGlzLmdhbWUud29ybGQud2lkdGggKiAwLjMzMzMzLFxuICAgICAgICB5LFxuICAgICAgICBcIkFcIiwge1xuICAgICAgICAgIGZvbnQ6IFwiYm9sZCBcIiArICh0aGlzLmdhbWUud29ybGQuaGVpZ2h0IC8gMTUpICsgXCJweCBEb3Npc1wiLFxuICAgICAgICAgIGZpbGw6IFwiI0ZGRkZGRlwiLFxuICAgICAgICAgIGFsaWduOiBcImNlbnRlclwiLFxuICAgICAgICB9KTtcbiAgICAgIG9uZS5hbmNob3Iuc2V0KDAuNSk7XG4gICAgICB0aGlzLmhJbnB1dHMuYWRkKG9uZSk7XG5cbiAgICAgIC8vIFNlY29uZCBpbnB1dFxuICAgICAgdmFyIHNlY29uZCA9IG5ldyBQaGFzZXIuVGV4dChcbiAgICAgICAgdGhpcy5nYW1lLFxuICAgICAgICB0aGlzLmdhbWUud29ybGQud2lkdGggKiAwLjUsXG4gICAgICAgIHksXG4gICAgICAgIFwiQVwiLCB7XG4gICAgICAgICAgZm9udDogXCJib2xkIFwiICsgKHRoaXMuZ2FtZS53b3JsZC5oZWlnaHQgLyAxNSkgKyBcInB4IERvc2lzXCIsXG4gICAgICAgICAgZmlsbDogXCIjRkZGRkZGXCIsXG4gICAgICAgICAgYWxpZ246IFwiY2VudGVyXCIsXG4gICAgICAgIH0pO1xuICAgICAgc2Vjb25kLmFuY2hvci5zZXQoMC41KTtcbiAgICAgIHRoaXMuaElucHV0cy5hZGQoc2Vjb25kKTtcblxuICAgICAgLy8gU2Vjb25kIGlucHV0XG4gICAgICB2YXIgdGhpcmQgPSBuZXcgUGhhc2VyLlRleHQoXG4gICAgICAgIHRoaXMuZ2FtZSxcbiAgICAgICAgdGhpcy5nYW1lLndvcmxkLndpZHRoICogMC42NjY2NixcbiAgICAgICAgeSxcbiAgICAgICAgXCJBXCIsIHtcbiAgICAgICAgICBmb250OiBcImJvbGQgXCIgKyAodGhpcy5nYW1lLndvcmxkLmhlaWdodCAvIDE1KSArIFwicHggRG9zaXNcIixcbiAgICAgICAgICBmaWxsOiBcIiNGRkZGRkZcIixcbiAgICAgICAgICBhbGlnbjogXCJjZW50ZXJcIixcbiAgICAgICAgfSk7XG4gICAgICB0aGlyZC5hbmNob3Iuc2V0KDAuNSk7XG4gICAgICB0aGlzLmhJbnB1dHMuYWRkKHRoaXJkKTtcblxuICAgICAgLy8gQ3Vyc29yXG4gICAgICB0aGlzLmhDdXJzb3IgPSB0aGlzLmdhbWUuYWRkLnRleHQoXG4gICAgICAgIG9uZS54LFxuICAgICAgICBvbmUueSAtICh0aGlzLmdhbWUud29ybGQuaGVpZ2h0IC8gMjApLFxuICAgICAgICBcIl9cIiwge1xuICAgICAgICAgIGZvbnQ6IFwiYm9sZCBcIiArICh0aGlzLmdhbWUud29ybGQuaGVpZ2h0IC8gNSkgKyBcInB4IEFyaWFsXCIsXG4gICAgICAgICAgZmlsbDogXCIjRkZGRkZGXCIsXG4gICAgICAgICAgYWxpZ246IFwiY2VudGVyXCIsXG4gICAgICAgIH0pO1xuICAgICAgdGhpcy5oQ3Vyc29yLmFuY2hvci5zZXQoMC41KTtcblxuICAgICAgLy8gSGFuZGxlIGluaXRhbCBjdXJzb3JcbiAgICAgIHRoaXMubW92ZUN1cnNvcigwKTtcbiAgICB9LFxuXG4gICAgLy8gTW92ZSBjdXJzb3JcbiAgICBtb3ZlQ3Vyc29yOiBmdW5jdGlvbihhbW91bnQpIHtcbiAgICAgIHZhciBuZXdJbmRleCA9IHRoaXMuaElucHV0SW5kZXggKyBhbW91bnQ7XG4gICAgICB0aGlzLmhJbnB1dEluZGV4ID0gKG5ld0luZGV4IDwgMCkgPyB0aGlzLmhJbnB1dHMubGVuZ3RoIC0gMSA6XG4gICAgICAgIChuZXdJbmRleCA+PSB0aGlzLmhJbnB1dHMubGVuZ3RoKSA/IDAgOiBuZXdJbmRleDtcbiAgICAgIHZhciBpID0gdGhpcy5oSW5wdXRzLmdldENoaWxkQXQodGhpcy5oSW5wdXRJbmRleCk7XG5cbiAgICAgIC8vIE1vdmUgY3Vyc29yXG4gICAgICB0aGlzLmhDdXJzb3IueCA9IGkueDtcbiAgICAgIHRoaXMuaElucHV0cy5mb3JFYWNoKGZ1bmN0aW9uKGlucHV0KSB7XG4gICAgICAgIGlucHV0LmZpbGwgPSBcIiNGRkZGRkZcIjtcbiAgICAgIH0pO1xuXG4gICAgICBpLmZpbGwgPSBcIiNGRkREQkJcIjtcblxuICAgICAgLy8gVE9ETzogSGlnaGxpZ2h0IGlucHV0LlxuICAgIH0sXG5cbiAgICAvLyBNb3ZlIGxldHRlclxuICAgIG1vdmVMZXR0ZXI6IGZ1bmN0aW9uKGFtb3VudCkge1xuICAgICAgdmFyIGkgPSB0aGlzLmhJbnB1dHMuZ2V0Q2hpbGRBdCh0aGlzLmhJbnB1dEluZGV4KTtcbiAgICAgIHZhciB0ID0gaS50ZXh0O1xuICAgICAgdmFyIG4gPSAodCA9PT0gXCJBXCIgJiYgYW1vdW50ID09PSAtMSkgPyBcIlpcIiA6XG4gICAgICAgICh0ID09PSBcIlpcIiAmJiBhbW91bnQgPT09IDEpID8gXCJBXCIgOlxuICAgICAgICBTdHJpbmcuZnJvbUNoYXJDb2RlKHQuY2hhckNvZGVBdCgwKSArIGFtb3VudCk7XG5cbiAgICAgIGkudGV4dCA9IG47XG4gICAgfSxcblxuICAgIC8vIFNhdmUgaGlnaHNjb3JlXG4gICAgc2F2ZUhpZ2hzY29yZTogZnVuY3Rpb24oKSB7XG4gICAgICAvLyBHZXQgbmFtZVxuICAgICAgdmFyIG5hbWUgPSBcIlwiO1xuICAgICAgdGhpcy5oSW5wdXRzLmZvckVhY2goZnVuY3Rpb24oaW5wdXQpIHtcbiAgICAgICAgbmFtZSA9IG5hbWUgKyBpbnB1dC50ZXh0O1xuICAgICAgfSk7XG5cbiAgICAgIC8vIERvbid0IGFsbG93IEFBQVxuICAgICAgaWYgKG5hbWUgPT09IFwiQUFBXCIpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuXG4gICAgICAvLyBTYXZlIGhpZ2hzY29yZVxuICAgICAgdGhpcy5nYW1lLnBpY2tsZS5zZXRIaWdoc2NvcmUodGhpcy5zY29yZSwgbmFtZSk7XG5cbiAgICAgIC8vIFJlbW92ZSBpbnB1dFxuICAgICAgdGhpcy5oSW5wdXQgPSBmYWxzZTtcbiAgICAgIHRoaXMuaElucHV0cy5kZXN0cm95KCk7XG4gICAgICB0aGlzLmhDdXJzb3IuZGVzdHJveSgpO1xuXG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9LFxuXG4gICAgLy8gSGlnaHNjb3JlIGxpc3RcbiAgICBoaWdoc2NvcmVMaXN0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuaGlnaHNjb3JlTGltaXQgPSAzO1xuICAgICAgdGhpcy5oaWdoc2NvcmVMaXN0R3JvdXAgPSB0aGlzLmdhbWUuYWRkLmdyb3VwKCk7XG4gICAgICB0aGlzLmdhbWUucGlja2xlLnNvcnRIaWdoc2NvcmVzKCk7XG4gICAgICB2YXIgZm9udFNpemUgPSB0aGlzLmdhbWUud29ybGQuaGVpZ2h0IC8gMTcuNTtcblxuICAgICAgaWYgKHRoaXMuZ2FtZS5waWNrbGUuaGlnaHNjb3Jlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgIF8uZWFjaCh0aGlzLmdhbWUucGlja2xlLmhpZ2hzY29yZXMucmV2ZXJzZSgpLnNsaWNlKDAsIDMpLCBfLmJpbmQoZnVuY3Rpb24oaCwgaSkge1xuICAgICAgICAgIC8vIE5hbWVcbiAgICAgICAgICB2YXIgbmFtZSA9IG5ldyBQaGFzZXIuVGV4dChcbiAgICAgICAgICAgIHRoaXMuZ2FtZSxcbiAgICAgICAgICAgIHRoaXMuZ2FtZS53aWR0aCAvIDIgKyAodGhpcy5wYWRkaW5nICogMyksXG4gICAgICAgICAgICAodGhpcy5nYW1lLmhlaWdodCAqIDAuNikgKyAoKGZvbnRTaXplICsgdGhpcy5wYWRkaW5nKSAqIGkpLFxuICAgICAgICAgICAgaC5uYW1lLCB7XG4gICAgICAgICAgICAgIGZvbnQ6IFwiYm9sZCBcIiArICh0aGlzLmdhbWUud29ybGQuaGVpZ2h0IC8gMTUpICsgXCJweCBEb3Npc1wiLFxuICAgICAgICAgICAgICBmaWxsOiBcIiNiOGY0YmNcIixcbiAgICAgICAgICAgICAgYWxpZ246IFwicmlnaHRcIixcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIG5hbWUuYW5jaG9yLnNldFRvKDEsIDApO1xuXG4gICAgICAgICAgLy8gU2NvcmVcbiAgICAgICAgICB2YXIgc2NvcmUgPSBuZXcgUGhhc2VyLlRleHQoXG4gICAgICAgICAgICB0aGlzLmdhbWUsXG4gICAgICAgICAgICB0aGlzLmdhbWUud2lkdGggLyAyICsgKHRoaXMucGFkZGluZyAqIDUpLFxuICAgICAgICAgICAgKHRoaXMuZ2FtZS5oZWlnaHQgKiAwLjYpICsgKChmb250U2l6ZSArIHRoaXMucGFkZGluZykgKiBpKSxcbiAgICAgICAgICAgIGguc2NvcmUudG9Mb2NhbGVTdHJpbmcoKSwge1xuICAgICAgICAgICAgICBmb250OiBcImJvbGQgXCIgKyAodGhpcy5nYW1lLndvcmxkLmhlaWdodCAvIDE1KSArIFwicHggRG9zaXNcIixcbiAgICAgICAgICAgICAgZmlsbDogXCIjMzliNTRhXCIsXG4gICAgICAgICAgICAgIGFsaWduOiBcImxlZnRcIixcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIHNjb3JlLmFuY2hvci5zZXRUbygwLCAwKTtcblxuICAgICAgICAgIC8vIEZvbnQgbG9hZGluZyB0aGluZ1xuICAgICAgICAgIF8uZGVsYXkoXy5iaW5kKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5oaWdoc2NvcmVMaXN0R3JvdXAuYWRkKG5hbWUpO1xuICAgICAgICAgICAgdGhpcy5oaWdoc2NvcmVMaXN0R3JvdXAuYWRkKHNjb3JlKTtcbiAgICAgICAgICB9LCB0aGlzKSwgMTAwMCk7XG4gICAgICAgIH0sIHRoaXMpKTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuXG4gIC8vIEV4cG9ydFxuICBtb2R1bGUuZXhwb3J0cyA9IEdhbWVvdmVyO1xufSkoKTtcbiIsIi8qIGdsb2JhbCBfOmZhbHNlLCBQaGFzZXI6ZmFsc2UgKi9cblxuLyoqXG4gKiBNZW51IHN0YXRlXG4gKi9cblxuKGZ1bmN0aW9uKCkge1xuICBcInVzZSBzdHJpY3RcIjtcblxuICAvLyBDb25zdHJ1Y3RvclxuICB2YXIgTWVudSA9IGZ1bmN0aW9uKCkge1xuICAgIFBoYXNlci5TdGF0ZS5jYWxsKHRoaXMpO1xuXG4gICAgLy8gQ29uZmlnXG4gICAgdGhpcy5wYWRkaW5nID0gMjA7XG4gIH07XG5cbiAgLy8gRXh0ZW5kIGZyb20gU3RhdGVcbiAgTWVudS5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFBoYXNlci5TdGF0ZS5wcm90b3R5cGUpO1xuICBNZW51LnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IE1lbnU7XG5cbiAgLy8gQWRkIG1ldGhvZHNcbiAgXy5leHRlbmQoTWVudS5wcm90b3R5cGUsIFBoYXNlci5TdGF0ZS5wcm90b3R5cGUsIHtcbiAgICAvLyBQcmVsb2FkXG4gICAgcHJlbG9hZDogZnVuY3Rpb24oKSB7XG4gICAgICAvLyBMb2FkIHVwIGdhbWUgaW1hZ2VzXG4gICAgICB0aGlzLmdhbWUubG9hZC5hdGxhcyhcInRpdGxlLXNwcml0ZXNcIiwgXCJhc3NldHMvdGl0bGUtc3ByaXRlcy5wbmdcIiwgXCJhc3NldHMvdGl0bGUtc3ByaXRlcy5qc29uXCIpO1xuICAgIH0sXG5cbiAgICAvLyBDcmVhdGVcbiAgICBjcmVhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgLy8gU2V0IGJhY2tncm91bmRcbiAgICAgIHRoaXMuZ2FtZS5zdGFnZS5iYWNrZ3JvdW5kQ29sb3IgPSBcIiNiOGY0YmNcIjtcblxuICAgICAgLy8gUGxhY2UgdGl0bGVcbiAgICAgIHRoaXMudGl0bGVJbWFnZSA9IHRoaXMuZ2FtZS5hZGQuc3ByaXRlKHRoaXMuZ2FtZS53aWR0aCAvIDIsIHRoaXMucGFkZGluZyAqIDMsIFwidGl0bGUtc3ByaXRlc1wiLCBcInRpdGxlLnBuZ1wiKTtcbiAgICAgIHRoaXMudGl0bGVJbWFnZS5hbmNob3Iuc2V0VG8oMC41LCAwKTtcbiAgICAgIHRoaXMudGl0bGVJbWFnZS5zY2FsZS5zZXRUbygodGhpcy5nYW1lLndpZHRoIC0gKHRoaXMucGFkZGluZyAqIDIpKSAvIHRoaXMudGl0bGVJbWFnZS53aWR0aCk7XG4gICAgICB0aGlzLmdhbWUuYWRkLmV4aXN0aW5nKHRoaXMudGl0bGVJbWFnZSk7XG5cbiAgICAgIC8vIFBsYWNlIHBsYXlcbiAgICAgIHRoaXMucGxheUltYWdlID0gdGhpcy5nYW1lLmFkZC5zcHJpdGUodGhpcy5nYW1lLndpZHRoIC8gMiwgdGhpcy5nYW1lLmhlaWdodCAtIHRoaXMucGFkZGluZyAqIDMsIFwidGl0bGUtc3ByaXRlc1wiLCBcInRpdGxlLXBsYXkucG5nXCIpO1xuICAgICAgdGhpcy5wbGF5SW1hZ2UuYW5jaG9yLnNldFRvKDAuNCwgMSk7XG4gICAgICB0aGlzLnBsYXlJbWFnZS5zY2FsZS5zZXRUbygodGhpcy5nYW1lLndpZHRoICogMC43NSkgLyB0aGlzLnRpdGxlSW1hZ2Uud2lkdGgpO1xuICAgICAgdGhpcy5nYW1lLmFkZC5leGlzdGluZyh0aGlzLnBsYXlJbWFnZSk7XG5cbiAgICAgIC8vIEFkZCBob3ZlciBmb3IgbW91c2VcbiAgICAgIHRoaXMucGxheUltYWdlLmlucHV0RW5hYmxlZCA9IHRydWU7XG4gICAgICB0aGlzLnBsYXlJbWFnZS5ldmVudHMub25JbnB1dE92ZXIuYWRkKGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLnBsYXlJbWFnZS5vcmlnaW5hbFRpbnQgPSB0aGlzLnBsYXlJbWFnZS50aW50O1xuICAgICAgICB0aGlzLnBsYXlJbWFnZS50aW50ID0gMC41ICogMHhGRkZGRkY7XG4gICAgICB9LCB0aGlzKTtcblxuICAgICAgdGhpcy5wbGF5SW1hZ2UuZXZlbnRzLm9uSW5wdXRPdXQuYWRkKGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLnBsYXlJbWFnZS50aW50ID0gdGhpcy5wbGF5SW1hZ2Uub3JpZ2luYWxUaW50O1xuICAgICAgfSwgdGhpcyk7XG5cbiAgICAgIC8vIEFkZCBtb3VzZSBpbnRlcmFjdGlvblxuICAgICAgdGhpcy5wbGF5SW1hZ2UuZXZlbnRzLm9uSW5wdXREb3duLmFkZCh0aGlzLmdvLCB0aGlzKTtcblxuICAgICAgLy8gQWRkIGtleWJvYXJkIGludGVyYWN0aW9uXG4gICAgICB0aGlzLmFjdGlvbkJ1dHRvbiA9IHRoaXMuZ2FtZS5pbnB1dC5rZXlib2FyZC5hZGRLZXkoUGhhc2VyLktleWJvYXJkLlNQQUNFQkFSKTtcbiAgICAgIHRoaXMuYWN0aW9uQnV0dG9uLm9uRG93bi5hZGQoZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuZ28oKTtcbiAgICAgIH0sIHRoaXMpO1xuICAgIH0sXG5cbiAgICAvLyBTdGFydCBwbGF5aW5nXG4gICAgZ286IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5nYW1lLnN0YXRlLnN0YXJ0KFwicGxheVwiKTtcbiAgICB9LFxuXG4gICAgLy8gVXBkYXRlXG4gICAgdXBkYXRlOiBmdW5jdGlvbigpIHtcbiAgICB9XG4gIH0pO1xuXG4gIC8vIEV4cG9ydFxuICBtb2R1bGUuZXhwb3J0cyA9IE1lbnU7XG59KSgpO1xuIiwiLyogZ2xvYmFsIF86ZmFsc2UsIFBoYXNlcjpmYWxzZSAqL1xuXG4vKipcbiAqIFBsYXkgc3RhdGVcbiAqL1xuXG4oZnVuY3Rpb24oKSB7XG4gIFwidXNlIHN0cmljdFwiO1xuXG4gIC8vIERlcGVuZGVuY2llc1xuICB2YXIgcHJlZmFicyA9IHtcbiAgICBCb29zdDogcmVxdWlyZShcIi4vcHJlZmFiLWJvb3N0LmpzXCIpLFxuICAgIFBlcHBlcjogcmVxdWlyZShcIi4vcHJlZmFiLXBlcHBlci5qc1wiKSxcbiAgICBCb3R1bGlzbTogcmVxdWlyZShcIi4vcHJlZmFiLWJvdHVsaXNtLmpzXCIpLFxuICAgIENvaW46IHJlcXVpcmUoXCIuL3ByZWZhYi1jb2luLmpzXCIpLFxuICAgIEhlcm86IHJlcXVpcmUoXCIuL3ByZWZhYi1oZXJvLmpzXCIpLFxuICAgIFBsYXRmb3JtOiByZXF1aXJlKFwiLi9wcmVmYWItcGxhdGZvcm0uanNcIiksXG4gICAgQmFzZTogcmVxdWlyZShcIi4vcHJlZmFiLWJhc2UuanNcIilcbiAgfTtcblxuICAvLyBDb25zdHJ1Y3RvclxuICB2YXIgUGxheSA9IGZ1bmN0aW9uKCkge1xuICAgIFBoYXNlci5TdGF0ZS5jYWxsKHRoaXMpO1xuICB9O1xuXG4gIC8vIEV4dGVuZCBmcm9tIFN0YXRlXG4gIFBsYXkucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQaGFzZXIuU3RhdGUucHJvdG90eXBlKTtcbiAgUGxheS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBQbGF5O1xuXG4gIC8vIEFkZCBtZXRob2RzXG4gIF8uZXh0ZW5kKFBsYXkucHJvdG90eXBlLCBQaGFzZXIuU3RhdGUucHJvdG90eXBlLCB7XG4gICAgLy8gUHJlbG9hZFxuICAgIHByZWxvYWQ6IGZ1bmN0aW9uKCkge1xuICAgICAgLy8gTG9hZCB1cCBnYW1lIGltYWdlc1xuICAgICAgdGhpcy5nYW1lLmxvYWQuYXRsYXMoXCJnYW1lLXNwcml0ZXNcIiwgXCJhc3NldHMvZ2FtZS1zcHJpdGVzLnBuZ1wiLCBcImFzc2V0cy9nYW1lLXNwcml0ZXMuanNvblwiKTtcbiAgICAgIHRoaXMuZ2FtZS5sb2FkLmF0bGFzKFwicGlja2xlLXNwcml0ZXNcIiwgXCJhc3NldHMvcGlja2xlLXNwcml0ZXMucG5nXCIsIFwiYXNzZXRzL3BpY2tsZS1zcHJpdGVzLmpzb25cIik7XG4gICAgICB0aGlzLmdhbWUubG9hZC5hdGxhcyhcImNhcnJvdC1zcHJpdGVzXCIsIFwiYXNzZXRzL2NhcnJvdC1zcHJpdGVzLnBuZ1wiLCBcImFzc2V0cy9jYXJyb3Qtc3ByaXRlcy5qc29uXCIpO1xuICAgIH0sXG5cbiAgICAvLyBDcmVhdGVcbiAgICBjcmVhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgLy8gU2V0IGluaXRpYWwgZGlmZmljdWx0eSBhbmQgbGV2ZWwgc2V0dGluZ3NcbiAgICAgIHRoaXMuY3JlYXRlU3VwZXJMZXZlbEJHKCk7XG4gICAgICB0aGlzLnNldERpZmZpY3VsdHkoKTtcblxuICAgICAgLy8gU2NvcmluZ1xuICAgICAgdGhpcy5zY29yZUNvaW4gPSAxMDA7XG4gICAgICB0aGlzLnNjb3JlQm9vc3QgPSA1MDA7XG4gICAgICB0aGlzLnNjb3JlUGVwcGVyID0gNzUwO1xuICAgICAgdGhpcy5zY29yZUJvdCA9IDEwMDA7XG5cbiAgICAgIC8vIFNwYWNpbmdcbiAgICAgIHRoaXMucGFkZGluZyA9IDEwO1xuXG4gICAgICAvLyBJbml0aWFsaXplIHRyYWNraW5nIHZhcmlhYmxlc1xuICAgICAgdGhpcy5yZXNldFZpZXdUcmFja2luZygpO1xuXG4gICAgICAvLyBTY2FsaW5nXG4gICAgICB0aGlzLmdhbWUuc2NhbGUuc2NhbGVNb2RlID0gUGhhc2VyLlNjYWxlTWFuYWdlci5TSE9XX0FMTDtcbiAgICAgIHRoaXMuZ2FtZS5zY2FsZS5tYXhXaWR0aCA9IHRoaXMuZ2FtZS53aWR0aDtcbiAgICAgIHRoaXMuZ2FtZS5zY2FsZS5tYXhIZWlnaHQgPSB0aGlzLmdhbWUuaGVpZ2h0O1xuICAgICAgdGhpcy5nYW1lLnNjYWxlLnBhZ2VBbGlnbkhvcml6b250YWxseSA9IHRydWU7XG4gICAgICB0aGlzLmdhbWUuc2NhbGUucGFnZUFsaWduVmVydGljYWxseSA9IHRydWU7XG5cbiAgICAgIC8vIFBoeXNpY3NcbiAgICAgIHRoaXMuZ2FtZS5waHlzaWNzLnN0YXJ0U3lzdGVtKFBoYXNlci5QaHlzaWNzLkFSQ0FERSk7XG4gICAgICB0aGlzLmdhbWUucGh5c2ljcy5hcmNhZGUuZ3Jhdml0eS55ID0gMTAwMDtcblxuICAgICAgLy8gRGV0ZXJtaW5lIHdoZXJlIGZpcnN0IHBsYXRmb3JtIGFuZCBoZXJvIHdpbGwgYmVcbiAgICAgIHRoaXMuc3RhcnRZID0gdGhpcy5nYW1lLmhlaWdodCAtIDU7XG4gICAgICB0aGlzLmhlcm8gPSBuZXcgcHJlZmFicy5IZXJvKHRoaXMuZ2FtZSwgMCwgMCk7XG4gICAgICB0aGlzLmhlcm8ucmVzZXRQbGFjZW1lbnQodGhpcy5nYW1lLndpZHRoICogMC41LCB0aGlzLnN0YXJ0WSAtIHRoaXMuaGVyby5oZWlnaHQgLSA1MCk7XG4gICAgICB0aGlzLmdhbWUuYWRkLmV4aXN0aW5nKHRoaXMuaGVybyk7XG5cbiAgICAgIC8vIENvbnRhaW5lcnNcbiAgICAgIHRoaXMuY29pbnMgPSB0aGlzLmdhbWUuYWRkLmdyb3VwKCk7XG4gICAgICB0aGlzLmJvb3N0cyA9IHRoaXMuZ2FtZS5hZGQuZ3JvdXAoKTtcbiAgICAgIHRoaXMucGVwcGVycyA9IHRoaXMuZ2FtZS5hZGQuZ3JvdXAoKTtcbiAgICAgIHRoaXMuYm90cyA9IHRoaXMuZ2FtZS5hZGQuZ3JvdXAoKTtcblxuICAgICAgLy8gUGxhdGZvcm1zXG4gICAgICB0aGlzLmFkZFBsYXRmb3JtcygpO1xuXG4gICAgICAvLyBJbml0aWFsaXplIHNjb3JlXG4gICAgICB0aGlzLnJlc2V0U2NvcmUoKTtcbiAgICAgIHRoaXMudXBkYXRlU2NvcmUoKTtcblxuICAgICAgLy8gQ3Vyc29ycywgaW5wdXRcbiAgICAgIHRoaXMuY3Vyc29ycyA9IHRoaXMuZ2FtZS5pbnB1dC5rZXlib2FyZC5jcmVhdGVDdXJzb3JLZXlzKCk7XG4gICAgICB0aGlzLmFjdGlvbkJ1dHRvbiA9IHRoaXMuZ2FtZS5pbnB1dC5rZXlib2FyZC5hZGRLZXkoUGhhc2VyLktleWJvYXJkLlNQQUNFQkFSKTtcbiAgICB9LFxuXG4gICAgLy8gVXBkYXRlXG4gICAgdXBkYXRlOiBmdW5jdGlvbigpIHtcbiAgICAgIC8vIFRoaXMgaXMgd2hlcmUgdGhlIG1haW4gbWFnaWMgaGFwcGVuc1xuICAgICAgLy8gdGhlIHkgb2Zmc2V0IGFuZCB0aGUgaGVpZ2h0IG9mIHRoZSB3b3JsZCBhcmUgYWRqdXN0ZWRcbiAgICAgIC8vIHRvIG1hdGNoIHRoZSBoaWdoZXN0IHBvaW50IHRoZSBoZXJvIGhhcyByZWFjaGVkXG4gICAgICB0aGlzLndvcmxkLnNldEJvdW5kcygwLCAtdGhpcy5oZXJvLnlDaGFuZ2UsIHRoaXMuZ2FtZS53b3JsZC53aWR0aCxcbiAgICAgICAgdGhpcy5nYW1lLmhlaWdodCArIHRoaXMuaGVyby55Q2hhbmdlKTtcblxuICAgICAgLy8gVGhlIGJ1aWx0IGluIGNhbWVyYSBmb2xsb3cgbWV0aG9kcyB3b24ndCB3b3JrIGZvciBvdXIgbmVlZHNcbiAgICAgIC8vIHRoaXMgaXMgYSBjdXN0b20gZm9sbG93IHN0eWxlIHRoYXQgd2lsbCBub3QgZXZlciBtb3ZlIGRvd24sIGl0IG9ubHkgbW92ZXMgdXBcbiAgICAgIHRoaXMuY2FtZXJhWU1pbiA9IE1hdGgubWluKHRoaXMuY2FtZXJhWU1pbiwgdGhpcy5oZXJvLnkgLSB0aGlzLmdhbWUuaGVpZ2h0IC8gMik7XG4gICAgICB0aGlzLmNhbWVyYS55ID0gdGhpcy5jYW1lcmFZTWluO1xuXG4gICAgICAvLyBJZiBoZXJvIGZhbGxzIGJlbG93IGNhbWVyYVxuICAgICAgaWYgKHRoaXMuaGVyby55ID4gdGhpcy5jYW1lcmFZTWluICsgdGhpcy5nYW1lLmhlaWdodCArIDIwMCkge1xuICAgICAgICB0aGlzLmdhbWVPdmVyKCk7XG4gICAgICB9XG5cbiAgICAgIC8vIElmIGhlcm8gaXMgZ29pbmcgZG93biwgdGhlbiBubyBsb25nZXIgb24gZmlyZVxuICAgICAgaWYgKHRoaXMuaGVyby5ib2R5LnZlbG9jaXR5LnkgPiAwKSB7XG4gICAgICAgIHRoaXMucHV0T3V0RmlyZSgpO1xuICAgICAgfVxuXG4gICAgICAvLyBNb3ZlIGhlcm9cbiAgICAgIHRoaXMuaGVyby5ib2R5LnZlbG9jaXR5LnggPVxuICAgICAgICAodGhpcy5jdXJzb3JzLmxlZnQuaXNEb3duKSA/IC0odGhpcy5nYW1lLnBoeXNpY3MuYXJjYWRlLmdyYXZpdHkueSAvIDUpIDpcbiAgICAgICAgKHRoaXMuY3Vyc29ycy5yaWdodC5pc0Rvd24pID8gKHRoaXMuZ2FtZS5waHlzaWNzLmFyY2FkZS5ncmF2aXR5LnkgLyA1KSA6IDA7XG5cbiAgICAgIC8vIFBsYXRmb3JtIGNvbGxpc2lvbnNcbiAgICAgIHRoaXMuZ2FtZS5waHlzaWNzLmFyY2FkZS5jb2xsaWRlKHRoaXMuaGVybywgdGhpcy5wbGF0Zm9ybXMsIHRoaXMudXBkYXRlSGVyb1BsYXRmb3JtLCBudWxsLCB0aGlzKTtcbiAgICAgIHRoaXMuZ2FtZS5waHlzaWNzLmFyY2FkZS5jb2xsaWRlKHRoaXMuaGVybywgdGhpcy5iYXNlLCB0aGlzLnVwZGF0ZUhlcm9QbGF0Zm9ybSwgbnVsbCwgdGhpcyk7XG5cbiAgICAgIC8vIENvaW4gY29sbGlzaW9uc1xuICAgICAgdGhpcy5nYW1lLnBoeXNpY3MuYXJjYWRlLm92ZXJsYXAodGhpcy5oZXJvLCB0aGlzLmNvaW5zLCBmdW5jdGlvbihoZXJvLCBjb2luKSB7XG4gICAgICAgIGNvaW4ua2lsbCgpO1xuICAgICAgICB0aGlzLnVwZGF0ZVNjb3JlKHRoaXMuc2NvcmVDb2luKTtcbiAgICAgIH0sIG51bGwsIHRoaXMpO1xuXG4gICAgICAvLyBCb29zdHMgY29sbGlzaW9ucy4gIERvbid0IGRvIGFueXRoaW5nIGlmIG9uIGZpcmVcbiAgICAgIGlmICghdGhpcy5vbkZpcmUpIHtcbiAgICAgICAgdGhpcy5nYW1lLnBoeXNpY3MuYXJjYWRlLm92ZXJsYXAodGhpcy5oZXJvLCB0aGlzLmJvb3N0cywgZnVuY3Rpb24oaGVybywgYm9vc3QpIHtcbiAgICAgICAgICBib29zdC5raWxsKCk7XG4gICAgICAgICAgdGhpcy51cGRhdGVTY29yZSh0aGlzLnNjb3JlQm9vc3QpO1xuICAgICAgICAgIGhlcm8uYm9keS52ZWxvY2l0eS55ID0gdGhpcy5nYW1lLnBoeXNpY3MuYXJjYWRlLmdyYXZpdHkueSAqIC0xICogMS41O1xuICAgICAgICB9LCBudWxsLCB0aGlzKTtcbiAgICAgIH1cblxuICAgICAgLy8gUGVwcGVyIGNvbGxpc2lvbnNcbiAgICAgIHRoaXMuZ2FtZS5waHlzaWNzLmFyY2FkZS5vdmVybGFwKHRoaXMuaGVybywgdGhpcy5wZXBwZXJzLCBmdW5jdGlvbihoZXJvLCBwZXBwZXIpIHtcbiAgICAgICAgcGVwcGVyLmtpbGwoKTtcbiAgICAgICAgdGhpcy51cGRhdGVTY29yZSh0aGlzLnNjb3JlUGVwcGVyKTtcbiAgICAgICAgdGhpcy5zZXRPbkZpcmUoKTtcbiAgICAgICAgaGVyby5ib2R5LnZlbG9jaXR5LnkgPSB0aGlzLmdhbWUucGh5c2ljcy5hcmNhZGUuZ3Jhdml0eS55ICogLTEgKiAzO1xuICAgICAgfSwgbnVsbCwgdGhpcyk7XG5cbiAgICAgIC8vIEJvdHVsaXNtIGNvbGxpc2lvbnMuICBJZiBoZXJvayBqdW1wcyBvbiB0b3AsIHRoZW4ga2lsbCwgb3RoZXJ3aXNlIGRpZSwgYW5kXG4gICAgICAvLyBpZ25vcmUgaWYgb24gZmlyZS5cbiAgICAgIGlmICghdGhpcy5vbkZpcmUpIHtcbiAgICAgICAgdGhpcy5nYW1lLnBoeXNpY3MuYXJjYWRlLmNvbGxpZGUodGhpcy5oZXJvLCB0aGlzLmJvdHMsIGZ1bmN0aW9uKGhlcm8sIGJvdCkge1xuICAgICAgICAgIGlmIChoZXJvLmJvZHkudG91Y2hpbmcuZG93bikge1xuICAgICAgICAgICAgYm90LmtpbGwoKTtcbiAgICAgICAgICAgIHRoaXMudXBkYXRlU2NvcmUodGhpcy5zY29yZUJvdCk7XG4gICAgICAgICAgICBoZXJvLmJvZHkudmVsb2NpdHkueSA9IHRoaXMuZ2FtZS5waHlzaWNzLmFyY2FkZS5ncmF2aXR5LnkgKiAtMSAqIDAuNTtcbiAgICAgICAgICB9XG4gICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmdhbWVPdmVyKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9LCBudWxsLCB0aGlzKTtcbiAgICAgIH1cblxuICAgICAgLy8gRm9yIGVhY2ggcGxhdGZvcm0sIGZpbmQgb3V0IHdoaWNoIGlzIHRoZSBoaWdoZXN0XG4gICAgICAvLyBpZiBvbmUgZ29lcyBiZWxvdyB0aGUgY2FtZXJhIHZpZXcsIHRoZW4gY3JlYXRlIGEgbmV3XG4gICAgICAvLyBvbmUgYXQgYSBkaXN0YW5jZSBmcm9tIHRoZSBoaWdoZXN0IG9uZVxuICAgICAgLy8gdGhlc2UgYXJlIHBvb2xlZCBzbyB0aGV5IGFyZSB2ZXJ5IHBlcmZvcm1hbnQuXG4gICAgICB0aGlzLnBsYXRmb3Jtcy5mb3JFYWNoQWxpdmUoZnVuY3Rpb24ocCkge1xuICAgICAgICB2YXIgcGxhdGZvcm07XG4gICAgICAgIHRoaXMucGxhdGZvcm1ZTWluID0gTWF0aC5taW4odGhpcy5wbGF0Zm9ybVlNaW4sIHAueSk7XG5cbiAgICAgICAgLy8gQ2hlY2sgaWYgdGhpcyBvbmUgaXMgb2YgdGhlIHNjcmVlblxuICAgICAgICBpZiAocC55ID4gdGhpcy5jYW1lcmEueSArIHRoaXMuZ2FtZS5oZWlnaHQpIHtcbiAgICAgICAgICBwLmtpbGwoKTtcbiAgICAgICAgICBwbGF0Zm9ybSA9IHRoaXMucGxhdGZvcm1zLmdldEZpcnN0RGVhZCgpO1xuICAgICAgICAgIHRoaXMucGxhY2VQbGF0Zm9ybSh0aGlzLnBsYXRmb3Jtcy5nZXRGaXJzdERlYWQoKSwgdGhpcy5wbGF0Zm9ybXMuZ2V0VG9wKCkpO1xuICAgICAgICB9XG4gICAgICB9LCB0aGlzKTtcblxuICAgICAgLy8gUmVtb3ZlIGFueSBmbHVmZlxuICAgICAgW1wiY29pbnNcIiwgXCJib29zdHNcIiwgXCJib3RzXCIsIFwicGVwcGVyc1wiXS5mb3JFYWNoKF8uYmluZChmdW5jdGlvbihwb29sKSB7XG4gICAgICAgIHRoaXNbcG9vbF0uZm9yRWFjaEFsaXZlKGZ1bmN0aW9uKHApIHtcbiAgICAgICAgICAvLyBDaGVjayBpZiB0aGlzIG9uZSBpcyBvZiB0aGUgc2NyZWVuXG4gICAgICAgICAgaWYgKHAueSA+IHRoaXMuY2FtZXJhLnkgKyB0aGlzLmdhbWUuaGVpZ2h0KSB7XG4gICAgICAgICAgICBwLmtpbGwoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0sIHRoaXMpO1xuICAgICAgfSwgdGhpcykpO1xuXG4gICAgICAvLyBVcGRhdGUgc2NvcmVcbiAgICAgIHRoaXMudXBkYXRlU2NvcmUoKTtcblxuICAgICAgLy8gVXBkYXRlIGRpZmZpY3VsdFxuICAgICAgdGhpcy5zZXREaWZmaWN1bHR5KCk7XG4gICAgfSxcblxuICAgIC8vIFBsYXRmb3JtIGNvbGxpc2lvblxuICAgIHVwZGF0ZUhlcm9QbGF0Zm9ybTogZnVuY3Rpb24oaGVybykge1xuICAgICAgdGhpcy5wdXRPdXRGaXJlKCk7XG4gICAgICBoZXJvLmJvZHkudmVsb2NpdHkueSA9IHRoaXMuZ2FtZS5waHlzaWNzLmFyY2FkZS5ncmF2aXR5LnkgKiAtMSAqIDAuNztcbiAgICB9LFxuXG4gICAgLy8gU2h1dGRvd25cbiAgICBzaHV0ZG93bjogZnVuY3Rpb24oKSB7XG4gICAgICAvLyBSZXNldCBldmVyeXRoaW5nLCBvciB0aGUgd29ybGQgd2lsbCBiZSBtZXNzZWQgdXBcbiAgICAgIHRoaXMud29ybGQuc2V0Qm91bmRzKDAsIDAsIHRoaXMuZ2FtZS53aWR0aCwgdGhpcy5nYW1lLmhlaWdodCk7XG4gICAgICB0aGlzLmN1cnNvciA9IG51bGw7XG4gICAgICB0aGlzLnJlc2V0Vmlld1RyYWNraW5nKCk7XG4gICAgICB0aGlzLnJlc2V0U2NvcmUoKTtcblxuICAgICAgW1wiaGVyb1wiLCBcInBsYXRmb3Jtc1wiLCBcImNvaW5zXCIsIFwiYm9vc3RzXCIsIFwic2NvcmVHcm91cFwiXS5mb3JFYWNoKF8uYmluZChmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgIHRoaXNbaXRlbV0uZGVzdHJveSgpO1xuICAgICAgICB0aGlzW2l0ZW1dID0gbnVsbDtcbiAgICAgIH0sIHRoaXMpKTtcbiAgICB9LFxuXG4gICAgLy8gR2FtZSBvdmVyXG4gICAgZ2FtZU92ZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgLy8gQ2FuJ3Qgc2VlbSB0byBmaW5kIGEgd2F5IHRvIHBhc3MgdGhlIHNjb3JlXG4gICAgICAvLyB2aWEgYSBzdGF0ZSBjaGFuZ2UuXG4gICAgICB0aGlzLmdhbWUucGlja2xlLnNjb3JlID0gdGhpcy5zY29yZTtcbiAgICAgIHRoaXMuZ2FtZS5zdGF0ZS5zdGFydChcImdhbWVvdmVyXCIpO1xuICAgIH0sXG5cbiAgICAvLyBBZGQgcGxhdGZvcm0gcG9vbCBhbmQgY3JlYXRlIGluaXRpYWwgb25lXG4gICAgYWRkUGxhdGZvcm1zOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMucGxhdGZvcm1zID0gdGhpcy5nYW1lLmFkZC5ncm91cCgpO1xuXG4gICAgICAvLyBBZGQgZmlyc3QgcGxhdGZvcm0uXG4gICAgICB0aGlzLmJhc2UgPSBuZXcgcHJlZmFicy5CYXNlKHRoaXMuZ2FtZSwgdGhpcy5nYW1lLndpZHRoICogMC41LCB0aGlzLnN0YXJ0WSwgdGhpcy5nYW1lLndpZHRoICogMik7XG4gICAgICB0aGlzLmdhbWUuYWRkLmV4aXN0aW5nKHRoaXMuYmFzZSk7XG5cbiAgICAgIC8vIEFkZCBzb21lIGJhc2UgcGxhdGZvcm1zXG4gICAgICB2YXIgcHJldmlvdXM7XG4gICAgICBfLmVhY2goXy5yYW5nZSgyMCksIF8uYmluZChmdW5jdGlvbihpKSB7XG4gICAgICAgIHZhciBwID0gbmV3IHByZWZhYnMuUGxhdGZvcm0odGhpcy5nYW1lLCAwLCAwKTtcbiAgICAgICAgdGhpcy5wbGFjZVBsYXRmb3JtKHAsIHByZXZpb3VzLCB0aGlzLndvcmxkLmhlaWdodCAtIHRoaXMucGxhdGZvcm1TcGFjZVkgLSB0aGlzLnBsYXRmb3JtU3BhY2VZICogaSk7XG4gICAgICAgIHRoaXMucGxhdGZvcm1zLmFkZChwKTtcbiAgICAgICAgcHJldmlvdXMgPSBwO1xuICAgICAgfSwgdGhpcykpO1xuICAgIH0sXG5cbiAgICAvLyBQbGFjZSBwbGF0Zm9ybVxuICAgIHBsYWNlUGxhdGZvcm06IGZ1bmN0aW9uKHBsYXRmb3JtLCBwcmV2aW91c1BsYXRmb3JtLCBvdmVycmlkZVkpIHtcbiAgICAgIHBsYXRmb3JtLnJlc2V0U2V0dGluZ3MoKTtcbiAgICAgIHZhciB5ID0gb3ZlcnJpZGVZIHx8IHRoaXMucGxhdGZvcm1ZTWluIC0gdGhpcy5wbGF0Zm9ybVNwYWNlWTtcbiAgICAgIHZhciBtaW5YID0gcGxhdGZvcm0ubWluWDtcbiAgICAgIHZhciBtYXhYID0gcGxhdGZvcm0ubWF4WDtcblxuICAgICAgLy8gRGV0ZXJtaW5lIHggYmFzZWQgb24gcHJldmlvdXNQbGF0Zm9ybVxuICAgICAgdmFyIHggPSB0aGlzLnJuZC5pbnRlZ2VySW5SYW5nZShtaW5YLCBtYXhYKTtcbiAgICAgIGlmIChwcmV2aW91c1BsYXRmb3JtKSB7XG4gICAgICAgIHggPSB0aGlzLnJuZC5pbnRlZ2VySW5SYW5nZShwcmV2aW91c1BsYXRmb3JtLnggLSB0aGlzLnBsYXRmb3JtR2FwTWF4LCBwcmV2aW91c1BsYXRmb3JtLnggKyB0aGlzLnBsYXRmb3JtR2FwTWF4KTtcblxuICAgICAgICAvLyBTb21lIGxvZ2ljIHRvIHRyeSB0byB3cmFwXG4gICAgICAgIHggPSAoeCA8IDApID8gTWF0aC5taW4obWF4WCwgdGhpcy53b3JsZC53aWR0aCArIHgpIDogTWF0aC5tYXgoeCwgbWluWCk7XG4gICAgICAgIHggPSAoeCA+IHRoaXMud29ybGQud2lkdGgpID8gTWF0aC5tYXgobWluWCwgeCAtIHRoaXMud29ybGQud2lkdGgpIDogTWF0aC5taW4oeCwgbWF4WCk7XG4gICAgICB9XG5cbiAgICAgIC8vIFBsYWNlXG4gICAgICBwbGF0Zm9ybS5yZXNldCh4LCB5KTtcblxuICAgICAgLy8gQWRkIHNvbWUgZmx1ZmZcbiAgICAgIHRoaXMuZmx1ZmZQbGF0Zm9ybShwbGF0Zm9ybSk7XG4gICAgfSxcblxuICAgIC8vIEFkZCBwb3NzaWJsZSBmbHVmZiB0byBwbGF0Zm9ybVxuICAgIGZsdWZmUGxhdGZvcm06IGZ1bmN0aW9uKHBsYXRmb3JtKSB7XG4gICAgICB2YXIgeCA9IHBsYXRmb3JtLng7XG4gICAgICB2YXIgeSA9IHBsYXRmb3JtLnkgLSBwbGF0Zm9ybS5oZWlnaHQgLyAyIC0gMzA7XG5cbiAgICAgIC8vIEFkZCBmbHVmZlxuICAgICAgaWYgKE1hdGgucmFuZG9tKCkgPD0gdGhpcy5ob3ZlckNoYW5jZSkge1xuICAgICAgICBwbGF0Zm9ybS5ob3ZlciA9IHRydWU7XG4gICAgICB9XG4gICAgICBlbHNlIGlmIChNYXRoLnJhbmRvbSgpIDw9IHRoaXMuY29pbkNoYW5jZSkge1xuICAgICAgICB0aGlzLmFkZFdpdGhQb29sKHRoaXMuY29pbnMsIFwiQ29pblwiLCB4LCB5KTtcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKE1hdGgucmFuZG9tKCkgPD0gdGhpcy5ib29zdENoYW5jZSkge1xuICAgICAgICB0aGlzLmFkZFdpdGhQb29sKHRoaXMuYm9vc3RzLCBcIkJvb3N0XCIsIHgsIHkpO1xuICAgICAgfVxuICAgICAgZWxzZSBpZiAoTWF0aC5yYW5kb20oKSA8PSB0aGlzLmJvdENoYW5jZSkge1xuICAgICAgICB0aGlzLmFkZFdpdGhQb29sKHRoaXMuYm90cywgXCJCb3R1bGlzbVwiLCB4LCB5KTtcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKE1hdGgucmFuZG9tKCkgPD0gdGhpcy5wZXBwZXJDaGFuY2UpIHtcbiAgICAgICAgdGhpcy5hZGRXaXRoUG9vbCh0aGlzLnBlcHBlcnMsIFwiUGVwcGVyXCIsIHgsIHkpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICAvLyBHZW5lcmljIGFkZCB3aXRoIHBvb2xpbmcgZnVuY3Rpb25hbGxpdHlcbiAgICBhZGRXaXRoUG9vbDogZnVuY3Rpb24ocG9vbCwgcHJlZmFiLCB4LCB5KSB7XG4gICAgICB2YXIgbyA9IHBvb2wuZ2V0Rmlyc3REZWFkKCk7XG4gICAgICBvID0gbyB8fCBuZXcgcHJlZmFic1twcmVmYWJdKHRoaXMuZ2FtZSwgeCwgeSk7XG5cbiAgICAgIC8vIFVzZSBjdXN0b20gcmVzZXQgaWYgYXZhaWxhYmxlXG4gICAgICBpZiAoby5yZXNldFBsYWNlbWVudCkge1xuICAgICAgICBvLnJlc2V0UGxhY2VtZW50KHgsIHkpO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIG8ucmVzZXQoeCwgeSk7XG4gICAgICB9XG5cbiAgICAgIHBvb2wuYWRkKG8pO1xuICAgIH0sXG5cbiAgICAvLyBVcGRhdGUgc2NvcmUuICBTY29yZSBpcyB0aGUgc2NvcmUgd2l0aG91dCBob3cgZmFyIHRoZXkgaGF2ZSBnb25lIHVwLlxuICAgIHVwZGF0ZVNjb3JlOiBmdW5jdGlvbihhZGRpdGlvbikge1xuICAgICAgYWRkaXRpb24gPSBhZGRpdGlvbiB8fCAwO1xuICAgICAgdGhpcy5zY29yZVVwID0gKC10aGlzLmNhbWVyYVlNaW4gPj0gOTk5OTk5OSkgPyAwIDpcbiAgICAgICAgTWF0aC5taW4oTWF0aC5tYXgoMCwgLXRoaXMuY2FtZXJhWU1pbiksIDk5OTk5OTkgLSAxKTtcbiAgICAgIHRoaXMuc2NvcmVDb2xsZWN0ID0gKHRoaXMuc2NvcmVDb2xsZWN0IHx8IDApICsgYWRkaXRpb247XG4gICAgICB0aGlzLnNjb3JlID0gTWF0aC5yb3VuZCh0aGlzLnNjb3JlVXAgKyB0aGlzLnNjb3JlQ29sbGVjdCk7XG5cbiAgICAgIC8vIFNjb3JlIHRleHRcbiAgICAgIGlmICghdGhpcy5zY29yZUdyb3VwKSB7XG4gICAgICAgIHRoaXMuc2NvcmVHcm91cCA9IHRoaXMuZ2FtZS5hZGQuZ3JvdXAoKTtcblxuICAgICAgICAvLyBTY29yZSBsYWJlbFxuICAgICAgICB0aGlzLnNjb3JlTGFiZWxJbWFnZSA9IHRoaXMuZ2FtZS5hZGQuc3ByaXRlKFxuICAgICAgICAgIHRoaXMucGFkZGluZyxcbiAgICAgICAgICB0aGlzLnBhZGRpbmcgKiAwLjg1LCBcImdhbWUtc3ByaXRlc1wiLCBcInlvdXItc2NvcmUucG5nXCIpO1xuICAgICAgICB0aGlzLnNjb3JlTGFiZWxJbWFnZS5hbmNob3Iuc2V0VG8oMCwgMCk7XG4gICAgICAgIHRoaXMuc2NvcmVMYWJlbEltYWdlLnNjYWxlLnNldFRvKCh0aGlzLmdhbWUud2lkdGggLyA2KSAvIHRoaXMuc2NvcmVMYWJlbEltYWdlLndpZHRoKTtcbiAgICAgICAgdGhpcy5zY29yZUdyb3VwLmFkZCh0aGlzLnNjb3JlTGFiZWxJbWFnZSk7XG5cbiAgICAgICAgLy8gU2NvcmUgdGV4dFxuICAgICAgICB0aGlzLnNjb3JlVGV4dCA9IHRoaXMuZ2FtZS5hZGQudGV4dChcbiAgICAgICAgICB0aGlzLnNjb3JlTGFiZWxJbWFnZS53aWR0aCArICh0aGlzLnBhZGRpbmcgKiAyKSxcbiAgICAgICAgICB0aGlzLnBhZGRpbmcgKiAwLjI1LFxuICAgICAgICAgIHRoaXMuc2NvcmUudG9Mb2NhbGVTdHJpbmcoKSwge1xuICAgICAgICAgICAgZm9udDogXCJib2xkIFwiICsgKHRoaXMuZ2FtZS53b3JsZC5oZWlnaHQgLyA0MCkgKyBcInB4IERvc2lzXCIsXG4gICAgICAgICAgICBmaWxsOiBcIiMzOWI1NGFcIixcbiAgICAgICAgICAgIGFsaWduOiBcImxlZnRcIixcbiAgICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5zY29yZVRleHQuYW5jaG9yLnNldFRvKDAsIDApO1xuICAgICAgICB0aGlzLnNjb3JlR3JvdXAuYWRkKHRoaXMuc2NvcmVUZXh0KTtcblxuICAgICAgICB0aGlzLnNjb3JlR3JvdXAuZml4ZWRUb0NhbWVyYSA9IHRydWU7XG4gICAgICAgIHRoaXMuc2NvcmVHcm91cC5jYW1lcmFPZmZzZXQuc2V0VG8odGhpcy5wYWRkaW5nLCB0aGlzLnBhZGRpbmcpO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHRoaXMuc2NvcmVUZXh0LnRleHQgPSB0aGlzLnNjb3JlLnRvTG9jYWxlU3RyaW5nKCk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIC8vIFJlc2V0IHNjb3JlXG4gICAgcmVzZXRTY29yZTogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnNjb3JlVXAgPSAwO1xuICAgICAgdGhpcy5zY29yZUNvbGxlY3QgPSAwO1xuICAgICAgdGhpcy5zY29yZSA9IDA7XG4gICAgfSxcblxuICAgIC8vIFJlc2V0IHZpZXcgdHJhY2tpbmdcbiAgICByZXNldFZpZXdUcmFja2luZzogZnVuY3Rpb24oKSB7XG4gICAgICAvLyBDYW1lcmEgYW5kIHBsYXRmb3JtIHRyYWNraW5nIHZhcnNcbiAgICAgIHRoaXMuY2FtZXJhWU1pbiA9IDk5OTk5OTk7XG4gICAgICB0aGlzLnBsYXRmb3JtWU1pbiA9IDk5OTk5OTk7XG4gICAgfSxcblxuICAgIC8vIEdlbmVyYWwgdG91Y2hpbmdcbiAgICBpc1RvdWNoaW5nOiBmdW5jdGlvbihib2R5KSB7XG4gICAgICBpZiAoYm9keSAmJiBib2R5LnRvdWNoKSB7XG4gICAgICAgIHJldHVybiAoYm9keS50b3VjaGluZy51cCB8fCBib2R5LnRvdWNoaW5nLmRvd24gfHxcbiAgICAgICAgICBib2R5LnRvdWNoaW5nLmxlZnQgfHwgYm9keS50b3VjaGluZy5yaWdodCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9LFxuXG4gICAgLy8gRGV0ZXJtaW5lIGRpZmZpY3VsdHlcbiAgICBzZXREaWZmaWN1bHR5OiBmdW5jdGlvbigpIHtcbiAgICAgIC8vIEluaXRpYWwgc3RhdGVcbiAgICAgIHRoaXMucGxhdGZvcm1TcGFjZVkgPSAxMTA7XG4gICAgICB0aGlzLnBsYXRmb3JtR2FwTWF4ID0gMjAwO1xuICAgICAgdGhpcy5ob3ZlckNoYW5jZSA9IDAuMTtcbiAgICAgIHRoaXMuY29pbkNoYW5jZSA9IDAuMztcbiAgICAgIHRoaXMuYm9vc3RDaGFuY2UgPSAwLjM7XG4gICAgICB0aGlzLmJvdENoYW5jZSA9IDAuMDtcbiAgICAgIHRoaXMucGVwcGVyQ2hhbmNlID0gMC4xO1xuXG4gICAgICAvLyBTZXQgaW5pdGlhbCBiYWNrZ3JvdW5kXG4gICAgICB0aGlzLmdhbWUuc3RhZ2UuYmFja2dyb3VuZENvbG9yID0gXCIjOTM3RDZGXCI7XG5cbiAgICAgIC8vIEluaXRpbGEgcGh5c2ljcyB0aW1lXG4gICAgICAvL3RoaXMuZ2FtZS50aW1lLnNsb3dNb3Rpb24gPSAxO1xuXG4gICAgICAvLyBGaXJzdCBsZXZlbFxuICAgICAgaWYgKHRoaXMuY2FtZXJhWU1pbiA+IC0yMDAwMCkge1xuICAgICAgICAvLyBEZWZhdWx0XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gU2Vjb25kIGxldmVsXG4gICAgICBlbHNlIGlmICh0aGlzLmNhbWVyYVlNaW4gPiAtNDAwMDApIHtcbiAgICAgICAgdGhpcy5ob3ZlckNoYW5jZSA9IDAuMztcbiAgICAgICAgdGhpcy5jb2luQ2hhbmNlID0gMC4zO1xuICAgICAgICB0aGlzLmJvb3N0Q2hhbmNlID0gMC40O1xuICAgICAgICB0aGlzLmJvdENoYW5jZSA9IDAuMjtcbiAgICAgICAgdGhpcy5nYW1lLnN0YWdlLmJhY2tncm91bmRDb2xvciA9IFwiI0JEREVCNlwiO1xuICAgICAgfVxuXG4gICAgICAvLyBUaGlyZCBsZXZlbFxuICAgICAgZWxzZSBpZiAodGhpcy5jYW1lcmFZTWluID4gLTYwMDAwKSB7XG4gICAgICAgIHRoaXMuaG92ZXJDaGFuY2UgPSAwLjQ7XG4gICAgICAgIHRoaXMuY29pbkNoYW5jZSA9IDAuMjtcbiAgICAgICAgdGhpcy5ib29zdENoYW5jZSA9IDAuNDtcbiAgICAgICAgdGhpcy5ib3RDaGFuY2UgPSAwLjM7XG4gICAgICAgIHRoaXMuZ2FtZS5zdGFnZS5iYWNrZ3JvdW5kQ29sb3IgPSBcIiNCMUUwRUNcIjtcbiAgICAgIH1cblxuICAgICAgLy8gRm91cnRoIGxldmVsXG4gICAgICBlbHNlIGlmICh0aGlzLmNhbWVyYVlNaW4gPiAtODAwMDApIHtcbiAgICAgICAgdGhpcy5iZ0dyb3VwLnZpc2libGUgPSB0cnVlO1xuICAgICAgICB0aGlzLmhvdmVyQ2hhbmNlID0gMC40O1xuICAgICAgICB0aGlzLmNvaW5DaGFuY2UgPSAwLjI7XG4gICAgICAgIHRoaXMuYm9vc3RDaGFuY2UgPSAwLjQ7XG4gICAgICAgIHRoaXMuYm90Q2hhbmNlID0gMC4zO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICAvLyBDcmVhdGUgc3VwZXIgbGV2ZWwgZ3JhZGllbnRcbiAgICBjcmVhdGVTdXBlckxldmVsQkc6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zbGJnQk0gPSB0aGlzLmdhbWUubWFrZS5iaXRtYXBEYXRhKHRoaXMuZ2FtZS53aWR0aCwgdGhpcy5nYW1lLmhlaWdodCk7XG5cbiAgICAgIC8vIENyZWF0ZSBncmFkaWVudFxuICAgICAgdmFyIGdyYWRpZW50ID0gdGhpcy5zbGJnQk0uY29udGV4dC5jcmVhdGVMaW5lYXJHcmFkaWVudChcbiAgICAgICAgMCwgdGhpcy5nYW1lLmhlaWdodCAvIDIsIHRoaXMuZ2FtZS53aWR0aCwgdGhpcy5nYW1lLmhlaWdodCAvIDIpO1xuICAgICAgZ3JhZGllbnQuYWRkQ29sb3JTdG9wKDAsIFwiIzRGM0Y5QVwiKTtcbiAgICAgIGdyYWRpZW50LmFkZENvbG9yU3RvcCgxLCBcIiNFNzBCOERcIik7XG5cbiAgICAgIC8vIEFkZCB0byBiaXRtYXBcbiAgICAgIHRoaXMuc2xiZ0JNLmNvbnRleHQuZmlsbFN0eWxlID0gZ3JhZGllbnQ7XG4gICAgICB0aGlzLnNsYmdCTS5jb250ZXh0LmZpbGxSZWN0KDAsIDAsIHRoaXMuZ2FtZS53aWR0aCwgdGhpcy5nYW1lLmhlaWdodCk7XG5cbiAgICAgIC8vIENyZWF0ZSBiYWNrZ3JvdW5kIGdyb3VwIHNvIHRoYXQgd2UgY2FuIHB1dCB0aGlzIHRoZXJlIGxhdGVyXG4gICAgICB0aGlzLmJnR3JvdXAgPSB0aGlzLmdhbWUuYWRkLmdyb3VwKCk7XG4gICAgICB0aGlzLmJnR3JvdXAuZml4ZWRUb0NhbWVyYSA9IHRydWU7XG5cbiAgICAgIC8vIEFkZCBjcmF6eSBiYWNrZ3JvdW5kIGFuZCB0aGVuIGhpZGUgc2luY2UgYWRkaW5nIGluIG1pZGRsZVxuICAgICAgLy8gcmVhbGx5IG1lc3NlcyB3aXRoIHRoaW5nc1xuICAgICAgdGhpcy5iZ0dyb3VwLmNyZWF0ZSgwLCAwLCB0aGlzLnNsYmdCTSk7XG4gICAgICB0aGlzLmJnR3JvdXAudmlzaWJsZSA9IGZhbHNlO1xuICAgIH0sXG5cbiAgICAvLyBTZXQgb24gZmlyZVxuICAgIHNldE9uRmlyZTogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLm9uRmlyZSA9IHRydWU7XG4gICAgICB0aGlzLmhlcm8uc2V0T25GaXJlKCk7XG4gICAgfSxcblxuICAgIC8vIFNldCBvZmYgZmlyZVxuICAgIHB1dE91dEZpcmU6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5vbkZpcmUgPSBmYWxzZTtcbiAgICAgIHRoaXMuaGVyby5wdXRPdXRGaXJlKCk7XG4gICAgfVxuICB9KTtcblxuICAvLyBFeHBvcnRcbiAgbW9kdWxlLmV4cG9ydHMgPSBQbGF5O1xufSkoKTtcbiJdfQ==
