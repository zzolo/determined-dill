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

},{"./pickle-jumper/state-gameover.js":10,"./pickle-jumper/state-menu.js":11,"./pickle-jumper/state-play.js":12}],2:[function(require,module,exports){
/* global _:false, Phaser:false */

/**
 * Prefab bean platform
 */

(function() {
  "use strict";

  // Constructor
  var Bean = function(game, x, y) {
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
    this.body.checkCollision.up = true;
    this.body.checkCollision.down = false;
    this.body.checkCollision.left = false;
    this.body.checkCollision.right = false;

    // Determine anchor x bounds
    this.paddingX = 10;
    this.getAnchorBoundsX();
  };

  // Extend from Sprite
  Bean.prototype = Object.create(Phaser.Sprite.prototype);
  Bean.prototype.constructor = Bean;

  // Add methods
  _.extend(Bean.prototype, {
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
  module.exports = Bean;
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
    },

    // Reset image
    resetImage: function() {
      this.height = this.originalHeight;
      this.width = this.originalWidth;
      this.alpha = 1;
    },

    // Murdered (not just kill)
    murder: function() {
      // Get original height
      this.originalHeight = this.height;
      this.originalWidth = this.width;

      var tween = this.game.add.tween(this).to({
        height: 0,
        width: 0,
        alpha: 0
      }, 200, Phaser.Easing.Linear.None, true);

      tween.onComplete.add(_.bind(function() {
        this.resetImage();
        this.kill();
      }, this));
    }
  });

  // Export
  module.exports = Botulism;
})();

},{}],4:[function(require,module,exports){
/* global _:false, Phaser:false */

/**
 * Prefab platform
 */

(function() {
  "use strict";

  // Constructor
  var Carrot = function(game, x, y) {
    // Call default sprite
    Phaser.Sprite.call(this, game, x, y, "carrot-sprites", "carrot-snap-01.png");

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
    this.body.checkCollision.up = true;
    this.body.checkCollision.down = false;
    this.body.checkCollision.left = false;
    this.body.checkCollision.right = false;

    // Determine anchor x bounds
    this.paddingX = 10;
    this.getAnchorBoundsX();

    // Setup animations
    var snapFrames = Phaser.Animation.generateFrameNames("carrot-snap-", 1, 5, ".png", 2);
    this.snapAnimation = this.animations.add("snap", snapFrames);
    this.snapAnimation.onComplete.add(this.snapped, this);
  };

  // Extend from Sprite
  Carrot.prototype = Object.create(Phaser.Sprite.prototype);
  Carrot.prototype.constructor = Carrot;

  // Add methods
  _.extend(Carrot.prototype, {
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
      this.resetImage();
      this.reset(0, 0);
      this.body.velocity.x = 0;
      this.hover = false;
      this.getAnchorBoundsX();
    },

    // Reset image
    resetImage: function() {
      this.alpha = 1;
      this.loadTexture("carrot-sprites", "carrot-snap-01.png");
    },

    // Snap carrot
    snap: function() {
      this.animations.play("snap", 15, false, false);
    },

    // Snapped
    snapped: function() {
      var tween = this.game.add.tween(this).to({
        alpha: 0
      }, 200, Phaser.Easing.Linear.None, true);
      tween.onComplete.add(_.bind(function() {
        this.resetImage();
        this.kill();
      }, this));
    }
  });

  // Export
  module.exports = Carrot;
})();

},{}],5:[function(require,module,exports){
/* global _:false, Phaser:false */

/**
 * Prefab (objects) Dill for boosting
 */

(function() {
  "use strict";

  // Constructor
  var Dill = function(game, x, y) {
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
  Dill.prototype = Object.create(Phaser.Sprite.prototype);
  Dill.prototype.constructor = Dill;

  // Add methods
  _.extend(Dill.prototype, {
    update: function() {

    }
  });

  // Export
  module.exports = Dill;
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
    Phaser.Sprite.call(this, game, x, y, "pickle-sprites", "pickle-jump-02.png");

    // Configure
    this.anchor.setTo(0.5);
    this.originalScale = (this.game.width / 22) / this.width;
    this.scale.setTo(this.originalScale);
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
      this.scale.setTo(this.originalScale * 1.5);
    },

    // Off fire
    putOutFire: function() {
      this.scale.setTo(this.originalScale);
      this.onFire = false;
    }
  });

  // Export
  module.exports = Hero;
})();

},{}],7:[function(require,module,exports){
/* global _:false, Phaser:false */

/**
 * Prefab jar platform
 */

(function() {
  "use strict";

  // Constructor
  var Jar = function(game, x, y) {
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
  Jar.prototype = Object.create(Phaser.Sprite.prototype);
  Jar.prototype.constructor = Jar;

  // Add methods
  _.extend(Jar.prototype, {
    update: function() {
    }
  });

  // Export
  module.exports = Jar;
})();

},{}],8:[function(require,module,exports){
/* global _:false, Phaser:false */

/**
 * Prefab mini pickle (kind of like a coin, just points)
 */

(function() {
  "use strict";

  // Constructor
  var Mini = function(game, x, y) {
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
  Mini.prototype = Object.create(Phaser.Sprite.prototype);
  Mini.prototype.constructor = Mini;

  // Add methods
  _.extend(Mini.prototype, {
    update: function() {

    }
  });

  // Export
  module.exports = Mini;
})();

},{}],9:[function(require,module,exports){
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

},{}],10:[function(require,module,exports){
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

},{}],11:[function(require,module,exports){
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

},{}],12:[function(require,module,exports){
/* global _:false, Phaser:false */

/**
 * Play state
 */

(function() {
  "use strict";

  // Dependencies
  var prefabs = {
    Dill: require("./prefab-dill.js"),
    Pepper: require("./prefab-pepper.js"),
    Botulism: require("./prefab-botulism.js"),
    Mini: require("./prefab-mini.js"),
    Hero: require("./prefab-hero.js"),
    Bean: require("./prefab-bean.js"),
    Carrot: require("./prefab-carrot.js"),
    Jar: require("./prefab-jar.js")
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
      this.updateDifficulty();

      // Scoring
      this.scoreMini = 100;
      this.scoreDill = 500;
      this.scorePepper = 750;
      this.scoreBot = 1000;

      // Spacing
      this.padding = 10;

      // Determine where first platform and hero will be.
      this.startY = this.game.height - 5;

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

      // Containers
      this.beans = this.game.add.group();
      this.carrots = this.game.add.group();
      this.minis = this.game.add.group();
      this.dills = this.game.add.group();
      this.peppers = this.game.add.group();
      this.bots = this.game.add.group();

      // Platforms
      this.addPlatforms();

      // Add hero here so is always on top.
      this.hero = new prefabs.Hero(this.game, 0, 0);
      this.hero.resetPlacement(this.game.width * 0.5, this.startY - this.hero.height - 50);
      this.game.add.existing(this.hero);

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

      // Collisions
      this.updateCollisions();

      // Items (platforms and items)
      this.updateItems();

      // Update score
      this.updateScore();

      // Update difficult
      this.updateDifficulty();

      // Debug
      if (this.game.pickle.options.debug) {
        this.game.debug.body(this.hero);
      }
    },

    // Handle collisions
    updateCollisions: function() {
      // Platform collisions
      this.game.physics.arcade.collide(this.hero, this.beans, this.updateHeroPlatform, null, this);
      this.game.physics.arcade.collide(this.hero, this.carrots, this.updateHeroPlatform, null, this);
      this.game.physics.arcade.collide(this.hero, this.base, this.updateHeroPlatform, null, this);

      // Mini collisions
      this.game.physics.arcade.overlap(this.hero, this.minis, function(hero, mini) {
        mini.kill();
        this.updateScore(this.scoreMini);
      }, null, this);

      // Dill collisions.  Don't do anything if on fire
      if (!this.onFire) {
        this.game.physics.arcade.overlap(this.hero, this.dills, function(hero, dill) {
          dill.kill();
          this.updateScore(this.scoreDill);
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

      // Botulism collisions.  If hero jumps on top, then kill, otherwise die, and
      // ignore if on fire.
      if (!this.onFire) {
        this.game.physics.arcade.collide(this.hero, this.bots, function(hero, bot) {
          if (hero.body.touching.down) {
            bot.murder();
            this.updateScore(this.scoreBot);
            hero.body.velocity.y = this.game.physics.arcade.gravity.y * -1 * 0.5;
          }
          else {
            this.gameOver();
          }
        }, null, this);
      }
    },

    // Platform collision
    updateHeroPlatform: function(hero, item) {
      // Make sure no longer on fire
      this.putOutFire();

      // Jump
      hero.body.velocity.y = this.game.physics.arcade.gravity.y * -1 * 0.7;

      // If carrot, snap
      if (item instanceof prefabs.Carrot) {
        item.snap();
      }
    },

    // Handle items
    updateItems: function() {
      var highest;
      var bean;
      var carrot;

      // Remove any items that are off screen
      ["minis", "dills", "bots", "peppers", "beans", "carrots"].forEach(_.bind(function(pool) {
        this[pool].forEachAlive(function(p) {
          // Check if this one is of the screen
          if (p.y > this.camera.y + this.game.height) {
            p.kill();
          }
        }, this);
      }, this));

      // Determine where the last platform is
      ["beans", "carrots"].forEach(_.bind(function(group) {
        this[group].forEachAlive(function(p) {
          if (p.y < this.platformYMin) {
            this.platformYMin = p.y;
            highest = p;
          }
        }, this);
      }, this));

      // Add new platform if needed
      carrot = this.carrots.getFirstDead();
      bean = this.beans.getFirstDead();
      if (carrot && bean) {
        if (Math.random() < this.carrotChance) {
          this.placePlatform(carrot, highest);
        }
        else {
          this.placePlatform(bean, highest);
        }
      }
    },

    // Shutdown
    shutdown: function() {
      // Reset everything, or the world will be messed up
      this.world.setBounds(0, 0, this.game.width, this.game.height);
      this.cursor = null;
      this.resetViewTracking();
      this.resetScore();

      ["hero", "beans", "minis", "dills", "peppers",
        "carrots", "scoreGroup"].forEach(_.bind(function(item) {
        if (this[item]) {
          this[item].destroy();
          this[item] = null;
        }
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
      // Add base platform (jar).
      this.base = new prefabs.Jar(this.game, this.game.width * 0.5, this.startY, this.game.width * 2);
      this.game.add.existing(this.base);

      // Add some base carrots (but have them off screen)
      _.each(_.range(10), _.bind(function() {
        var p = new prefabs.Carrot(this.game, -999, this.game.height * 2);
        this.carrots.add(p);
      }, this));

      // Add some base beans
      var previous;
      _.each(_.range(20), _.bind(function(i) {
        var p = new prefabs.Bean(this.game, 0, 0);
        this.placePlatform(p, previous, this.world.height - this.platformSpaceY - this.platformSpaceY * i);
        this.beans.add(p);
        previous = p;
      }, this));
    },

    // Place platform
    placePlatform: function(platform, previousPlatform, overrideY, platformType) {
      platform.resetSettings();
      platformType = (platformType === undefined) ? "bean" : platformType;
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
      else if (Math.random() <= this.miniChance) {
        this.addWithPool(this.minis, "Mini", x, y);
      }
      else if (Math.random() <= this.dillChance) {
        this.addWithPool(this.dills, "Dill", x, y);
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
    updateDifficulty: function() {
      // Initial state
      this.platformSpaceY = 110;
      this.platformGapMax = 200;
      this.hoverChance = 0.1;
      this.miniChance = 0.3;
      this.dillChance = 0.3;
      this.botChance = 1;
      this.pepperChance = 0.1;
      this.carrotChance = 0.5;

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
        this.miniChance = 0.3;
        this.dillChance = 0.4;
        this.botChance = 0.2;
        this.game.stage.backgroundColor = "#BDDEB6";
      }

      // Third level
      else if (this.cameraYMin > -60000) {
        this.hoverChance = 0.4;
        this.miniChance = 0.2;
        this.dillChance = 0.4;
        this.botChance = 0.3;
        this.game.stage.backgroundColor = "#B1E0EC";
      }

      // Fourth level
      else if (this.cameraYMin > -80000) {
        this.bgGroup.visible = true;
        this.hoverChance = 0.4;
        this.miniChance = 0.2;
        this.dillChance = 0.4;
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

},{"./prefab-bean.js":2,"./prefab-botulism.js":3,"./prefab-carrot.js":4,"./prefab-dill.js":5,"./prefab-hero.js":6,"./prefab-jar.js":7,"./prefab-mini.js":8,"./prefab-pepper.js":9}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy96em9sby9Db2RlL3BlcnNvbmFsL3BpY2tsZS1qdW1wZXIvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIi9Vc2Vycy96em9sby9Db2RlL3BlcnNvbmFsL3BpY2tsZS1qdW1wZXIvanMvZmFrZV9jZTU3ZDI4MC5qcyIsIi9Vc2Vycy96em9sby9Db2RlL3BlcnNvbmFsL3BpY2tsZS1qdW1wZXIvanMvcGlja2xlLWp1bXBlci9wcmVmYWItYmVhbi5qcyIsIi9Vc2Vycy96em9sby9Db2RlL3BlcnNvbmFsL3BpY2tsZS1qdW1wZXIvanMvcGlja2xlLWp1bXBlci9wcmVmYWItYm90dWxpc20uanMiLCIvVXNlcnMvenpvbG8vQ29kZS9wZXJzb25hbC9waWNrbGUtanVtcGVyL2pzL3BpY2tsZS1qdW1wZXIvcHJlZmFiLWNhcnJvdC5qcyIsIi9Vc2Vycy96em9sby9Db2RlL3BlcnNvbmFsL3BpY2tsZS1qdW1wZXIvanMvcGlja2xlLWp1bXBlci9wcmVmYWItZGlsbC5qcyIsIi9Vc2Vycy96em9sby9Db2RlL3BlcnNvbmFsL3BpY2tsZS1qdW1wZXIvanMvcGlja2xlLWp1bXBlci9wcmVmYWItaGVyby5qcyIsIi9Vc2Vycy96em9sby9Db2RlL3BlcnNvbmFsL3BpY2tsZS1qdW1wZXIvanMvcGlja2xlLWp1bXBlci9wcmVmYWItamFyLmpzIiwiL1VzZXJzL3p6b2xvL0NvZGUvcGVyc29uYWwvcGlja2xlLWp1bXBlci9qcy9waWNrbGUtanVtcGVyL3ByZWZhYi1taW5pLmpzIiwiL1VzZXJzL3p6b2xvL0NvZGUvcGVyc29uYWwvcGlja2xlLWp1bXBlci9qcy9waWNrbGUtanVtcGVyL3ByZWZhYi1wZXBwZXIuanMiLCIvVXNlcnMvenpvbG8vQ29kZS9wZXJzb25hbC9waWNrbGUtanVtcGVyL2pzL3BpY2tsZS1qdW1wZXIvc3RhdGUtZ2FtZW92ZXIuanMiLCIvVXNlcnMvenpvbG8vQ29kZS9wZXJzb25hbC9waWNrbGUtanVtcGVyL2pzL3BpY2tsZS1qdW1wZXIvc3RhdGUtbWVudS5qcyIsIi9Vc2Vycy96em9sby9Db2RlL3BlcnNvbmFsL3BpY2tsZS1qdW1wZXIvanMvcGlja2xlLWp1bXBlci9zdGF0ZS1wbGF5LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM1VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qIGdsb2JhbCBfOmZhbHNlLCAkOmZhbHNlLCBQaGFzZXI6ZmFsc2UgKi9cblxuLyoqXG4gKiBNYWluIEpTIGZvciBQaWNrbGUgSnVtcGVyXG4gKi9cblxuKGZ1bmN0aW9uKCkge1xuICBcInVzZSBzdHJpY3RcIjtcblxuICAvLyBEZXBlbmRlbmNpZXNcbiAgdmFyIHN0YXRlcyA9IHtcbiAgICBHYW1lb3ZlcjogcmVxdWlyZShcIi4vcGlja2xlLWp1bXBlci9zdGF0ZS1nYW1lb3Zlci5qc1wiKSxcbiAgICBQbGF5OiByZXF1aXJlKFwiLi9waWNrbGUtanVtcGVyL3N0YXRlLXBsYXkuanNcIiksXG4gICAgTWVudTogcmVxdWlyZShcIi4vcGlja2xlLWp1bXBlci9zdGF0ZS1tZW51LmpzXCIpLFxuICB9O1xuXG4gIC8vIENvbnN0cnVjdG9yZSBmb3IgUGlja2xlXG4gIHZhciBQaWNrbGUgPSB3aW5kb3cuUGlja2xlID0gZnVuY3Rpb24ob3B0aW9ucykge1xuICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG4gICAgdGhpcy5lbCA9IHRoaXMub3B0aW9ucy5lbDtcbiAgICB0aGlzLiRlbCA9ICQodGhpcy5vcHRpb25zLmVsKTtcbiAgICB0aGlzLiQgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiAkKG9wdGlvbnMuZWwpLmZpbmQ7XG4gICAgfTtcblxuICAgIHRoaXMud2lkdGggPSB0aGlzLiRlbC53aWR0aCgpO1xuICAgIHRoaXMuaGVpZ2h0ID0gJCh3aW5kb3cpLmhlaWdodCgpO1xuXG4gICAgLy8gU3RhcnRcbiAgICB0aGlzLnN0YXJ0KCk7XG4gIH07XG5cbiAgLy8gQWRkIHByb3BlcnRpZXNcbiAgXy5leHRlbmQoUGlja2xlLnByb3RvdHlwZSwge1xuICAgIC8vIFN0YXJ0IGV2ZXJ5dGhpbmdcbiAgICBzdGFydDogZnVuY3Rpb24oKSB7XG4gICAgICAvLyBDcmVhdGUgUGhhc2VyIGdhbWVcbiAgICAgIHRoaXMuZ2FtZSA9IG5ldyBQaGFzZXIuR2FtZShcbiAgICAgICAgdGhpcy53aWR0aCxcbiAgICAgICAgdGhpcy5oZWlnaHQsXG4gICAgICAgIFBoYXNlci5BVVRPLFxuICAgICAgICB0aGlzLmVsLnJlcGxhY2UoXCIjXCIsIFwiXCIpKTtcblxuICAgICAgLy8gQWRkIHJlZmVyZW5jZSB0byBnYW1lLCBzaW5jZSBtb3N0IHBhcnRzIGhhdmUgdGhpcyByZWZlcmVuY2VcbiAgICAgIC8vIGFscmVhZHlcbiAgICAgIHRoaXMuZ2FtZS5waWNrbGUgPSB0aGlzO1xuXG4gICAgICAvLyBSZWdpc3RlciBzdGF0ZXNcbiAgICAgIHRoaXMuZ2FtZS5zdGF0ZS5hZGQoXCJtZW51XCIsIHN0YXRlcy5NZW51KTtcbiAgICAgIHRoaXMuZ2FtZS5zdGF0ZS5hZGQoXCJwbGF5XCIsIHN0YXRlcy5QbGF5KTtcbiAgICAgIHRoaXMuZ2FtZS5zdGF0ZS5hZGQoXCJnYW1lb3ZlclwiLCBzdGF0ZXMuR2FtZW92ZXIpO1xuXG4gICAgICAvLyBIaWdoc2NvcmVcbiAgICAgIHRoaXMuaGlnaHNjb3JlTGltaXQgPSAxMDtcbiAgICAgIHRoaXMuZ2V0SGlnaHNjb3JlcygpO1xuXG4gICAgICAvLyBTdGFydCB3aXRoIG1lbnVcbiAgICAgIHRoaXMuZ2FtZS5zdGF0ZS5zdGFydChcIm1lbnVcIik7XG5cbiAgICAgIC8vIERlYnVnXG4gICAgICBpZiAodGhpcy5vcHRpb25zLmRlYnVnKSB7XG4gICAgICAgIHRoaXMucmVzZXRIaWdoc2NvcmVzKCk7XG4gICAgICAgIHRoaXMuZ2V0SGlnaHNjb3JlcygpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICAvLyBHZXQgaGlnaCBzY29yZXNcbiAgICBnZXRIaWdoc2NvcmVzOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBzID0gd2luZG93LmxvY2FsU3RvcmFnZS5nZXRJdGVtKFwiaGlnaHNjb3Jlc1wiKTtcbiAgICAgIHMgPSAocykgPyBKU09OLnBhcnNlKHMpIDogW107XG4gICAgICB0aGlzLmhpZ2hzY29yZXMgPSBzO1xuICAgICAgdGhpcy5zb3J0SGlnaHNjb3JlcygpO1xuICAgICAgcmV0dXJuIHRoaXMuaGlnaHNjb3JlcztcbiAgICB9LFxuXG4gICAgLy8gR2V0IGhpZ2hlc3Qgc2NvcmVcbiAgICBnZXRIaWdoc2NvcmU6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIF8ubWF4KHRoaXMuaGlnaHNjb3JlcywgXCJzY29yZVwiKTtcbiAgICB9LFxuXG4gICAgLy8gU2V0IHNpbmdsZSBoaWdoc2NvcmVcbiAgICBzZXRIaWdoc2NvcmU6IGZ1bmN0aW9uKHNjb3JlLCBuYW1lKSB7XG4gICAgICBpZiAodGhpcy5pc0hpZ2hzY29yZShzY29yZSkpIHtcbiAgICAgICAgdGhpcy5zb3J0SGlnaHNjb3JlcygpO1xuXG4gICAgICAgIC8vIFJlbW92ZSBsb3dlc3Qgb25lIGlmIG5lZWRlZFxuICAgICAgICBpZiAodGhpcy5oaWdoc2NvcmVzLmxlbmd0aCA+PSB0aGlzLmhpZ2hzY29yZUxpbWl0KSB7XG4gICAgICAgICAgdGhpcy5oaWdoc2NvcmVzLnNoaWZ0KCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBBZGQgbmV3IHNjb3JlXG4gICAgICAgIHRoaXMuaGlnaHNjb3Jlcy5wdXNoKHtcbiAgICAgICAgICBuYW1lOiBuYW1lLFxuICAgICAgICAgIHNjb3JlOiBzY29yZVxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBTb3J0IGFuZCBzZXRcbiAgICAgICAgdGhpcy5zb3J0SGlnaHNjb3JlcygpO1xuICAgICAgICB0aGlzLnNldEhpZ2hzY29yZXMoKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLy8gU29ydCBoaWdoc2NvcmVzXG4gICAgc29ydEhpZ2hzY29yZXM6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5oaWdoc2NvcmVzID0gXy5zb3J0QnkodGhpcy5oaWdoc2NvcmVzLCBcInNjb3JlXCIpO1xuICAgIH0sXG5cbiAgICAvLyBJcyBoaWdoc2NvcmUuICBJcyB0aGUgc2NvcmUgaGlnaGVyIHRoYW4gdGhlIGxvd2VzdFxuICAgIC8vIHJlY29yZGVkIHNjb3JlXG4gICAgaXNIaWdoc2NvcmU6IGZ1bmN0aW9uKHNjb3JlKSB7XG4gICAgICB2YXIgbWluID0gXy5taW4odGhpcy5oaWdoc2NvcmVzLCBcInNjb3JlXCIpLnNjb3JlO1xuICAgICAgcmV0dXJuIChzY29yZSA+IG1pbiB8fCB0aGlzLmhpZ2hzY29yZXMubGVuZ3RoIDwgdGhpcy5oaWdoc2NvcmVMaW1pdCk7XG4gICAgfSxcblxuICAgIC8vIENoZWNrIGlmIHNjb3JlIGlzIGhpZ2hlc3Qgc2NvcmVcbiAgICBpc0hpZ2hlc3RTY29yZTogZnVuY3Rpb24oc2NvcmUpIHtcbiAgICAgIHZhciBtYXggPSBfLm1heCh0aGlzLmhpZ2hzY29yZXMsIFwic2NvcmVcIikuc2NvcmUgfHwgMDtcbiAgICAgIHJldHVybiAoc2NvcmUgPiBtYXgpO1xuICAgIH0sXG5cbiAgICAvLyBTZXQgaGlnaHNjb3Jlc1xuICAgIHNldEhpZ2hzY29yZXM6IGZ1bmN0aW9uKCkge1xuICAgICAgd2luZG93LmxvY2FsU3RvcmFnZS5zZXRJdGVtKFwiaGlnaHNjb3Jlc1wiLCBKU09OLnN0cmluZ2lmeSh0aGlzLmhpZ2hzY29yZXMpKTtcbiAgICB9LFxuXG4gICAgLy8gUmVzZXQgaGlnaHNjaG9yZXNcbiAgICByZXNldEhpZ2hzY29yZXM6IGZ1bmN0aW9uKCkge1xuICAgICAgd2luZG93LmxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKFwiaGlnaHNjb3Jlc1wiKTtcbiAgICB9XG4gIH0pO1xuXG4gIC8vIENyZWF0ZSBhcHBcbiAgdmFyIHA7XG4gIHAgPSBuZXcgUGlja2xlKHtcbiAgICBlbDogXCIjcGlja2xlLWp1bXBlclwiLFxuICAgIGRlYnVnOiBmYWxzZVxuICB9KTtcbn0pKCk7XG4iLCIvKiBnbG9iYWwgXzpmYWxzZSwgUGhhc2VyOmZhbHNlICovXG5cbi8qKlxuICogUHJlZmFiIGJlYW4gcGxhdGZvcm1cbiAqL1xuXG4oZnVuY3Rpb24oKSB7XG4gIFwidXNlIHN0cmljdFwiO1xuXG4gIC8vIENvbnN0cnVjdG9yXG4gIHZhciBCZWFuID0gZnVuY3Rpb24oZ2FtZSwgeCwgeSkge1xuICAgIC8vIENhbGwgZGVmYXVsdCBzcHJpdGVcbiAgICBQaGFzZXIuU3ByaXRlLmNhbGwodGhpcywgZ2FtZSwgeCwgeSwgXCJnYW1lLXNwcml0ZXNcIiwgXCJkaWxseWJlYW4ucG5nXCIpO1xuXG4gICAgLy8gQ29uZmlndXJlXG4gICAgdGhpcy5hbmNob3Iuc2V0VG8oMC41LCAwLjUpO1xuICAgIHRoaXMuc2NhbGUuc2V0VG8oKHRoaXMuZ2FtZS53aWR0aCAvIDUpIC8gdGhpcy53aWR0aCk7XG4gICAgdGhpcy5ob3ZlciA9IGZhbHNlO1xuICAgIHRoaXMuc2V0SG92ZXJTcGVlZCgxMDApO1xuXG4gICAgLy8gUGh5c2ljc1xuICAgIHRoaXMuZ2FtZS5waHlzaWNzLmFyY2FkZS5lbmFibGVCb2R5KHRoaXMpO1xuICAgIHRoaXMuYm9keS5hbGxvd0dyYXZpdHkgPSBmYWxzZTtcbiAgICB0aGlzLmJvZHkuaW1tb3ZhYmxlID0gdHJ1ZTtcblxuICAgIC8vIE9ubHkgYWxsb3cgZm9yIGNvbGxpc3Npb24gdXBcbiAgICB0aGlzLmJvZHkuY2hlY2tDb2xsaXNpb24udXAgPSB0cnVlO1xuICAgIHRoaXMuYm9keS5jaGVja0NvbGxpc2lvbi5kb3duID0gZmFsc2U7XG4gICAgdGhpcy5ib2R5LmNoZWNrQ29sbGlzaW9uLmxlZnQgPSBmYWxzZTtcbiAgICB0aGlzLmJvZHkuY2hlY2tDb2xsaXNpb24ucmlnaHQgPSBmYWxzZTtcblxuICAgIC8vIERldGVybWluZSBhbmNob3IgeCBib3VuZHNcbiAgICB0aGlzLnBhZGRpbmdYID0gMTA7XG4gICAgdGhpcy5nZXRBbmNob3JCb3VuZHNYKCk7XG4gIH07XG5cbiAgLy8gRXh0ZW5kIGZyb20gU3ByaXRlXG4gIEJlYW4ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQaGFzZXIuU3ByaXRlLnByb3RvdHlwZSk7XG4gIEJlYW4ucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gQmVhbjtcblxuICAvLyBBZGQgbWV0aG9kc1xuICBfLmV4dGVuZChCZWFuLnByb3RvdHlwZSwge1xuICAgIHVwZGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICBpZiAodGhpcy5ob3Zlcikge1xuICAgICAgICB0aGlzLmJvZHkudmVsb2NpdHkueCA9IHRoaXMuYm9keS52ZWxvY2l0eS54IHx8IHRoaXMuaG92ZXJTcGVlZDtcbiAgICAgICAgdGhpcy5ib2R5LnZlbG9jaXR5LnggPSAodGhpcy54IDw9IHRoaXMubWluWCkgPyB0aGlzLmhvdmVyU3BlZWQgOlxuICAgICAgICAgICh0aGlzLnggPj0gdGhpcy5tYXhYKSA/IC10aGlzLmhvdmVyU3BlZWQgOiB0aGlzLmJvZHkudmVsb2NpdHkueDtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLy8gU2V0IGhvdmVyIHNwZWVkLiAgQWRkIGEgYml0IG9mIHZhcmlhbmNlXG4gICAgc2V0SG92ZXJTcGVlZDogZnVuY3Rpb24oc3BlZWQpIHtcbiAgICAgIHRoaXMuaG92ZXJTcGVlZCA9IHNwZWVkICsgdGhpcy5nYW1lLnJuZC5pbnRlZ2VySW5SYW5nZSgtNTAsIDUwKTtcbiAgICB9LFxuXG4gICAgLy8gR2V0IGFuY2hvciBib3VuZHNcbiAgICBnZXRBbmNob3JCb3VuZHNYOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMubWluWCA9IHRoaXMucGFkZGluZ1ggKyAodGhpcy53aWR0aCAvIDIpO1xuICAgICAgdGhpcy5tYXhYID0gdGhpcy5nYW1lLndpZHRoIC0gKHRoaXMucGFkZGluZ1ggKyAodGhpcy53aWR0aCAvIDIpKTtcbiAgICAgIHJldHVybiBbdGhpcy5taW5YLCB0aGlzLm1heFhdO1xuICAgIH0sXG5cbiAgICAvLyBSZXNldCB0aGluZ3NcbiAgICByZXNldFNldHRpbmdzOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMucmVzZXQoMCwgMCk7XG4gICAgICB0aGlzLmJvZHkudmVsb2NpdHkueCA9IDA7XG4gICAgICB0aGlzLmhvdmVyID0gZmFsc2U7XG4gICAgICB0aGlzLmdldEFuY2hvckJvdW5kc1goKTtcbiAgICB9XG4gIH0pO1xuXG4gIC8vIEV4cG9ydFxuICBtb2R1bGUuZXhwb3J0cyA9IEJlYW47XG59KSgpO1xuIiwiLyogZ2xvYmFsIF86ZmFsc2UsIFBoYXNlcjpmYWxzZSAqL1xuXG4vKipcbiAqIFByZWZhYiBmb3IgQm90dWxpc20sIHRoZSBiYWQgZHVkZXNcbiAqL1xuXG4oZnVuY3Rpb24oKSB7XG4gIFwidXNlIHN0cmljdFwiO1xuXG4gIC8vIENvbnN0cnVjdG9yXG4gIHZhciBCb3R1bGlzbSA9IGZ1bmN0aW9uKGdhbWUsIHgsIHkpIHtcbiAgICAvLyBDYWxsIGRlZmF1bHQgc3ByaXRlXG4gICAgUGhhc2VyLlNwcml0ZS5jYWxsKHRoaXMsIGdhbWUsIHgsIHksIFwiZ2FtZS1zcHJpdGVzXCIsIFwiYm90Y2h5LnBuZ1wiKTtcblxuICAgIC8vIFNpemVcbiAgICB0aGlzLmFuY2hvci5zZXRUbygwLjUsIDAuNSk7XG4gICAgdGhpcy5zY2FsZS5zZXRUbygodGhpcy5nYW1lLndpZHRoIC8gMTApIC8gdGhpcy53aWR0aCk7XG5cbiAgICAvLyBDb25maWd1cmVcbiAgICB0aGlzLmhvdmVyID0gdHJ1ZTtcbiAgICB0aGlzLnNldEhvdmVyU3BlZWQoMTAwKTtcbiAgICB0aGlzLmhvdmVyUmFuZ2UgPSAxMDA7XG5cbiAgICAvLyBQaHlzaWNzXG4gICAgdGhpcy5nYW1lLnBoeXNpY3MuYXJjYWRlLmVuYWJsZUJvZHkodGhpcyk7XG4gICAgdGhpcy5ib2R5LmFsbG93R3Jhdml0eSA9IGZhbHNlO1xuICAgIHRoaXMuYm9keS5pbW1vdmFibGUgPSB0cnVlO1xuXG4gICAgLy8gRGV0ZXJtaW5lIGFuY2hvciB4IGJvdW5kc1xuICAgIHRoaXMucGFkZGluZ1ggPSAxMDtcbiAgICB0aGlzLnJlc2V0UGxhY2VtZW50KHgsIHkpO1xuICB9O1xuXG4gIC8vIEV4dGVuZCBmcm9tIFNwcml0ZVxuICBCb3R1bGlzbS5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFBoYXNlci5TcHJpdGUucHJvdG90eXBlKTtcbiAgQm90dWxpc20ucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gQm90dWxpc207XG5cbiAgLy8gQWRkIG1ldGhvZHNcbiAgXy5leHRlbmQoQm90dWxpc20ucHJvdG90eXBlLCB7XG4gICAgdXBkYXRlOiBmdW5jdGlvbigpIHtcbiAgICAgIC8vIERvIGhvdmVyXG4gICAgICBpZiAodGhpcy5ob3Zlcikge1xuICAgICAgICB0aGlzLmJvZHkudmVsb2NpdHkueCA9IHRoaXMuYm9keS52ZWxvY2l0eS54IHx8IHRoaXMuaG92ZXJTcGVlZDtcbiAgICAgICAgdGhpcy5ib2R5LnZlbG9jaXR5LnggPSAodGhpcy54IDw9IHRoaXMubWluWCkgPyB0aGlzLmhvdmVyU3BlZWQgOlxuICAgICAgICAgICh0aGlzLnggPj0gdGhpcy5tYXhYKSA/IC10aGlzLmhvdmVyU3BlZWQgOiB0aGlzLmJvZHkudmVsb2NpdHkueDtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLy8gU2V0IGhvdmVyIHNwZWVkLiAgQWRkIGEgYml0IG9mIHZhcmlhbmNlXG4gICAgc2V0SG92ZXJTcGVlZDogZnVuY3Rpb24oc3BlZWQpIHtcbiAgICAgIHRoaXMuaG92ZXJTcGVlZCA9IHNwZWVkICsgdGhpcy5nYW1lLnJuZC5pbnRlZ2VySW5SYW5nZSgtMjUsIDI1KTtcbiAgICB9LFxuXG4gICAgLy8gR2V0IGFuY2hvciBib3VuZHMuICBUaGlzIGlzIHJlbGF0aXZlIHRvIHdoZXJlIHRoZSBwbGF0Zm9ybSBpc1xuICAgIGdldEFuY2hvckJvdW5kc1g6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5taW5YID0gTWF0aC5tYXgodGhpcy54IC0gdGhpcy5ob3ZlclJhbmdlLCB0aGlzLnBhZGRpbmdYICsgKHRoaXMud2lkdGggLyAyKSk7XG4gICAgICB0aGlzLm1heFggPSBNYXRoLm1pbih0aGlzLnggKyB0aGlzLmhvdmVyUmFuZ2UsIHRoaXMuZ2FtZS53aWR0aCAtICh0aGlzLnBhZGRpbmdYICsgKHRoaXMud2lkdGggLyAyKSkpO1xuICAgICAgcmV0dXJuIFt0aGlzLm1pblgsIHRoaXMubWF4WF07XG4gICAgfSxcblxuICAgIC8vIFJlc2V0IHRoaW5nc1xuICAgIHJlc2V0UGxhY2VtZW50OiBmdW5jdGlvbih4LCB5KSB7XG4gICAgICB0aGlzLnJlc2V0KHgsIHkpO1xuICAgICAgdGhpcy5ib2R5LnZlbG9jaXR5LnggPSAwO1xuICAgICAgdGhpcy5nZXRBbmNob3JCb3VuZHNYKCk7XG4gICAgfSxcblxuICAgIC8vIFJlc2V0IGltYWdlXG4gICAgcmVzZXRJbWFnZTogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLmhlaWdodCA9IHRoaXMub3JpZ2luYWxIZWlnaHQ7XG4gICAgICB0aGlzLndpZHRoID0gdGhpcy5vcmlnaW5hbFdpZHRoO1xuICAgICAgdGhpcy5hbHBoYSA9IDE7XG4gICAgfSxcblxuICAgIC8vIE11cmRlcmVkIChub3QganVzdCBraWxsKVxuICAgIG11cmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICAvLyBHZXQgb3JpZ2luYWwgaGVpZ2h0XG4gICAgICB0aGlzLm9yaWdpbmFsSGVpZ2h0ID0gdGhpcy5oZWlnaHQ7XG4gICAgICB0aGlzLm9yaWdpbmFsV2lkdGggPSB0aGlzLndpZHRoO1xuXG4gICAgICB2YXIgdHdlZW4gPSB0aGlzLmdhbWUuYWRkLnR3ZWVuKHRoaXMpLnRvKHtcbiAgICAgICAgaGVpZ2h0OiAwLFxuICAgICAgICB3aWR0aDogMCxcbiAgICAgICAgYWxwaGE6IDBcbiAgICAgIH0sIDIwMCwgUGhhc2VyLkVhc2luZy5MaW5lYXIuTm9uZSwgdHJ1ZSk7XG5cbiAgICAgIHR3ZWVuLm9uQ29tcGxldGUuYWRkKF8uYmluZChmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5yZXNldEltYWdlKCk7XG4gICAgICAgIHRoaXMua2lsbCgpO1xuICAgICAgfSwgdGhpcykpO1xuICAgIH1cbiAgfSk7XG5cbiAgLy8gRXhwb3J0XG4gIG1vZHVsZS5leHBvcnRzID0gQm90dWxpc207XG59KSgpO1xuIiwiLyogZ2xvYmFsIF86ZmFsc2UsIFBoYXNlcjpmYWxzZSAqL1xuXG4vKipcbiAqIFByZWZhYiBwbGF0Zm9ybVxuICovXG5cbihmdW5jdGlvbigpIHtcbiAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgLy8gQ29uc3RydWN0b3JcbiAgdmFyIENhcnJvdCA9IGZ1bmN0aW9uKGdhbWUsIHgsIHkpIHtcbiAgICAvLyBDYWxsIGRlZmF1bHQgc3ByaXRlXG4gICAgUGhhc2VyLlNwcml0ZS5jYWxsKHRoaXMsIGdhbWUsIHgsIHksIFwiY2Fycm90LXNwcml0ZXNcIiwgXCJjYXJyb3Qtc25hcC0wMS5wbmdcIik7XG5cbiAgICAvLyBDb25maWd1cmVcbiAgICB0aGlzLmFuY2hvci5zZXRUbygwLjUsIDAuNSk7XG4gICAgdGhpcy5zY2FsZS5zZXRUbygodGhpcy5nYW1lLndpZHRoIC8gNSkgLyB0aGlzLndpZHRoKTtcbiAgICB0aGlzLmhvdmVyID0gZmFsc2U7XG4gICAgdGhpcy5zZXRIb3ZlclNwZWVkKDEwMCk7XG5cbiAgICAvLyBQaHlzaWNzXG4gICAgdGhpcy5nYW1lLnBoeXNpY3MuYXJjYWRlLmVuYWJsZUJvZHkodGhpcyk7XG4gICAgdGhpcy5ib2R5LmFsbG93R3Jhdml0eSA9IGZhbHNlO1xuICAgIHRoaXMuYm9keS5pbW1vdmFibGUgPSB0cnVlO1xuXG4gICAgLy8gT25seSBhbGxvdyBmb3IgY29sbGlzc2lvbiB1cFxuICAgIHRoaXMuYm9keS5jaGVja0NvbGxpc2lvbi51cCA9IHRydWU7XG4gICAgdGhpcy5ib2R5LmNoZWNrQ29sbGlzaW9uLmRvd24gPSBmYWxzZTtcbiAgICB0aGlzLmJvZHkuY2hlY2tDb2xsaXNpb24ubGVmdCA9IGZhbHNlO1xuICAgIHRoaXMuYm9keS5jaGVja0NvbGxpc2lvbi5yaWdodCA9IGZhbHNlO1xuXG4gICAgLy8gRGV0ZXJtaW5lIGFuY2hvciB4IGJvdW5kc1xuICAgIHRoaXMucGFkZGluZ1ggPSAxMDtcbiAgICB0aGlzLmdldEFuY2hvckJvdW5kc1goKTtcblxuICAgIC8vIFNldHVwIGFuaW1hdGlvbnNcbiAgICB2YXIgc25hcEZyYW1lcyA9IFBoYXNlci5BbmltYXRpb24uZ2VuZXJhdGVGcmFtZU5hbWVzKFwiY2Fycm90LXNuYXAtXCIsIDEsIDUsIFwiLnBuZ1wiLCAyKTtcbiAgICB0aGlzLnNuYXBBbmltYXRpb24gPSB0aGlzLmFuaW1hdGlvbnMuYWRkKFwic25hcFwiLCBzbmFwRnJhbWVzKTtcbiAgICB0aGlzLnNuYXBBbmltYXRpb24ub25Db21wbGV0ZS5hZGQodGhpcy5zbmFwcGVkLCB0aGlzKTtcbiAgfTtcblxuICAvLyBFeHRlbmQgZnJvbSBTcHJpdGVcbiAgQ2Fycm90LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUGhhc2VyLlNwcml0ZS5wcm90b3R5cGUpO1xuICBDYXJyb3QucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gQ2Fycm90O1xuXG4gIC8vIEFkZCBtZXRob2RzXG4gIF8uZXh0ZW5kKENhcnJvdC5wcm90b3R5cGUsIHtcbiAgICB1cGRhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKHRoaXMuaG92ZXIpIHtcbiAgICAgICAgdGhpcy5ib2R5LnZlbG9jaXR5LnggPSB0aGlzLmJvZHkudmVsb2NpdHkueCB8fCB0aGlzLmhvdmVyU3BlZWQ7XG4gICAgICAgIHRoaXMuYm9keS52ZWxvY2l0eS54ID0gKHRoaXMueCA8PSB0aGlzLm1pblgpID8gdGhpcy5ob3ZlclNwZWVkIDpcbiAgICAgICAgICAodGhpcy54ID49IHRoaXMubWF4WCkgPyAtdGhpcy5ob3ZlclNwZWVkIDogdGhpcy5ib2R5LnZlbG9jaXR5Lng7XG4gICAgICB9XG4gICAgfSxcblxuICAgIC8vIFNldCBob3ZlciBzcGVlZC4gIEFkZCBhIGJpdCBvZiB2YXJpYW5jZVxuICAgIHNldEhvdmVyU3BlZWQ6IGZ1bmN0aW9uKHNwZWVkKSB7XG4gICAgICB0aGlzLmhvdmVyU3BlZWQgPSBzcGVlZCArIHRoaXMuZ2FtZS5ybmQuaW50ZWdlckluUmFuZ2UoLTUwLCA1MCk7XG4gICAgfSxcblxuICAgIC8vIEdldCBhbmNob3IgYm91bmRzXG4gICAgZ2V0QW5jaG9yQm91bmRzWDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLm1pblggPSB0aGlzLnBhZGRpbmdYICsgKHRoaXMud2lkdGggLyAyKTtcbiAgICAgIHRoaXMubWF4WCA9IHRoaXMuZ2FtZS53aWR0aCAtICh0aGlzLnBhZGRpbmdYICsgKHRoaXMud2lkdGggLyAyKSk7XG4gICAgICByZXR1cm4gW3RoaXMubWluWCwgdGhpcy5tYXhYXTtcbiAgICB9LFxuXG4gICAgLy8gUmVzZXQgdGhpbmdzXG4gICAgcmVzZXRTZXR0aW5nczogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnJlc2V0SW1hZ2UoKTtcbiAgICAgIHRoaXMucmVzZXQoMCwgMCk7XG4gICAgICB0aGlzLmJvZHkudmVsb2NpdHkueCA9IDA7XG4gICAgICB0aGlzLmhvdmVyID0gZmFsc2U7XG4gICAgICB0aGlzLmdldEFuY2hvckJvdW5kc1goKTtcbiAgICB9LFxuXG4gICAgLy8gUmVzZXQgaW1hZ2VcbiAgICByZXNldEltYWdlOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuYWxwaGEgPSAxO1xuICAgICAgdGhpcy5sb2FkVGV4dHVyZShcImNhcnJvdC1zcHJpdGVzXCIsIFwiY2Fycm90LXNuYXAtMDEucG5nXCIpO1xuICAgIH0sXG5cbiAgICAvLyBTbmFwIGNhcnJvdFxuICAgIHNuYXA6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5hbmltYXRpb25zLnBsYXkoXCJzbmFwXCIsIDE1LCBmYWxzZSwgZmFsc2UpO1xuICAgIH0sXG5cbiAgICAvLyBTbmFwcGVkXG4gICAgc25hcHBlZDogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgdHdlZW4gPSB0aGlzLmdhbWUuYWRkLnR3ZWVuKHRoaXMpLnRvKHtcbiAgICAgICAgYWxwaGE6IDBcbiAgICAgIH0sIDIwMCwgUGhhc2VyLkVhc2luZy5MaW5lYXIuTm9uZSwgdHJ1ZSk7XG4gICAgICB0d2Vlbi5vbkNvbXBsZXRlLmFkZChfLmJpbmQoZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMucmVzZXRJbWFnZSgpO1xuICAgICAgICB0aGlzLmtpbGwoKTtcbiAgICAgIH0sIHRoaXMpKTtcbiAgICB9XG4gIH0pO1xuXG4gIC8vIEV4cG9ydFxuICBtb2R1bGUuZXhwb3J0cyA9IENhcnJvdDtcbn0pKCk7XG4iLCIvKiBnbG9iYWwgXzpmYWxzZSwgUGhhc2VyOmZhbHNlICovXG5cbi8qKlxuICogUHJlZmFiIChvYmplY3RzKSBEaWxsIGZvciBib29zdGluZ1xuICovXG5cbihmdW5jdGlvbigpIHtcbiAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgLy8gQ29uc3RydWN0b3JcbiAgdmFyIERpbGwgPSBmdW5jdGlvbihnYW1lLCB4LCB5KSB7XG4gICAgLy8gQ2FsbCBkZWZhdWx0IHNwcml0ZVxuICAgIFBoYXNlci5TcHJpdGUuY2FsbCh0aGlzLCBnYW1lLCB4LCB5LCBcImdhbWUtc3ByaXRlc1wiLCBcImRpbGwucG5nXCIpO1xuXG4gICAgLy8gU2l6ZVxuICAgIHRoaXMuYW5jaG9yLnNldFRvKDAuNSwgMC41KTtcbiAgICB0aGlzLnNjYWxlLnNldFRvKCh0aGlzLmdhbWUud2lkdGggLyA5KSAvIHRoaXMud2lkdGgpO1xuXG4gICAgLy8gUGh5c2ljc1xuICAgIHRoaXMuZ2FtZS5waHlzaWNzLmFyY2FkZS5lbmFibGVCb2R5KHRoaXMpO1xuICAgIHRoaXMuYm9keS5hbGxvd0dyYXZpdHkgPSBmYWxzZTtcbiAgICB0aGlzLmJvZHkuaW1tb3ZhYmxlID0gdHJ1ZTtcbiAgfTtcblxuICAvLyBFeHRlbmQgZnJvbSBTcHJpdGVcbiAgRGlsbC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFBoYXNlci5TcHJpdGUucHJvdG90eXBlKTtcbiAgRGlsbC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBEaWxsO1xuXG4gIC8vIEFkZCBtZXRob2RzXG4gIF8uZXh0ZW5kKERpbGwucHJvdG90eXBlLCB7XG4gICAgdXBkYXRlOiBmdW5jdGlvbigpIHtcblxuICAgIH1cbiAgfSk7XG5cbiAgLy8gRXhwb3J0XG4gIG1vZHVsZS5leHBvcnRzID0gRGlsbDtcbn0pKCk7XG4iLCIvKiBnbG9iYWwgXzpmYWxzZSwgUGhhc2VyOmZhbHNlICovXG5cbi8qKlxuICogUHJlZmFiIEhlcm8vY2hhcmFjdGVyXG4gKi9cblxuKGZ1bmN0aW9uKCkge1xuICBcInVzZSBzdHJpY3RcIjtcblxuICAvLyBDb25zdHJ1Y3RvclxuICB2YXIgSGVybyA9IGZ1bmN0aW9uKGdhbWUsIHgsIHkpIHtcbiAgICAvLyBDYWxsIGRlZmF1bHQgc3ByaXRlXG4gICAgUGhhc2VyLlNwcml0ZS5jYWxsKHRoaXMsIGdhbWUsIHgsIHksIFwicGlja2xlLXNwcml0ZXNcIiwgXCJwaWNrbGUtanVtcC0wMi5wbmdcIik7XG5cbiAgICAvLyBDb25maWd1cmVcbiAgICB0aGlzLmFuY2hvci5zZXRUbygwLjUpO1xuICAgIHRoaXMub3JpZ2luYWxTY2FsZSA9ICh0aGlzLmdhbWUud2lkdGggLyAyMikgLyB0aGlzLndpZHRoO1xuICAgIHRoaXMuc2NhbGUuc2V0VG8odGhpcy5vcmlnaW5hbFNjYWxlKTtcbiAgICB0aGlzLmdhbWUucGh5c2ljcy5hcmNhZGUuZW5hYmxlQm9keSh0aGlzKTtcblxuICAgIC8vIFRyYWNrIHdoZXJlIHRoZSBoZXJvIHN0YXJ0ZWQgYW5kIGhvdyBtdWNoIHRoZSBkaXN0YW5jZVxuICAgIC8vIGhhcyBjaGFuZ2VkIGZyb20gdGhhdCBwb2ludFxuICAgIHRoaXMueU9yaWcgPSB0aGlzLnk7XG4gICAgdGhpcy55Q2hhbmdlID0gMDtcblxuICAgIC8vIEFuaW1hdGlvbnNcbiAgICB2YXIgdXBGcmFtZXMgPSBQaGFzZXIuQW5pbWF0aW9uLmdlbmVyYXRlRnJhbWVOYW1lcyhcInBpY2tsZS1qdW1wLVwiLCAxLCA0LCBcIi5wbmdcIiwgMik7XG4gICAgdmFyIGRvd25GcmFtZXMgPSBQaGFzZXIuQW5pbWF0aW9uLmdlbmVyYXRlRnJhbWVOYW1lcyhcInBpY2tsZS1qdW1wLVwiLCA0LCAxLCBcIi5wbmdcIiwgMik7XG4gICAgdGhpcy5qdW1wVXAgPSB0aGlzLmFuaW1hdGlvbnMuYWRkKFwianVtcC11cFwiLCB1cEZyYW1lcyk7XG4gICAgdGhpcy5KdW1wRG93biA9IHRoaXMuYW5pbWF0aW9ucy5hZGQoXCJqdW1wLWRvd25cIiwgZG93bkZyYW1lcyk7XG4gICAgdGhpcy5qdW1wID0gdGhpcy5hbmltYXRpb25zLmFkZChcImp1bXBcIiwgdXBGcmFtZXMuY29uY2F0KGRvd25GcmFtZXMpKTtcbiAgfTtcblxuICAvLyBFeHRlbmQgZnJvbSBTcHJpdGVcbiAgSGVyby5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFBoYXNlci5TcHJpdGUucHJvdG90eXBlKTtcbiAgSGVyby5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBIZXJvO1xuXG4gIC8vIEFkZCBtZXRob2RzXG4gIF8uZXh0ZW5kKEhlcm8ucHJvdG90eXBlLCB7XG4gICAgdXBkYXRlOiBmdW5jdGlvbigpIHtcbiAgICAgIC8vIFRyYWNrIHRoZSBtYXhpbXVtIGFtb3VudCB0aGF0IHRoZSBoZXJvIGhhcyB0cmF2ZWxsZWRcbiAgICAgIHRoaXMueUNoYW5nZSA9IE1hdGgubWF4KHRoaXMueUNoYW5nZSwgTWF0aC5hYnModGhpcy55IC0gdGhpcy55T3JpZykpO1xuXG4gICAgICAvLyBXcmFwIGFyb3VuZCBlZGdlcyBsZWZ0L3RpZ2h0IGVkZ2VzXG4gICAgICB0aGlzLmdhbWUud29ybGQud3JhcCh0aGlzLCB0aGlzLndpZHRoIC8gMiwgZmFsc2UsIHRydWUsIGZhbHNlKTtcblxuICAgICAgLy8gV2hlbiBoZWFkaW5nIGRvd24sIGFuaW1hdGUgdG8gZG93blxuICAgICAgaWYgKHRoaXMuYm9keS52ZWxvY2l0eS55ID4gMCAmJiB0aGlzLmdvaW5nVXApIHtcbiAgICAgICAgdGhpcy5vbkZpcmUgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5nb2luZ1VwID0gZmFsc2U7XG4gICAgICAgIHRoaXMuZG9KdW1wRG93bigpO1xuICAgICAgfVxuXG4gICAgICAvLyBFbHNlIHdoZW4gaGVhZGluZyB1cCwgbm90ZVxuICAgICAgZWxzZSBpZiAodGhpcy5ib2R5LnZlbG9jaXR5LnkgPCAwICYmICF0aGlzLmdvaW5nVXApIHtcbiAgICAgICAgdGhpcy5nb2luZ1VwID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5kb0p1bXBVcCgpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICAvLyBSZXNldCBwbGFjZW1lbnQgY3VzdG9tXG4gICAgcmVzZXRQbGFjZW1lbnQ6IGZ1bmN0aW9uKHgsIHkpIHtcbiAgICAgIHRoaXMucmVzZXQoeCwgeSk7XG4gICAgICB0aGlzLnlPcmlnID0gdGhpcy55O1xuICAgICAgdGhpcy55Q2hhbmdlID0gMDtcbiAgICB9LFxuXG4gICAgLy8gSnVtcCB1cFxuICAgIGRvSnVtcFVwOiBmdW5jdGlvbigpIHtcbiAgICAgIGlmICghdGhpcy5vbkZpcmUpIHtcbiAgICAgICAgdGhpcy5hbmltYXRpb25zLnBsYXkoXCJqdW1wLXVwXCIsIDE1LCBmYWxzZSk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIC8vIEp1bXAgZG93blxuICAgIGRvSnVtcERvd246IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKCF0aGlzLm9uRmlyZSkge1xuICAgICAgICB0aGlzLmFuaW1hdGlvbnMucGxheShcImp1bXAtZG93blwiLCAxNSwgZmFsc2UpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICAvLyBPbiBmaXJlXG4gICAgc2V0T25GaXJlOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMub25GaXJlID0gdHJ1ZTtcbiAgICAgIHRoaXMubG9hZFRleHR1cmUoXCJwaWNrbGUtc3ByaXRlc1wiLCBcInBpY2tsZS1yb2NrZXQucG5nXCIpO1xuICAgICAgdGhpcy5zY2FsZS5zZXRUbyh0aGlzLm9yaWdpbmFsU2NhbGUgKiAxLjUpO1xuICAgIH0sXG5cbiAgICAvLyBPZmYgZmlyZVxuICAgIHB1dE91dEZpcmU6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zY2FsZS5zZXRUbyh0aGlzLm9yaWdpbmFsU2NhbGUpO1xuICAgICAgdGhpcy5vbkZpcmUgPSBmYWxzZTtcbiAgICB9XG4gIH0pO1xuXG4gIC8vIEV4cG9ydFxuICBtb2R1bGUuZXhwb3J0cyA9IEhlcm87XG59KSgpO1xuIiwiLyogZ2xvYmFsIF86ZmFsc2UsIFBoYXNlcjpmYWxzZSAqL1xuXG4vKipcbiAqIFByZWZhYiBqYXIgcGxhdGZvcm1cbiAqL1xuXG4oZnVuY3Rpb24oKSB7XG4gIFwidXNlIHN0cmljdFwiO1xuXG4gIC8vIENvbnN0cnVjdG9yXG4gIHZhciBKYXIgPSBmdW5jdGlvbihnYW1lLCB4LCB5KSB7XG4gICAgLy8gQ2FsbCBkZWZhdWx0IHNwcml0ZVxuICAgIFBoYXNlci5TcHJpdGUuY2FsbCh0aGlzLCBnYW1lLCB4LCB5LCBcImdhbWUtc3ByaXRlc1wiLCBcImphci5wbmdcIik7XG5cbiAgICAvLyBDb25maWd1cmVcbiAgICB0aGlzLmFuY2hvci5zZXRUbygwLjUsIDAuNSk7XG4gICAgdGhpcy5zY2FsZS5zZXRUbygodGhpcy5nYW1lLndpZHRoIC8gMikgLyB0aGlzLndpZHRoKTtcblxuICAgIC8vIFBoeXNpY3NcbiAgICB0aGlzLmdhbWUucGh5c2ljcy5hcmNhZGUuZW5hYmxlQm9keSh0aGlzKTtcbiAgICB0aGlzLmJvZHkuYWxsb3dHcmF2aXR5ID0gZmFsc2U7XG4gICAgdGhpcy5ib2R5LmltbW92YWJsZSA9IHRydWU7XG4gIH07XG5cbiAgLy8gRXh0ZW5kIGZyb20gU3ByaXRlXG4gIEphci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFBoYXNlci5TcHJpdGUucHJvdG90eXBlKTtcbiAgSmFyLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEphcjtcblxuICAvLyBBZGQgbWV0aG9kc1xuICBfLmV4dGVuZChKYXIucHJvdG90eXBlLCB7XG4gICAgdXBkYXRlOiBmdW5jdGlvbigpIHtcbiAgICB9XG4gIH0pO1xuXG4gIC8vIEV4cG9ydFxuICBtb2R1bGUuZXhwb3J0cyA9IEphcjtcbn0pKCk7XG4iLCIvKiBnbG9iYWwgXzpmYWxzZSwgUGhhc2VyOmZhbHNlICovXG5cbi8qKlxuICogUHJlZmFiIG1pbmkgcGlja2xlIChraW5kIG9mIGxpa2UgYSBjb2luLCBqdXN0IHBvaW50cylcbiAqL1xuXG4oZnVuY3Rpb24oKSB7XG4gIFwidXNlIHN0cmljdFwiO1xuXG4gIC8vIENvbnN0cnVjdG9yXG4gIHZhciBNaW5pID0gZnVuY3Rpb24oZ2FtZSwgeCwgeSkge1xuICAgIC8vIENhbGwgZGVmYXVsdCBzcHJpdGVcbiAgICBQaGFzZXIuU3ByaXRlLmNhbGwodGhpcywgZ2FtZSwgeCwgeSwgXCJnYW1lLXNwcml0ZXNcIiwgXCJtYWdpY2RpbGwucG5nXCIpO1xuXG4gICAgLy8gQ29uZmlndXJlXG4gICAgdGhpcy5hbmNob3Iuc2V0VG8oMC41LCAwLjUpO1xuICAgIHRoaXMuc2NhbGUuc2V0VG8oKHRoaXMuZ2FtZS53aWR0aCAvIDIwKSAvIHRoaXMud2lkdGgpO1xuXG4gICAgLy8gUGh5c2ljc1xuICAgIHRoaXMuZ2FtZS5waHlzaWNzLmFyY2FkZS5lbmFibGVCb2R5KHRoaXMpO1xuICAgIHRoaXMuYm9keS5hbGxvd0dyYXZpdHkgPSBmYWxzZTtcbiAgICB0aGlzLmJvZHkuaW1tb3ZhYmxlID0gdHJ1ZTtcbiAgfTtcblxuICAvLyBFeHRlbmQgZnJvbSBTcHJpdGVcbiAgTWluaS5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFBoYXNlci5TcHJpdGUucHJvdG90eXBlKTtcbiAgTWluaS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBNaW5pO1xuXG4gIC8vIEFkZCBtZXRob2RzXG4gIF8uZXh0ZW5kKE1pbmkucHJvdG90eXBlLCB7XG4gICAgdXBkYXRlOiBmdW5jdGlvbigpIHtcblxuICAgIH1cbiAgfSk7XG5cbiAgLy8gRXhwb3J0XG4gIG1vZHVsZS5leHBvcnRzID0gTWluaTtcbn0pKCk7XG4iLCIvKiBnbG9iYWwgXzpmYWxzZSwgUGhhc2VyOmZhbHNlICovXG5cbi8qKlxuICogUHJlZmFiIChvYmplY3RzKSBib29zdCBmb3IgcGVwcGVyXG4gKi9cblxuKGZ1bmN0aW9uKCkge1xuICBcInVzZSBzdHJpY3RcIjtcblxuICAvLyBDb25zdHJ1Y3RvciBmb3IgQm9vc3RcbiAgdmFyIFBlcHBlciA9IGZ1bmN0aW9uKGdhbWUsIHgsIHkpIHtcbiAgICAvLyBDYWxsIGRlZmF1bHQgc3ByaXRlXG4gICAgUGhhc2VyLlNwcml0ZS5jYWxsKHRoaXMsIGdhbWUsIHgsIHksIFwiZ2FtZS1zcHJpdGVzXCIsIFwiZ2hvc3QtcGVwcGVyLnBuZ1wiKTtcblxuICAgIC8vIFNpemVcbiAgICB0aGlzLmFuY2hvci5zZXRUbygwLjUsIDAuNSk7XG4gICAgdGhpcy5zY2FsZS5zZXRUbygodGhpcy5nYW1lLndpZHRoIC8gMTgpIC8gdGhpcy53aWR0aCk7XG5cbiAgICAvLyBQaHlzaWNzXG4gICAgdGhpcy5nYW1lLnBoeXNpY3MuYXJjYWRlLmVuYWJsZUJvZHkodGhpcyk7XG4gICAgdGhpcy5ib2R5LmFsbG93R3Jhdml0eSA9IGZhbHNlO1xuICAgIHRoaXMuYm9keS5pbW1vdmFibGUgPSB0cnVlO1xuICB9O1xuXG4gIC8vIEV4dGVuZCBmcm9tIFNwcml0ZVxuICBQZXBwZXIucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQaGFzZXIuU3ByaXRlLnByb3RvdHlwZSk7XG4gIFBlcHBlci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBQZXBwZXI7XG5cbiAgLy8gQWRkIG1ldGhvZHNcbiAgXy5leHRlbmQoUGVwcGVyLnByb3RvdHlwZSwge1xuICAgIHVwZGF0ZTogZnVuY3Rpb24oKSB7XG5cbiAgICB9XG4gIH0pO1xuXG4gIC8vIEV4cG9ydFxuICBtb2R1bGUuZXhwb3J0cyA9IFBlcHBlcjtcbn0pKCk7XG4iLCIvKiBnbG9iYWwgXzpmYWxzZSwgUGhhc2VyOmZhbHNlICovXG5cbi8qKlxuICogR2FtZW92ZXIgc3RhdGVcbiAqL1xuXG4oZnVuY3Rpb24oKSB7XG4gIFwidXNlIHN0cmljdFwiO1xuXG4gIC8vIENvbnN0cnVjdG9yXG4gIHZhciBHYW1lb3ZlciA9IGZ1bmN0aW9uKCkge1xuICAgIFBoYXNlci5TdGF0ZS5jYWxsKHRoaXMpO1xuXG4gICAgLy8gQ29uZmlndXJlXG4gICAgdGhpcy5wYWRkaW5nID0gMTA7XG4gIH07XG5cbiAgLy8gRXh0ZW5kIGZyb20gU3RhdGVcbiAgR2FtZW92ZXIucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQaGFzZXIuU3RhdGUucHJvdG90eXBlKTtcbiAgR2FtZW92ZXIucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gR2FtZW92ZXI7XG5cbiAgLy8gQWRkIG1ldGhvZHNcbiAgXy5leHRlbmQoR2FtZW92ZXIucHJvdG90eXBlLCBQaGFzZXIuU3RhdGUucHJvdG90eXBlLCB7XG4gICAgLy8gUHJlbG9hZFxuICAgIHByZWxvYWQ6IGZ1bmN0aW9uKCkge1xuICAgICAgLy8gTG9hZCB1cCBnYW1lIGltYWdlc1xuICAgICAgdGhpcy5nYW1lLmxvYWQuYXRsYXMoXCJnYW1lb3Zlci1zcHJpdGVzXCIsIFwiYXNzZXRzL2dhbWVvdmVyLXNwcml0ZXMucG5nXCIsIFwiYXNzZXRzL2dhbWVvdmVyLXNwcml0ZXMuanNvblwiKTtcbiAgICB9LFxuXG4gICAgLy8gQ3JlYXRlXG4gICAgY3JlYXRlOiBmdW5jdGlvbigpIHtcbiAgICAgIC8vIFNldCBiYWNrZ3JvdW5kXG4gICAgICB0aGlzLmdhbWUuc3RhZ2UuYmFja2dyb3VuZENvbG9yID0gXCIjOGNjNjNmXCI7XG5cbiAgICAgIC8vIFBsYWNlIHRpdGxlXG4gICAgICB0aGlzLnRpdGxlSW1hZ2UgPSB0aGlzLmdhbWUuYWRkLnNwcml0ZSh0aGlzLmdhbWUud2lkdGggLyAyLCB0aGlzLnBhZGRpbmcgKiAzLCBcImdhbWVvdmVyLXNwcml0ZXNcIiwgXCJnYW1lb3Zlci5wbmdcIik7XG4gICAgICB0aGlzLnRpdGxlSW1hZ2UuYW5jaG9yLnNldFRvKDAuNSwgMCk7XG4gICAgICB0aGlzLnRpdGxlSW1hZ2Uuc2NhbGUuc2V0VG8oKHRoaXMuZ2FtZS53aWR0aCAtICh0aGlzLnBhZGRpbmcgKiA4KSkgLyB0aGlzLnRpdGxlSW1hZ2Uud2lkdGgpO1xuICAgICAgdGhpcy5nYW1lLmFkZC5leGlzdGluZyh0aGlzLnRpdGxlSW1hZ2UpO1xuXG4gICAgICAvLyBIaWdoc2NvcmUgbGlzdC4gIENhbid0IHNlZW0gdG8gZmluZCBhIHdheSB0byBwYXNzIHRoZSBzY29yZVxuICAgICAgLy8gdmlhIGEgc3RhdGUgY2hhbmdlLlxuICAgICAgdGhpcy5zY29yZSA9IHRoaXMuZ2FtZS5waWNrbGUuc2NvcmU7XG5cbiAgICAgIC8vIFNob3cgc2NvcmVcbiAgICAgIHRoaXMuc2hvd1Njb3JlKCk7XG5cbiAgICAgIC8vIFNob3cgaW5wdXQgaWYgbmV3IGhpZ2hzY29yZSwgb3RoZXJ3aXNlIHNob3cgbGlzdFxuICAgICAgaWYgKHRoaXMuZ2FtZS5waWNrbGUuaXNIaWdoc2NvcmUodGhpcy5zY29yZSkpIHtcbiAgICAgICAgdGhpcy5oaWdoc2NvcmVJbnB1dCgpO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHRoaXMuaGlnaHNjb3JlTGlzdCgpO1xuICAgICAgfVxuXG4gICAgICAvLyBQbGFjZSByZS1wbGF5XG4gICAgICB0aGlzLnJlcGxheUltYWdlID0gdGhpcy5nYW1lLmFkZC5zcHJpdGUodGhpcy5nYW1lLndpZHRoIC0gdGhpcy5wYWRkaW5nICogMixcbiAgICAgICAgdGhpcy5nYW1lLmhlaWdodCAtIHRoaXMucGFkZGluZyAqIDIsIFwiZ2FtZW92ZXItc3ByaXRlc1wiLCBcInRpdGxlLXBsYXkucG5nXCIpO1xuICAgICAgdGhpcy5yZXBsYXlJbWFnZS5hbmNob3Iuc2V0VG8oMSwgMSk7XG4gICAgICB0aGlzLnJlcGxheUltYWdlLnNjYWxlLnNldFRvKCh0aGlzLmdhbWUud2lkdGggKiAwLjI1KSAvIHRoaXMucmVwbGF5SW1hZ2Uud2lkdGgpO1xuICAgICAgdGhpcy5nYW1lLmFkZC5leGlzdGluZyh0aGlzLnJlcGxheUltYWdlKTtcblxuICAgICAgLy8gQWRkIGhvdmVyIGZvciBtb3VzZVxuICAgICAgdGhpcy5yZXBsYXlJbWFnZS5pbnB1dEVuYWJsZWQgPSB0cnVlO1xuICAgICAgdGhpcy5yZXBsYXlJbWFnZS5ldmVudHMub25JbnB1dE92ZXIuYWRkKGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLnJlcGxheUltYWdlLm9yaWdpbmFsVGludCA9IHRoaXMucmVwbGF5SW1hZ2UudGludDtcbiAgICAgICAgdGhpcy5yZXBsYXlJbWFnZS50aW50ID0gMC41ICogMHhGRkZGRkY7XG4gICAgICB9LCB0aGlzKTtcblxuICAgICAgdGhpcy5yZXBsYXlJbWFnZS5ldmVudHMub25JbnB1dE91dC5hZGQoZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMucmVwbGF5SW1hZ2UudGludCA9IHRoaXMucmVwbGF5SW1hZ2Uub3JpZ2luYWxUaW50O1xuICAgICAgfSwgdGhpcyk7XG5cbiAgICAgIC8vIEFkZCBpbnRlcmFjdGlvbnMgZm9yIHN0YXJ0aW5nXG4gICAgICB0aGlzLnJlcGxheUltYWdlLmV2ZW50cy5vbklucHV0RG93bi5hZGQodGhpcy5yZXBsYXksIHRoaXMpO1xuXG4gICAgICAvLyBJbnB1dFxuICAgICAgdGhpcy5sZWZ0QnV0dG9uID0gdGhpcy5nYW1lLmlucHV0LmtleWJvYXJkLmFkZEtleShQaGFzZXIuS2V5Ym9hcmQuTEVGVCk7XG4gICAgICB0aGlzLnJpZ2h0QnV0dG9uID0gdGhpcy5nYW1lLmlucHV0LmtleWJvYXJkLmFkZEtleShQaGFzZXIuS2V5Ym9hcmQuUklHSFQpO1xuICAgICAgdGhpcy51cEJ1dHRvbiA9IHRoaXMuZ2FtZS5pbnB1dC5rZXlib2FyZC5hZGRLZXkoUGhhc2VyLktleWJvYXJkLlVQKTtcbiAgICAgIHRoaXMuZG93bkJ1dHRvbiA9IHRoaXMuZ2FtZS5pbnB1dC5rZXlib2FyZC5hZGRLZXkoUGhhc2VyLktleWJvYXJkLkRPV04pO1xuICAgICAgdGhpcy5hY3Rpb25CdXR0b24gPSB0aGlzLmdhbWUuaW5wdXQua2V5Ym9hcmQuYWRkS2V5KFBoYXNlci5LZXlib2FyZC5TUEFDRUJBUik7XG5cbiAgICAgIHRoaXMubGVmdEJ1dHRvbi5vbkRvd24uYWRkKGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAodGhpcy5oSW5wdXQpIHtcbiAgICAgICAgICB0aGlzLm1vdmVDdXJzb3IoLTEpO1xuICAgICAgICB9XG4gICAgICB9LCB0aGlzKTtcblxuICAgICAgdGhpcy5yaWdodEJ1dHRvbi5vbkRvd24uYWRkKGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAodGhpcy5oSW5wdXQpIHtcbiAgICAgICAgICB0aGlzLm1vdmVDdXJzb3IoMSk7XG4gICAgICAgIH1cbiAgICAgIH0sIHRoaXMpO1xuXG4gICAgICB0aGlzLnVwQnV0dG9uLm9uRG93bi5hZGQoZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICh0aGlzLmhJbnB1dCkge1xuICAgICAgICAgIHRoaXMubW92ZUxldHRlcigxKTtcbiAgICAgICAgfVxuICAgICAgfSwgdGhpcyk7XG5cbiAgICAgIHRoaXMuZG93bkJ1dHRvbi5vbkRvd24uYWRkKGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAodGhpcy5oSW5wdXQpIHtcbiAgICAgICAgICB0aGlzLm1vdmVMZXR0ZXIoLTEpO1xuICAgICAgICB9XG4gICAgICB9LCB0aGlzKTtcblxuICAgICAgdGhpcy5hY3Rpb25CdXR0b24ub25Eb3duLmFkZChmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHNhdmVkO1xuXG4gICAgICAgIGlmICh0aGlzLmhJbnB1dCkge1xuICAgICAgICAgIHNhdmVkID0gdGhpcy5zYXZlSGlnaHNjb3JlKCk7XG4gICAgICAgICAgaWYgKHNhdmVkKSB7XG4gICAgICAgICAgICB0aGlzLmhpZ2hzY29yZUxpc3QoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgdGhpcy5yZXBsYXkoKTtcbiAgICAgICAgfVxuICAgICAgfSwgdGhpcyk7XG4gICAgfSxcblxuICAgIC8vIFVwZGF0ZVxuICAgIHVwZGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgfSxcblxuICAgIC8vIFNodXRkb3duLCBjbGVhbiB1cCBvbiBzdGF0ZSBjaGFuZ2VcbiAgICBzaHV0ZG93bjogZnVuY3Rpb24oKSB7XG4gICAgICBbXCJ0aXRsZVRleHRcIiwgXCJyZXBsYXlUZXh0XCJdLmZvckVhY2goXy5iaW5kKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgaWYgKHRoaXNbaXRlbV0gJiYgdGhpc1tpdGVtXS5kZXN0cm95KSB7XG4gICAgICAgICAgdGhpc1tpdGVtXS5kZXN0cm95KCk7XG4gICAgICAgICAgdGhpc1tpdGVtXSA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgIH0sIHRoaXMpKTtcbiAgICB9LFxuXG4gICAgLy8gSGFuZGxlIHJlcGxheVxuICAgIHJlcGxheTogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLmdhbWUuc3RhdGUuc3RhcnQoXCJtZW51XCIpO1xuICAgIH0sXG5cbiAgICAvLyBTaG93IGhpZ2hzY29yZVxuICAgIHNob3dTY29yZTogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnNjb3JlR3JvdXAgPSB0aGlzLmdhbWUuYWRkLmdyb3VwKCk7XG5cbiAgICAgIC8vIFBsYWNlIGxhYmVsXG4gICAgICB0aGlzLnlvdXJTY29yZUltYWdlID0gdGhpcy5nYW1lLmFkZC5zcHJpdGUoXG4gICAgICAgIHRoaXMuZ2FtZS53aWR0aCAvIDIgKyAodGhpcy5wYWRkaW5nICogMyksXG4gICAgICAgIHRoaXMudGl0bGVJbWFnZS5oZWlnaHQgKyAodGhpcy5wYWRkaW5nICogNy41KSwgXCJnYW1lb3Zlci1zcHJpdGVzXCIsIFwieW91ci1zY29yZS5wbmdcIik7XG4gICAgICB0aGlzLnlvdXJTY29yZUltYWdlLmFuY2hvci5zZXRUbygxLCAwKTtcbiAgICAgIHRoaXMueW91clNjb3JlSW1hZ2Uuc2NhbGUuc2V0VG8oKCh0aGlzLmdhbWUud2lkdGggLyAyKSAtICh0aGlzLnBhZGRpbmcgKiA2KSkgLyB0aGlzLnlvdXJTY29yZUltYWdlLndpZHRoKTtcblxuICAgICAgLy8gU2NvcmVcbiAgICAgIHRoaXMuc2NvcmVUZXh0ID0gbmV3IFBoYXNlci5UZXh0KFxuICAgICAgICB0aGlzLmdhbWUsXG4gICAgICAgIHRoaXMuZ2FtZS53aWR0aCAvIDIgKyAodGhpcy5wYWRkaW5nICogNSksXG4gICAgICAgIHRoaXMudGl0bGVJbWFnZS5oZWlnaHQgKyAodGhpcy5wYWRkaW5nICogNiksXG4gICAgICAgIHRoaXMuc2NvcmUudG9Mb2NhbGVTdHJpbmcoKSwge1xuICAgICAgICAgIGZvbnQ6IFwiYm9sZCBcIiArICh0aGlzLmdhbWUud29ybGQuaGVpZ2h0IC8gMTUpICsgXCJweCBEb3Npc1wiLFxuICAgICAgICAgIGZpbGw6IFwiIzM5YjU0YVwiLFxuICAgICAgICAgIGFsaWduOiBcImxlZnRcIixcbiAgICAgICAgfSk7XG4gICAgICB0aGlzLnNjb3JlVGV4dC5hbmNob3Iuc2V0VG8oMCwgMCk7XG5cbiAgICAgIC8vIEZvbnQgbG9hZGluZyB0aGluZ1xuICAgICAgXy5kZWxheShfLmJpbmQoZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuc2NvcmVHcm91cC5hZGQodGhpcy55b3VyU2NvcmVJbWFnZSk7XG4gICAgICAgIHRoaXMuc2NvcmVHcm91cC5hZGQodGhpcy5zY29yZVRleHQpO1xuICAgICAgfSwgdGhpcyksIDEwMDApO1xuICAgIH0sXG5cbiAgICAvLyBNYWtlIGhpZ2hlc3Qgc2NvcmUgaW5wdXRcbiAgICBoaWdoc2NvcmVJbnB1dDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLmhJbnB1dCA9IHRydWU7XG4gICAgICB0aGlzLmhJbnB1dEluZGV4ID0gMDtcbiAgICAgIHRoaXMuaElucHV0cyA9IHRoaXMuZ2FtZS5hZGQuZ3JvdXAoKTtcbiAgICAgIHZhciB5ID0gdGhpcy5nYW1lLndvcmxkLmhlaWdodCAqIDAuNztcblxuICAgICAgLy8gRmlyc3QgaW5wdXRcbiAgICAgIHZhciBvbmUgPSBuZXcgUGhhc2VyLlRleHQoXG4gICAgICAgIHRoaXMuZ2FtZSxcbiAgICAgICAgdGhpcy5nYW1lLndvcmxkLndpZHRoICogMC4zMzMzMyxcbiAgICAgICAgeSxcbiAgICAgICAgXCJBXCIsIHtcbiAgICAgICAgICBmb250OiBcImJvbGQgXCIgKyAodGhpcy5nYW1lLndvcmxkLmhlaWdodCAvIDE1KSArIFwicHggRG9zaXNcIixcbiAgICAgICAgICBmaWxsOiBcIiNGRkZGRkZcIixcbiAgICAgICAgICBhbGlnbjogXCJjZW50ZXJcIixcbiAgICAgICAgfSk7XG4gICAgICBvbmUuYW5jaG9yLnNldCgwLjUpO1xuICAgICAgdGhpcy5oSW5wdXRzLmFkZChvbmUpO1xuXG4gICAgICAvLyBTZWNvbmQgaW5wdXRcbiAgICAgIHZhciBzZWNvbmQgPSBuZXcgUGhhc2VyLlRleHQoXG4gICAgICAgIHRoaXMuZ2FtZSxcbiAgICAgICAgdGhpcy5nYW1lLndvcmxkLndpZHRoICogMC41LFxuICAgICAgICB5LFxuICAgICAgICBcIkFcIiwge1xuICAgICAgICAgIGZvbnQ6IFwiYm9sZCBcIiArICh0aGlzLmdhbWUud29ybGQuaGVpZ2h0IC8gMTUpICsgXCJweCBEb3Npc1wiLFxuICAgICAgICAgIGZpbGw6IFwiI0ZGRkZGRlwiLFxuICAgICAgICAgIGFsaWduOiBcImNlbnRlclwiLFxuICAgICAgICB9KTtcbiAgICAgIHNlY29uZC5hbmNob3Iuc2V0KDAuNSk7XG4gICAgICB0aGlzLmhJbnB1dHMuYWRkKHNlY29uZCk7XG5cbiAgICAgIC8vIFNlY29uZCBpbnB1dFxuICAgICAgdmFyIHRoaXJkID0gbmV3IFBoYXNlci5UZXh0KFxuICAgICAgICB0aGlzLmdhbWUsXG4gICAgICAgIHRoaXMuZ2FtZS53b3JsZC53aWR0aCAqIDAuNjY2NjYsXG4gICAgICAgIHksXG4gICAgICAgIFwiQVwiLCB7XG4gICAgICAgICAgZm9udDogXCJib2xkIFwiICsgKHRoaXMuZ2FtZS53b3JsZC5oZWlnaHQgLyAxNSkgKyBcInB4IERvc2lzXCIsXG4gICAgICAgICAgZmlsbDogXCIjRkZGRkZGXCIsXG4gICAgICAgICAgYWxpZ246IFwiY2VudGVyXCIsXG4gICAgICAgIH0pO1xuICAgICAgdGhpcmQuYW5jaG9yLnNldCgwLjUpO1xuICAgICAgdGhpcy5oSW5wdXRzLmFkZCh0aGlyZCk7XG5cbiAgICAgIC8vIEN1cnNvclxuICAgICAgdGhpcy5oQ3Vyc29yID0gdGhpcy5nYW1lLmFkZC50ZXh0KFxuICAgICAgICBvbmUueCxcbiAgICAgICAgb25lLnkgLSAodGhpcy5nYW1lLndvcmxkLmhlaWdodCAvIDIwKSxcbiAgICAgICAgXCJfXCIsIHtcbiAgICAgICAgICBmb250OiBcImJvbGQgXCIgKyAodGhpcy5nYW1lLndvcmxkLmhlaWdodCAvIDUpICsgXCJweCBBcmlhbFwiLFxuICAgICAgICAgIGZpbGw6IFwiI0ZGRkZGRlwiLFxuICAgICAgICAgIGFsaWduOiBcImNlbnRlclwiLFxuICAgICAgICB9KTtcbiAgICAgIHRoaXMuaEN1cnNvci5hbmNob3Iuc2V0KDAuNSk7XG5cbiAgICAgIC8vIEhhbmRsZSBpbml0YWwgY3Vyc29yXG4gICAgICB0aGlzLm1vdmVDdXJzb3IoMCk7XG4gICAgfSxcblxuICAgIC8vIE1vdmUgY3Vyc29yXG4gICAgbW92ZUN1cnNvcjogZnVuY3Rpb24oYW1vdW50KSB7XG4gICAgICB2YXIgbmV3SW5kZXggPSB0aGlzLmhJbnB1dEluZGV4ICsgYW1vdW50O1xuICAgICAgdGhpcy5oSW5wdXRJbmRleCA9IChuZXdJbmRleCA8IDApID8gdGhpcy5oSW5wdXRzLmxlbmd0aCAtIDEgOlxuICAgICAgICAobmV3SW5kZXggPj0gdGhpcy5oSW5wdXRzLmxlbmd0aCkgPyAwIDogbmV3SW5kZXg7XG4gICAgICB2YXIgaSA9IHRoaXMuaElucHV0cy5nZXRDaGlsZEF0KHRoaXMuaElucHV0SW5kZXgpO1xuXG4gICAgICAvLyBNb3ZlIGN1cnNvclxuICAgICAgdGhpcy5oQ3Vyc29yLnggPSBpLng7XG4gICAgICB0aGlzLmhJbnB1dHMuZm9yRWFjaChmdW5jdGlvbihpbnB1dCkge1xuICAgICAgICBpbnB1dC5maWxsID0gXCIjRkZGRkZGXCI7XG4gICAgICB9KTtcblxuICAgICAgaS5maWxsID0gXCIjRkZEREJCXCI7XG5cbiAgICAgIC8vIFRPRE86IEhpZ2hsaWdodCBpbnB1dC5cbiAgICB9LFxuXG4gICAgLy8gTW92ZSBsZXR0ZXJcbiAgICBtb3ZlTGV0dGVyOiBmdW5jdGlvbihhbW91bnQpIHtcbiAgICAgIHZhciBpID0gdGhpcy5oSW5wdXRzLmdldENoaWxkQXQodGhpcy5oSW5wdXRJbmRleCk7XG4gICAgICB2YXIgdCA9IGkudGV4dDtcbiAgICAgIHZhciBuID0gKHQgPT09IFwiQVwiICYmIGFtb3VudCA9PT0gLTEpID8gXCJaXCIgOlxuICAgICAgICAodCA9PT0gXCJaXCIgJiYgYW1vdW50ID09PSAxKSA/IFwiQVwiIDpcbiAgICAgICAgU3RyaW5nLmZyb21DaGFyQ29kZSh0LmNoYXJDb2RlQXQoMCkgKyBhbW91bnQpO1xuXG4gICAgICBpLnRleHQgPSBuO1xuICAgIH0sXG5cbiAgICAvLyBTYXZlIGhpZ2hzY29yZVxuICAgIHNhdmVIaWdoc2NvcmU6IGZ1bmN0aW9uKCkge1xuICAgICAgLy8gR2V0IG5hbWVcbiAgICAgIHZhciBuYW1lID0gXCJcIjtcbiAgICAgIHRoaXMuaElucHV0cy5mb3JFYWNoKGZ1bmN0aW9uKGlucHV0KSB7XG4gICAgICAgIG5hbWUgPSBuYW1lICsgaW5wdXQudGV4dDtcbiAgICAgIH0pO1xuXG4gICAgICAvLyBEb24ndCBhbGxvdyBBQUFcbiAgICAgIGlmIChuYW1lID09PSBcIkFBQVwiKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgLy8gU2F2ZSBoaWdoc2NvcmVcbiAgICAgIHRoaXMuZ2FtZS5waWNrbGUuc2V0SGlnaHNjb3JlKHRoaXMuc2NvcmUsIG5hbWUpO1xuXG4gICAgICAvLyBSZW1vdmUgaW5wdXRcbiAgICAgIHRoaXMuaElucHV0ID0gZmFsc2U7XG4gICAgICB0aGlzLmhJbnB1dHMuZGVzdHJveSgpO1xuICAgICAgdGhpcy5oQ3Vyc29yLmRlc3Ryb3koKTtcblxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSxcblxuICAgIC8vIEhpZ2hzY29yZSBsaXN0XG4gICAgaGlnaHNjb3JlTGlzdDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLmhpZ2hzY29yZUxpbWl0ID0gMztcbiAgICAgIHRoaXMuaGlnaHNjb3JlTGlzdEdyb3VwID0gdGhpcy5nYW1lLmFkZC5ncm91cCgpO1xuICAgICAgdGhpcy5nYW1lLnBpY2tsZS5zb3J0SGlnaHNjb3JlcygpO1xuICAgICAgdmFyIGZvbnRTaXplID0gdGhpcy5nYW1lLndvcmxkLmhlaWdodCAvIDE3LjU7XG5cbiAgICAgIGlmICh0aGlzLmdhbWUucGlja2xlLmhpZ2hzY29yZXMubGVuZ3RoID4gMCkge1xuICAgICAgICBfLmVhY2godGhpcy5nYW1lLnBpY2tsZS5oaWdoc2NvcmVzLnJldmVyc2UoKS5zbGljZSgwLCAzKSwgXy5iaW5kKGZ1bmN0aW9uKGgsIGkpIHtcbiAgICAgICAgICAvLyBOYW1lXG4gICAgICAgICAgdmFyIG5hbWUgPSBuZXcgUGhhc2VyLlRleHQoXG4gICAgICAgICAgICB0aGlzLmdhbWUsXG4gICAgICAgICAgICB0aGlzLmdhbWUud2lkdGggLyAyICsgKHRoaXMucGFkZGluZyAqIDMpLFxuICAgICAgICAgICAgKHRoaXMuZ2FtZS5oZWlnaHQgKiAwLjYpICsgKChmb250U2l6ZSArIHRoaXMucGFkZGluZykgKiBpKSxcbiAgICAgICAgICAgIGgubmFtZSwge1xuICAgICAgICAgICAgICBmb250OiBcImJvbGQgXCIgKyAodGhpcy5nYW1lLndvcmxkLmhlaWdodCAvIDE1KSArIFwicHggRG9zaXNcIixcbiAgICAgICAgICAgICAgZmlsbDogXCIjYjhmNGJjXCIsXG4gICAgICAgICAgICAgIGFsaWduOiBcInJpZ2h0XCIsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICBuYW1lLmFuY2hvci5zZXRUbygxLCAwKTtcblxuICAgICAgICAgIC8vIFNjb3JlXG4gICAgICAgICAgdmFyIHNjb3JlID0gbmV3IFBoYXNlci5UZXh0KFxuICAgICAgICAgICAgdGhpcy5nYW1lLFxuICAgICAgICAgICAgdGhpcy5nYW1lLndpZHRoIC8gMiArICh0aGlzLnBhZGRpbmcgKiA1KSxcbiAgICAgICAgICAgICh0aGlzLmdhbWUuaGVpZ2h0ICogMC42KSArICgoZm9udFNpemUgKyB0aGlzLnBhZGRpbmcpICogaSksXG4gICAgICAgICAgICBoLnNjb3JlLnRvTG9jYWxlU3RyaW5nKCksIHtcbiAgICAgICAgICAgICAgZm9udDogXCJib2xkIFwiICsgKHRoaXMuZ2FtZS53b3JsZC5oZWlnaHQgLyAxNSkgKyBcInB4IERvc2lzXCIsXG4gICAgICAgICAgICAgIGZpbGw6IFwiIzM5YjU0YVwiLFxuICAgICAgICAgICAgICBhbGlnbjogXCJsZWZ0XCIsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICBzY29yZS5hbmNob3Iuc2V0VG8oMCwgMCk7XG5cbiAgICAgICAgICAvLyBGb250IGxvYWRpbmcgdGhpbmdcbiAgICAgICAgICBfLmRlbGF5KF8uYmluZChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuaGlnaHNjb3JlTGlzdEdyb3VwLmFkZChuYW1lKTtcbiAgICAgICAgICAgIHRoaXMuaGlnaHNjb3JlTGlzdEdyb3VwLmFkZChzY29yZSk7XG4gICAgICAgICAgfSwgdGhpcyksIDEwMDApO1xuICAgICAgICB9LCB0aGlzKSk7XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICAvLyBFeHBvcnRcbiAgbW9kdWxlLmV4cG9ydHMgPSBHYW1lb3Zlcjtcbn0pKCk7XG4iLCIvKiBnbG9iYWwgXzpmYWxzZSwgUGhhc2VyOmZhbHNlICovXG5cbi8qKlxuICogTWVudSBzdGF0ZVxuICovXG5cbihmdW5jdGlvbigpIHtcbiAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgLy8gQ29uc3RydWN0b3JcbiAgdmFyIE1lbnUgPSBmdW5jdGlvbigpIHtcbiAgICBQaGFzZXIuU3RhdGUuY2FsbCh0aGlzKTtcblxuICAgIC8vIENvbmZpZ1xuICAgIHRoaXMucGFkZGluZyA9IDIwO1xuICB9O1xuXG4gIC8vIEV4dGVuZCBmcm9tIFN0YXRlXG4gIE1lbnUucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQaGFzZXIuU3RhdGUucHJvdG90eXBlKTtcbiAgTWVudS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBNZW51O1xuXG4gIC8vIEFkZCBtZXRob2RzXG4gIF8uZXh0ZW5kKE1lbnUucHJvdG90eXBlLCBQaGFzZXIuU3RhdGUucHJvdG90eXBlLCB7XG4gICAgLy8gUHJlbG9hZFxuICAgIHByZWxvYWQ6IGZ1bmN0aW9uKCkge1xuICAgICAgLy8gTG9hZCB1cCBnYW1lIGltYWdlc1xuICAgICAgdGhpcy5nYW1lLmxvYWQuYXRsYXMoXCJ0aXRsZS1zcHJpdGVzXCIsIFwiYXNzZXRzL3RpdGxlLXNwcml0ZXMucG5nXCIsIFwiYXNzZXRzL3RpdGxlLXNwcml0ZXMuanNvblwiKTtcbiAgICB9LFxuXG4gICAgLy8gQ3JlYXRlXG4gICAgY3JlYXRlOiBmdW5jdGlvbigpIHtcbiAgICAgIC8vIFNldCBiYWNrZ3JvdW5kXG4gICAgICB0aGlzLmdhbWUuc3RhZ2UuYmFja2dyb3VuZENvbG9yID0gXCIjYjhmNGJjXCI7XG5cbiAgICAgIC8vIFBsYWNlIHRpdGxlXG4gICAgICB0aGlzLnRpdGxlSW1hZ2UgPSB0aGlzLmdhbWUuYWRkLnNwcml0ZSh0aGlzLmdhbWUud2lkdGggLyAyLCB0aGlzLnBhZGRpbmcgKiAzLCBcInRpdGxlLXNwcml0ZXNcIiwgXCJ0aXRsZS5wbmdcIik7XG4gICAgICB0aGlzLnRpdGxlSW1hZ2UuYW5jaG9yLnNldFRvKDAuNSwgMCk7XG4gICAgICB0aGlzLnRpdGxlSW1hZ2Uuc2NhbGUuc2V0VG8oKHRoaXMuZ2FtZS53aWR0aCAtICh0aGlzLnBhZGRpbmcgKiAyKSkgLyB0aGlzLnRpdGxlSW1hZ2Uud2lkdGgpO1xuICAgICAgdGhpcy5nYW1lLmFkZC5leGlzdGluZyh0aGlzLnRpdGxlSW1hZ2UpO1xuXG4gICAgICAvLyBQbGFjZSBwbGF5XG4gICAgICB0aGlzLnBsYXlJbWFnZSA9IHRoaXMuZ2FtZS5hZGQuc3ByaXRlKHRoaXMuZ2FtZS53aWR0aCAvIDIsIHRoaXMuZ2FtZS5oZWlnaHQgLSB0aGlzLnBhZGRpbmcgKiAzLCBcInRpdGxlLXNwcml0ZXNcIiwgXCJ0aXRsZS1wbGF5LnBuZ1wiKTtcbiAgICAgIHRoaXMucGxheUltYWdlLmFuY2hvci5zZXRUbygwLjQsIDEpO1xuICAgICAgdGhpcy5wbGF5SW1hZ2Uuc2NhbGUuc2V0VG8oKHRoaXMuZ2FtZS53aWR0aCAqIDAuNzUpIC8gdGhpcy50aXRsZUltYWdlLndpZHRoKTtcbiAgICAgIHRoaXMuZ2FtZS5hZGQuZXhpc3RpbmcodGhpcy5wbGF5SW1hZ2UpO1xuXG4gICAgICAvLyBBZGQgaG92ZXIgZm9yIG1vdXNlXG4gICAgICB0aGlzLnBsYXlJbWFnZS5pbnB1dEVuYWJsZWQgPSB0cnVlO1xuICAgICAgdGhpcy5wbGF5SW1hZ2UuZXZlbnRzLm9uSW5wdXRPdmVyLmFkZChmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5wbGF5SW1hZ2Uub3JpZ2luYWxUaW50ID0gdGhpcy5wbGF5SW1hZ2UudGludDtcbiAgICAgICAgdGhpcy5wbGF5SW1hZ2UudGludCA9IDAuNSAqIDB4RkZGRkZGO1xuICAgICAgfSwgdGhpcyk7XG5cbiAgICAgIHRoaXMucGxheUltYWdlLmV2ZW50cy5vbklucHV0T3V0LmFkZChmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5wbGF5SW1hZ2UudGludCA9IHRoaXMucGxheUltYWdlLm9yaWdpbmFsVGludDtcbiAgICAgIH0sIHRoaXMpO1xuXG4gICAgICAvLyBBZGQgbW91c2UgaW50ZXJhY3Rpb25cbiAgICAgIHRoaXMucGxheUltYWdlLmV2ZW50cy5vbklucHV0RG93bi5hZGQodGhpcy5nbywgdGhpcyk7XG5cbiAgICAgIC8vIEFkZCBrZXlib2FyZCBpbnRlcmFjdGlvblxuICAgICAgdGhpcy5hY3Rpb25CdXR0b24gPSB0aGlzLmdhbWUuaW5wdXQua2V5Ym9hcmQuYWRkS2V5KFBoYXNlci5LZXlib2FyZC5TUEFDRUJBUik7XG4gICAgICB0aGlzLmFjdGlvbkJ1dHRvbi5vbkRvd24uYWRkKGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLmdvKCk7XG4gICAgICB9LCB0aGlzKTtcbiAgICB9LFxuXG4gICAgLy8gU3RhcnQgcGxheWluZ1xuICAgIGdvOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuZ2FtZS5zdGF0ZS5zdGFydChcInBsYXlcIik7XG4gICAgfSxcblxuICAgIC8vIFVwZGF0ZVxuICAgIHVwZGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgfVxuICB9KTtcblxuICAvLyBFeHBvcnRcbiAgbW9kdWxlLmV4cG9ydHMgPSBNZW51O1xufSkoKTtcbiIsIi8qIGdsb2JhbCBfOmZhbHNlLCBQaGFzZXI6ZmFsc2UgKi9cblxuLyoqXG4gKiBQbGF5IHN0YXRlXG4gKi9cblxuKGZ1bmN0aW9uKCkge1xuICBcInVzZSBzdHJpY3RcIjtcblxuICAvLyBEZXBlbmRlbmNpZXNcbiAgdmFyIHByZWZhYnMgPSB7XG4gICAgRGlsbDogcmVxdWlyZShcIi4vcHJlZmFiLWRpbGwuanNcIiksXG4gICAgUGVwcGVyOiByZXF1aXJlKFwiLi9wcmVmYWItcGVwcGVyLmpzXCIpLFxuICAgIEJvdHVsaXNtOiByZXF1aXJlKFwiLi9wcmVmYWItYm90dWxpc20uanNcIiksXG4gICAgTWluaTogcmVxdWlyZShcIi4vcHJlZmFiLW1pbmkuanNcIiksXG4gICAgSGVybzogcmVxdWlyZShcIi4vcHJlZmFiLWhlcm8uanNcIiksXG4gICAgQmVhbjogcmVxdWlyZShcIi4vcHJlZmFiLWJlYW4uanNcIiksXG4gICAgQ2Fycm90OiByZXF1aXJlKFwiLi9wcmVmYWItY2Fycm90LmpzXCIpLFxuICAgIEphcjogcmVxdWlyZShcIi4vcHJlZmFiLWphci5qc1wiKVxuICB9O1xuXG4gIC8vIENvbnN0cnVjdG9yXG4gIHZhciBQbGF5ID0gZnVuY3Rpb24oKSB7XG4gICAgUGhhc2VyLlN0YXRlLmNhbGwodGhpcyk7XG4gIH07XG5cbiAgLy8gRXh0ZW5kIGZyb20gU3RhdGVcbiAgUGxheS5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFBoYXNlci5TdGF0ZS5wcm90b3R5cGUpO1xuICBQbGF5LnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFBsYXk7XG5cbiAgLy8gQWRkIG1ldGhvZHNcbiAgXy5leHRlbmQoUGxheS5wcm90b3R5cGUsIFBoYXNlci5TdGF0ZS5wcm90b3R5cGUsIHtcbiAgICAvLyBQcmVsb2FkXG4gICAgcHJlbG9hZDogZnVuY3Rpb24oKSB7XG4gICAgICAvLyBMb2FkIHVwIGdhbWUgaW1hZ2VzXG4gICAgICB0aGlzLmdhbWUubG9hZC5hdGxhcyhcImdhbWUtc3ByaXRlc1wiLCBcImFzc2V0cy9nYW1lLXNwcml0ZXMucG5nXCIsIFwiYXNzZXRzL2dhbWUtc3ByaXRlcy5qc29uXCIpO1xuICAgICAgdGhpcy5nYW1lLmxvYWQuYXRsYXMoXCJwaWNrbGUtc3ByaXRlc1wiLCBcImFzc2V0cy9waWNrbGUtc3ByaXRlcy5wbmdcIiwgXCJhc3NldHMvcGlja2xlLXNwcml0ZXMuanNvblwiKTtcbiAgICAgIHRoaXMuZ2FtZS5sb2FkLmF0bGFzKFwiY2Fycm90LXNwcml0ZXNcIiwgXCJhc3NldHMvY2Fycm90LXNwcml0ZXMucG5nXCIsIFwiYXNzZXRzL2NhcnJvdC1zcHJpdGVzLmpzb25cIik7XG4gICAgfSxcblxuICAgIC8vIENyZWF0ZVxuICAgIGNyZWF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAvLyBTZXQgaW5pdGlhbCBkaWZmaWN1bHR5IGFuZCBsZXZlbCBzZXR0aW5nc1xuICAgICAgdGhpcy5jcmVhdGVTdXBlckxldmVsQkcoKTtcbiAgICAgIHRoaXMudXBkYXRlRGlmZmljdWx0eSgpO1xuXG4gICAgICAvLyBTY29yaW5nXG4gICAgICB0aGlzLnNjb3JlTWluaSA9IDEwMDtcbiAgICAgIHRoaXMuc2NvcmVEaWxsID0gNTAwO1xuICAgICAgdGhpcy5zY29yZVBlcHBlciA9IDc1MDtcbiAgICAgIHRoaXMuc2NvcmVCb3QgPSAxMDAwO1xuXG4gICAgICAvLyBTcGFjaW5nXG4gICAgICB0aGlzLnBhZGRpbmcgPSAxMDtcblxuICAgICAgLy8gRGV0ZXJtaW5lIHdoZXJlIGZpcnN0IHBsYXRmb3JtIGFuZCBoZXJvIHdpbGwgYmUuXG4gICAgICB0aGlzLnN0YXJ0WSA9IHRoaXMuZ2FtZS5oZWlnaHQgLSA1O1xuXG4gICAgICAvLyBJbml0aWFsaXplIHRyYWNraW5nIHZhcmlhYmxlc1xuICAgICAgdGhpcy5yZXNldFZpZXdUcmFja2luZygpO1xuXG4gICAgICAvLyBTY2FsaW5nXG4gICAgICB0aGlzLmdhbWUuc2NhbGUuc2NhbGVNb2RlID0gUGhhc2VyLlNjYWxlTWFuYWdlci5TSE9XX0FMTDtcbiAgICAgIHRoaXMuZ2FtZS5zY2FsZS5tYXhXaWR0aCA9IHRoaXMuZ2FtZS53aWR0aDtcbiAgICAgIHRoaXMuZ2FtZS5zY2FsZS5tYXhIZWlnaHQgPSB0aGlzLmdhbWUuaGVpZ2h0O1xuICAgICAgdGhpcy5nYW1lLnNjYWxlLnBhZ2VBbGlnbkhvcml6b250YWxseSA9IHRydWU7XG4gICAgICB0aGlzLmdhbWUuc2NhbGUucGFnZUFsaWduVmVydGljYWxseSA9IHRydWU7XG5cbiAgICAgIC8vIFBoeXNpY3NcbiAgICAgIHRoaXMuZ2FtZS5waHlzaWNzLnN0YXJ0U3lzdGVtKFBoYXNlci5QaHlzaWNzLkFSQ0FERSk7XG4gICAgICB0aGlzLmdhbWUucGh5c2ljcy5hcmNhZGUuZ3Jhdml0eS55ID0gMTAwMDtcblxuICAgICAgLy8gQ29udGFpbmVyc1xuICAgICAgdGhpcy5iZWFucyA9IHRoaXMuZ2FtZS5hZGQuZ3JvdXAoKTtcbiAgICAgIHRoaXMuY2Fycm90cyA9IHRoaXMuZ2FtZS5hZGQuZ3JvdXAoKTtcbiAgICAgIHRoaXMubWluaXMgPSB0aGlzLmdhbWUuYWRkLmdyb3VwKCk7XG4gICAgICB0aGlzLmRpbGxzID0gdGhpcy5nYW1lLmFkZC5ncm91cCgpO1xuICAgICAgdGhpcy5wZXBwZXJzID0gdGhpcy5nYW1lLmFkZC5ncm91cCgpO1xuICAgICAgdGhpcy5ib3RzID0gdGhpcy5nYW1lLmFkZC5ncm91cCgpO1xuXG4gICAgICAvLyBQbGF0Zm9ybXNcbiAgICAgIHRoaXMuYWRkUGxhdGZvcm1zKCk7XG5cbiAgICAgIC8vIEFkZCBoZXJvIGhlcmUgc28gaXMgYWx3YXlzIG9uIHRvcC5cbiAgICAgIHRoaXMuaGVybyA9IG5ldyBwcmVmYWJzLkhlcm8odGhpcy5nYW1lLCAwLCAwKTtcbiAgICAgIHRoaXMuaGVyby5yZXNldFBsYWNlbWVudCh0aGlzLmdhbWUud2lkdGggKiAwLjUsIHRoaXMuc3RhcnRZIC0gdGhpcy5oZXJvLmhlaWdodCAtIDUwKTtcbiAgICAgIHRoaXMuZ2FtZS5hZGQuZXhpc3RpbmcodGhpcy5oZXJvKTtcblxuICAgICAgLy8gSW5pdGlhbGl6ZSBzY29yZVxuICAgICAgdGhpcy5yZXNldFNjb3JlKCk7XG4gICAgICB0aGlzLnVwZGF0ZVNjb3JlKCk7XG5cbiAgICAgIC8vIEN1cnNvcnMsIGlucHV0XG4gICAgICB0aGlzLmN1cnNvcnMgPSB0aGlzLmdhbWUuaW5wdXQua2V5Ym9hcmQuY3JlYXRlQ3Vyc29yS2V5cygpO1xuICAgICAgdGhpcy5hY3Rpb25CdXR0b24gPSB0aGlzLmdhbWUuaW5wdXQua2V5Ym9hcmQuYWRkS2V5KFBoYXNlci5LZXlib2FyZC5TUEFDRUJBUik7XG4gICAgfSxcblxuICAgIC8vIFVwZGF0ZVxuICAgIHVwZGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAvLyBUaGlzIGlzIHdoZXJlIHRoZSBtYWluIG1hZ2ljIGhhcHBlbnNcbiAgICAgIC8vIHRoZSB5IG9mZnNldCBhbmQgdGhlIGhlaWdodCBvZiB0aGUgd29ybGQgYXJlIGFkanVzdGVkXG4gICAgICAvLyB0byBtYXRjaCB0aGUgaGlnaGVzdCBwb2ludCB0aGUgaGVybyBoYXMgcmVhY2hlZFxuICAgICAgdGhpcy53b3JsZC5zZXRCb3VuZHMoMCwgLXRoaXMuaGVyby55Q2hhbmdlLCB0aGlzLmdhbWUud29ybGQud2lkdGgsXG4gICAgICAgIHRoaXMuZ2FtZS5oZWlnaHQgKyB0aGlzLmhlcm8ueUNoYW5nZSk7XG5cbiAgICAgIC8vIFRoZSBidWlsdCBpbiBjYW1lcmEgZm9sbG93IG1ldGhvZHMgd29uJ3Qgd29yayBmb3Igb3VyIG5lZWRzXG4gICAgICAvLyB0aGlzIGlzIGEgY3VzdG9tIGZvbGxvdyBzdHlsZSB0aGF0IHdpbGwgbm90IGV2ZXIgbW92ZSBkb3duLCBpdCBvbmx5IG1vdmVzIHVwXG4gICAgICB0aGlzLmNhbWVyYVlNaW4gPSBNYXRoLm1pbih0aGlzLmNhbWVyYVlNaW4sIHRoaXMuaGVyby55IC0gdGhpcy5nYW1lLmhlaWdodCAvIDIpO1xuICAgICAgdGhpcy5jYW1lcmEueSA9IHRoaXMuY2FtZXJhWU1pbjtcblxuICAgICAgLy8gSWYgaGVybyBmYWxscyBiZWxvdyBjYW1lcmFcbiAgICAgIGlmICh0aGlzLmhlcm8ueSA+IHRoaXMuY2FtZXJhWU1pbiArIHRoaXMuZ2FtZS5oZWlnaHQgKyAyMDApIHtcbiAgICAgICAgdGhpcy5nYW1lT3ZlcigpO1xuICAgICAgfVxuXG4gICAgICAvLyBJZiBoZXJvIGlzIGdvaW5nIGRvd24sIHRoZW4gbm8gbG9uZ2VyIG9uIGZpcmVcbiAgICAgIGlmICh0aGlzLmhlcm8uYm9keS52ZWxvY2l0eS55ID4gMCkge1xuICAgICAgICB0aGlzLnB1dE91dEZpcmUoKTtcbiAgICAgIH1cblxuICAgICAgLy8gTW92ZSBoZXJvXG4gICAgICB0aGlzLmhlcm8uYm9keS52ZWxvY2l0eS54ID1cbiAgICAgICAgKHRoaXMuY3Vyc29ycy5sZWZ0LmlzRG93bikgPyAtKHRoaXMuZ2FtZS5waHlzaWNzLmFyY2FkZS5ncmF2aXR5LnkgLyA1KSA6XG4gICAgICAgICh0aGlzLmN1cnNvcnMucmlnaHQuaXNEb3duKSA/ICh0aGlzLmdhbWUucGh5c2ljcy5hcmNhZGUuZ3Jhdml0eS55IC8gNSkgOiAwO1xuXG4gICAgICAvLyBDb2xsaXNpb25zXG4gICAgICB0aGlzLnVwZGF0ZUNvbGxpc2lvbnMoKTtcblxuICAgICAgLy8gSXRlbXMgKHBsYXRmb3JtcyBhbmQgaXRlbXMpXG4gICAgICB0aGlzLnVwZGF0ZUl0ZW1zKCk7XG5cbiAgICAgIC8vIFVwZGF0ZSBzY29yZVxuICAgICAgdGhpcy51cGRhdGVTY29yZSgpO1xuXG4gICAgICAvLyBVcGRhdGUgZGlmZmljdWx0XG4gICAgICB0aGlzLnVwZGF0ZURpZmZpY3VsdHkoKTtcblxuICAgICAgLy8gRGVidWdcbiAgICAgIGlmICh0aGlzLmdhbWUucGlja2xlLm9wdGlvbnMuZGVidWcpIHtcbiAgICAgICAgdGhpcy5nYW1lLmRlYnVnLmJvZHkodGhpcy5oZXJvKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLy8gSGFuZGxlIGNvbGxpc2lvbnNcbiAgICB1cGRhdGVDb2xsaXNpb25zOiBmdW5jdGlvbigpIHtcbiAgICAgIC8vIFBsYXRmb3JtIGNvbGxpc2lvbnNcbiAgICAgIHRoaXMuZ2FtZS5waHlzaWNzLmFyY2FkZS5jb2xsaWRlKHRoaXMuaGVybywgdGhpcy5iZWFucywgdGhpcy51cGRhdGVIZXJvUGxhdGZvcm0sIG51bGwsIHRoaXMpO1xuICAgICAgdGhpcy5nYW1lLnBoeXNpY3MuYXJjYWRlLmNvbGxpZGUodGhpcy5oZXJvLCB0aGlzLmNhcnJvdHMsIHRoaXMudXBkYXRlSGVyb1BsYXRmb3JtLCBudWxsLCB0aGlzKTtcbiAgICAgIHRoaXMuZ2FtZS5waHlzaWNzLmFyY2FkZS5jb2xsaWRlKHRoaXMuaGVybywgdGhpcy5iYXNlLCB0aGlzLnVwZGF0ZUhlcm9QbGF0Zm9ybSwgbnVsbCwgdGhpcyk7XG5cbiAgICAgIC8vIE1pbmkgY29sbGlzaW9uc1xuICAgICAgdGhpcy5nYW1lLnBoeXNpY3MuYXJjYWRlLm92ZXJsYXAodGhpcy5oZXJvLCB0aGlzLm1pbmlzLCBmdW5jdGlvbihoZXJvLCBtaW5pKSB7XG4gICAgICAgIG1pbmkua2lsbCgpO1xuICAgICAgICB0aGlzLnVwZGF0ZVNjb3JlKHRoaXMuc2NvcmVNaW5pKTtcbiAgICAgIH0sIG51bGwsIHRoaXMpO1xuXG4gICAgICAvLyBEaWxsIGNvbGxpc2lvbnMuICBEb24ndCBkbyBhbnl0aGluZyBpZiBvbiBmaXJlXG4gICAgICBpZiAoIXRoaXMub25GaXJlKSB7XG4gICAgICAgIHRoaXMuZ2FtZS5waHlzaWNzLmFyY2FkZS5vdmVybGFwKHRoaXMuaGVybywgdGhpcy5kaWxscywgZnVuY3Rpb24oaGVybywgZGlsbCkge1xuICAgICAgICAgIGRpbGwua2lsbCgpO1xuICAgICAgICAgIHRoaXMudXBkYXRlU2NvcmUodGhpcy5zY29yZURpbGwpO1xuICAgICAgICAgIGhlcm8uYm9keS52ZWxvY2l0eS55ID0gdGhpcy5nYW1lLnBoeXNpY3MuYXJjYWRlLmdyYXZpdHkueSAqIC0xICogMS41O1xuICAgICAgICB9LCBudWxsLCB0aGlzKTtcbiAgICAgIH1cblxuICAgICAgLy8gUGVwcGVyIGNvbGxpc2lvbnNcbiAgICAgIHRoaXMuZ2FtZS5waHlzaWNzLmFyY2FkZS5vdmVybGFwKHRoaXMuaGVybywgdGhpcy5wZXBwZXJzLCBmdW5jdGlvbihoZXJvLCBwZXBwZXIpIHtcbiAgICAgICAgcGVwcGVyLmtpbGwoKTtcbiAgICAgICAgdGhpcy51cGRhdGVTY29yZSh0aGlzLnNjb3JlUGVwcGVyKTtcbiAgICAgICAgdGhpcy5zZXRPbkZpcmUoKTtcbiAgICAgICAgaGVyby5ib2R5LnZlbG9jaXR5LnkgPSB0aGlzLmdhbWUucGh5c2ljcy5hcmNhZGUuZ3Jhdml0eS55ICogLTEgKiAzO1xuICAgICAgfSwgbnVsbCwgdGhpcyk7XG5cbiAgICAgIC8vIEJvdHVsaXNtIGNvbGxpc2lvbnMuICBJZiBoZXJvIGp1bXBzIG9uIHRvcCwgdGhlbiBraWxsLCBvdGhlcndpc2UgZGllLCBhbmRcbiAgICAgIC8vIGlnbm9yZSBpZiBvbiBmaXJlLlxuICAgICAgaWYgKCF0aGlzLm9uRmlyZSkge1xuICAgICAgICB0aGlzLmdhbWUucGh5c2ljcy5hcmNhZGUuY29sbGlkZSh0aGlzLmhlcm8sIHRoaXMuYm90cywgZnVuY3Rpb24oaGVybywgYm90KSB7XG4gICAgICAgICAgaWYgKGhlcm8uYm9keS50b3VjaGluZy5kb3duKSB7XG4gICAgICAgICAgICBib3QubXVyZGVyKCk7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZVNjb3JlKHRoaXMuc2NvcmVCb3QpO1xuICAgICAgICAgICAgaGVyby5ib2R5LnZlbG9jaXR5LnkgPSB0aGlzLmdhbWUucGh5c2ljcy5hcmNhZGUuZ3Jhdml0eS55ICogLTEgKiAwLjU7XG4gICAgICAgICAgfVxuICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5nYW1lT3ZlcigpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSwgbnVsbCwgdGhpcyk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIC8vIFBsYXRmb3JtIGNvbGxpc2lvblxuICAgIHVwZGF0ZUhlcm9QbGF0Zm9ybTogZnVuY3Rpb24oaGVybywgaXRlbSkge1xuICAgICAgLy8gTWFrZSBzdXJlIG5vIGxvbmdlciBvbiBmaXJlXG4gICAgICB0aGlzLnB1dE91dEZpcmUoKTtcblxuICAgICAgLy8gSnVtcFxuICAgICAgaGVyby5ib2R5LnZlbG9jaXR5LnkgPSB0aGlzLmdhbWUucGh5c2ljcy5hcmNhZGUuZ3Jhdml0eS55ICogLTEgKiAwLjc7XG5cbiAgICAgIC8vIElmIGNhcnJvdCwgc25hcFxuICAgICAgaWYgKGl0ZW0gaW5zdGFuY2VvZiBwcmVmYWJzLkNhcnJvdCkge1xuICAgICAgICBpdGVtLnNuYXAoKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLy8gSGFuZGxlIGl0ZW1zXG4gICAgdXBkYXRlSXRlbXM6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGhpZ2hlc3Q7XG4gICAgICB2YXIgYmVhbjtcbiAgICAgIHZhciBjYXJyb3Q7XG5cbiAgICAgIC8vIFJlbW92ZSBhbnkgaXRlbXMgdGhhdCBhcmUgb2ZmIHNjcmVlblxuICAgICAgW1wibWluaXNcIiwgXCJkaWxsc1wiLCBcImJvdHNcIiwgXCJwZXBwZXJzXCIsIFwiYmVhbnNcIiwgXCJjYXJyb3RzXCJdLmZvckVhY2goXy5iaW5kKGZ1bmN0aW9uKHBvb2wpIHtcbiAgICAgICAgdGhpc1twb29sXS5mb3JFYWNoQWxpdmUoZnVuY3Rpb24ocCkge1xuICAgICAgICAgIC8vIENoZWNrIGlmIHRoaXMgb25lIGlzIG9mIHRoZSBzY3JlZW5cbiAgICAgICAgICBpZiAocC55ID4gdGhpcy5jYW1lcmEueSArIHRoaXMuZ2FtZS5oZWlnaHQpIHtcbiAgICAgICAgICAgIHAua2lsbCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSwgdGhpcyk7XG4gICAgICB9LCB0aGlzKSk7XG5cbiAgICAgIC8vIERldGVybWluZSB3aGVyZSB0aGUgbGFzdCBwbGF0Zm9ybSBpc1xuICAgICAgW1wiYmVhbnNcIiwgXCJjYXJyb3RzXCJdLmZvckVhY2goXy5iaW5kKGZ1bmN0aW9uKGdyb3VwKSB7XG4gICAgICAgIHRoaXNbZ3JvdXBdLmZvckVhY2hBbGl2ZShmdW5jdGlvbihwKSB7XG4gICAgICAgICAgaWYgKHAueSA8IHRoaXMucGxhdGZvcm1ZTWluKSB7XG4gICAgICAgICAgICB0aGlzLnBsYXRmb3JtWU1pbiA9IHAueTtcbiAgICAgICAgICAgIGhpZ2hlc3QgPSBwO1xuICAgICAgICAgIH1cbiAgICAgICAgfSwgdGhpcyk7XG4gICAgICB9LCB0aGlzKSk7XG5cbiAgICAgIC8vIEFkZCBuZXcgcGxhdGZvcm0gaWYgbmVlZGVkXG4gICAgICBjYXJyb3QgPSB0aGlzLmNhcnJvdHMuZ2V0Rmlyc3REZWFkKCk7XG4gICAgICBiZWFuID0gdGhpcy5iZWFucy5nZXRGaXJzdERlYWQoKTtcbiAgICAgIGlmIChjYXJyb3QgJiYgYmVhbikge1xuICAgICAgICBpZiAoTWF0aC5yYW5kb20oKSA8IHRoaXMuY2Fycm90Q2hhbmNlKSB7XG4gICAgICAgICAgdGhpcy5wbGFjZVBsYXRmb3JtKGNhcnJvdCwgaGlnaGVzdCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgdGhpcy5wbGFjZVBsYXRmb3JtKGJlYW4sIGhpZ2hlc3QpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcblxuICAgIC8vIFNodXRkb3duXG4gICAgc2h1dGRvd246IGZ1bmN0aW9uKCkge1xuICAgICAgLy8gUmVzZXQgZXZlcnl0aGluZywgb3IgdGhlIHdvcmxkIHdpbGwgYmUgbWVzc2VkIHVwXG4gICAgICB0aGlzLndvcmxkLnNldEJvdW5kcygwLCAwLCB0aGlzLmdhbWUud2lkdGgsIHRoaXMuZ2FtZS5oZWlnaHQpO1xuICAgICAgdGhpcy5jdXJzb3IgPSBudWxsO1xuICAgICAgdGhpcy5yZXNldFZpZXdUcmFja2luZygpO1xuICAgICAgdGhpcy5yZXNldFNjb3JlKCk7XG5cbiAgICAgIFtcImhlcm9cIiwgXCJiZWFuc1wiLCBcIm1pbmlzXCIsIFwiZGlsbHNcIiwgXCJwZXBwZXJzXCIsXG4gICAgICAgIFwiY2Fycm90c1wiLCBcInNjb3JlR3JvdXBcIl0uZm9yRWFjaChfLmJpbmQoZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICBpZiAodGhpc1tpdGVtXSkge1xuICAgICAgICAgIHRoaXNbaXRlbV0uZGVzdHJveSgpO1xuICAgICAgICAgIHRoaXNbaXRlbV0gPSBudWxsO1xuICAgICAgICB9XG4gICAgICB9LCB0aGlzKSk7XG4gICAgfSxcblxuICAgIC8vIEdhbWUgb3ZlclxuICAgIGdhbWVPdmVyOiBmdW5jdGlvbigpIHtcbiAgICAgIC8vIENhbid0IHNlZW0gdG8gZmluZCBhIHdheSB0byBwYXNzIHRoZSBzY29yZVxuICAgICAgLy8gdmlhIGEgc3RhdGUgY2hhbmdlLlxuICAgICAgdGhpcy5nYW1lLnBpY2tsZS5zY29yZSA9IHRoaXMuc2NvcmU7XG4gICAgICB0aGlzLmdhbWUuc3RhdGUuc3RhcnQoXCJnYW1lb3ZlclwiKTtcbiAgICB9LFxuXG4gICAgLy8gQWRkIHBsYXRmb3JtIHBvb2wgYW5kIGNyZWF0ZSBpbml0aWFsIG9uZVxuICAgIGFkZFBsYXRmb3JtczogZnVuY3Rpb24oKSB7XG4gICAgICAvLyBBZGQgYmFzZSBwbGF0Zm9ybSAoamFyKS5cbiAgICAgIHRoaXMuYmFzZSA9IG5ldyBwcmVmYWJzLkphcih0aGlzLmdhbWUsIHRoaXMuZ2FtZS53aWR0aCAqIDAuNSwgdGhpcy5zdGFydFksIHRoaXMuZ2FtZS53aWR0aCAqIDIpO1xuICAgICAgdGhpcy5nYW1lLmFkZC5leGlzdGluZyh0aGlzLmJhc2UpO1xuXG4gICAgICAvLyBBZGQgc29tZSBiYXNlIGNhcnJvdHMgKGJ1dCBoYXZlIHRoZW0gb2ZmIHNjcmVlbilcbiAgICAgIF8uZWFjaChfLnJhbmdlKDEwKSwgXy5iaW5kKGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcCA9IG5ldyBwcmVmYWJzLkNhcnJvdCh0aGlzLmdhbWUsIC05OTksIHRoaXMuZ2FtZS5oZWlnaHQgKiAyKTtcbiAgICAgICAgdGhpcy5jYXJyb3RzLmFkZChwKTtcbiAgICAgIH0sIHRoaXMpKTtcblxuICAgICAgLy8gQWRkIHNvbWUgYmFzZSBiZWFuc1xuICAgICAgdmFyIHByZXZpb3VzO1xuICAgICAgXy5lYWNoKF8ucmFuZ2UoMjApLCBfLmJpbmQoZnVuY3Rpb24oaSkge1xuICAgICAgICB2YXIgcCA9IG5ldyBwcmVmYWJzLkJlYW4odGhpcy5nYW1lLCAwLCAwKTtcbiAgICAgICAgdGhpcy5wbGFjZVBsYXRmb3JtKHAsIHByZXZpb3VzLCB0aGlzLndvcmxkLmhlaWdodCAtIHRoaXMucGxhdGZvcm1TcGFjZVkgLSB0aGlzLnBsYXRmb3JtU3BhY2VZICogaSk7XG4gICAgICAgIHRoaXMuYmVhbnMuYWRkKHApO1xuICAgICAgICBwcmV2aW91cyA9IHA7XG4gICAgICB9LCB0aGlzKSk7XG4gICAgfSxcblxuICAgIC8vIFBsYWNlIHBsYXRmb3JtXG4gICAgcGxhY2VQbGF0Zm9ybTogZnVuY3Rpb24ocGxhdGZvcm0sIHByZXZpb3VzUGxhdGZvcm0sIG92ZXJyaWRlWSwgcGxhdGZvcm1UeXBlKSB7XG4gICAgICBwbGF0Zm9ybS5yZXNldFNldHRpbmdzKCk7XG4gICAgICBwbGF0Zm9ybVR5cGUgPSAocGxhdGZvcm1UeXBlID09PSB1bmRlZmluZWQpID8gXCJiZWFuXCIgOiBwbGF0Zm9ybVR5cGU7XG4gICAgICB2YXIgeSA9IG92ZXJyaWRlWSB8fCB0aGlzLnBsYXRmb3JtWU1pbiAtIHRoaXMucGxhdGZvcm1TcGFjZVk7XG4gICAgICB2YXIgbWluWCA9IHBsYXRmb3JtLm1pblg7XG4gICAgICB2YXIgbWF4WCA9IHBsYXRmb3JtLm1heFg7XG5cbiAgICAgIC8vIERldGVybWluZSB4IGJhc2VkIG9uIHByZXZpb3VzUGxhdGZvcm1cbiAgICAgIHZhciB4ID0gdGhpcy5ybmQuaW50ZWdlckluUmFuZ2UobWluWCwgbWF4WCk7XG4gICAgICBpZiAocHJldmlvdXNQbGF0Zm9ybSkge1xuICAgICAgICB4ID0gdGhpcy5ybmQuaW50ZWdlckluUmFuZ2UocHJldmlvdXNQbGF0Zm9ybS54IC0gdGhpcy5wbGF0Zm9ybUdhcE1heCwgcHJldmlvdXNQbGF0Zm9ybS54ICsgdGhpcy5wbGF0Zm9ybUdhcE1heCk7XG5cbiAgICAgICAgLy8gU29tZSBsb2dpYyB0byB0cnkgdG8gd3JhcFxuICAgICAgICB4ID0gKHggPCAwKSA/IE1hdGgubWluKG1heFgsIHRoaXMud29ybGQud2lkdGggKyB4KSA6IE1hdGgubWF4KHgsIG1pblgpO1xuICAgICAgICB4ID0gKHggPiB0aGlzLndvcmxkLndpZHRoKSA/IE1hdGgubWF4KG1pblgsIHggLSB0aGlzLndvcmxkLndpZHRoKSA6IE1hdGgubWluKHgsIG1heFgpO1xuICAgICAgfVxuXG4gICAgICAvLyBQbGFjZVxuICAgICAgcGxhdGZvcm0ucmVzZXQoeCwgeSk7XG5cbiAgICAgIC8vIEFkZCBzb21lIGZsdWZmXG4gICAgICB0aGlzLmZsdWZmUGxhdGZvcm0ocGxhdGZvcm0pO1xuICAgIH0sXG5cbiAgICAvLyBBZGQgcG9zc2libGUgZmx1ZmYgdG8gcGxhdGZvcm1cbiAgICBmbHVmZlBsYXRmb3JtOiBmdW5jdGlvbihwbGF0Zm9ybSkge1xuICAgICAgdmFyIHggPSBwbGF0Zm9ybS54O1xuICAgICAgdmFyIHkgPSBwbGF0Zm9ybS55IC0gcGxhdGZvcm0uaGVpZ2h0IC8gMiAtIDMwO1xuXG4gICAgICAvLyBBZGQgZmx1ZmZcbiAgICAgIGlmIChNYXRoLnJhbmRvbSgpIDw9IHRoaXMuaG92ZXJDaGFuY2UpIHtcbiAgICAgICAgcGxhdGZvcm0uaG92ZXIgPSB0cnVlO1xuICAgICAgfVxuICAgICAgZWxzZSBpZiAoTWF0aC5yYW5kb20oKSA8PSB0aGlzLm1pbmlDaGFuY2UpIHtcbiAgICAgICAgdGhpcy5hZGRXaXRoUG9vbCh0aGlzLm1pbmlzLCBcIk1pbmlcIiwgeCwgeSk7XG4gICAgICB9XG4gICAgICBlbHNlIGlmIChNYXRoLnJhbmRvbSgpIDw9IHRoaXMuZGlsbENoYW5jZSkge1xuICAgICAgICB0aGlzLmFkZFdpdGhQb29sKHRoaXMuZGlsbHMsIFwiRGlsbFwiLCB4LCB5KTtcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKE1hdGgucmFuZG9tKCkgPD0gdGhpcy5ib3RDaGFuY2UpIHtcbiAgICAgICAgdGhpcy5hZGRXaXRoUG9vbCh0aGlzLmJvdHMsIFwiQm90dWxpc21cIiwgeCwgeSk7XG4gICAgICB9XG4gICAgICBlbHNlIGlmIChNYXRoLnJhbmRvbSgpIDw9IHRoaXMucGVwcGVyQ2hhbmNlKSB7XG4gICAgICAgIHRoaXMuYWRkV2l0aFBvb2wodGhpcy5wZXBwZXJzLCBcIlBlcHBlclwiLCB4LCB5KTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLy8gR2VuZXJpYyBhZGQgd2l0aCBwb29saW5nIGZ1bmN0aW9uYWxsaXR5XG4gICAgYWRkV2l0aFBvb2w6IGZ1bmN0aW9uKHBvb2wsIHByZWZhYiwgeCwgeSkge1xuICAgICAgdmFyIG8gPSBwb29sLmdldEZpcnN0RGVhZCgpO1xuICAgICAgbyA9IG8gfHwgbmV3IHByZWZhYnNbcHJlZmFiXSh0aGlzLmdhbWUsIHgsIHkpO1xuXG4gICAgICAvLyBVc2UgY3VzdG9tIHJlc2V0IGlmIGF2YWlsYWJsZVxuICAgICAgaWYgKG8ucmVzZXRQbGFjZW1lbnQpIHtcbiAgICAgICAgby5yZXNldFBsYWNlbWVudCh4LCB5KTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICBvLnJlc2V0KHgsIHkpO1xuICAgICAgfVxuXG4gICAgICBwb29sLmFkZChvKTtcbiAgICB9LFxuXG4gICAgLy8gVXBkYXRlIHNjb3JlLiAgU2NvcmUgaXMgdGhlIHNjb3JlIHdpdGhvdXQgaG93IGZhciB0aGV5IGhhdmUgZ29uZSB1cC5cbiAgICB1cGRhdGVTY29yZTogZnVuY3Rpb24oYWRkaXRpb24pIHtcbiAgICAgIGFkZGl0aW9uID0gYWRkaXRpb24gfHwgMDtcbiAgICAgIHRoaXMuc2NvcmVVcCA9ICgtdGhpcy5jYW1lcmFZTWluID49IDk5OTk5OTkpID8gMCA6XG4gICAgICAgIE1hdGgubWluKE1hdGgubWF4KDAsIC10aGlzLmNhbWVyYVlNaW4pLCA5OTk5OTk5IC0gMSk7XG4gICAgICB0aGlzLnNjb3JlQ29sbGVjdCA9ICh0aGlzLnNjb3JlQ29sbGVjdCB8fCAwKSArIGFkZGl0aW9uO1xuICAgICAgdGhpcy5zY29yZSA9IE1hdGgucm91bmQodGhpcy5zY29yZVVwICsgdGhpcy5zY29yZUNvbGxlY3QpO1xuXG4gICAgICAvLyBTY29yZSB0ZXh0XG4gICAgICBpZiAoIXRoaXMuc2NvcmVHcm91cCkge1xuICAgICAgICB0aGlzLnNjb3JlR3JvdXAgPSB0aGlzLmdhbWUuYWRkLmdyb3VwKCk7XG5cbiAgICAgICAgLy8gU2NvcmUgbGFiZWxcbiAgICAgICAgdGhpcy5zY29yZUxhYmVsSW1hZ2UgPSB0aGlzLmdhbWUuYWRkLnNwcml0ZShcbiAgICAgICAgICB0aGlzLnBhZGRpbmcsXG4gICAgICAgICAgdGhpcy5wYWRkaW5nICogMC44NSwgXCJnYW1lLXNwcml0ZXNcIiwgXCJ5b3VyLXNjb3JlLnBuZ1wiKTtcbiAgICAgICAgdGhpcy5zY29yZUxhYmVsSW1hZ2UuYW5jaG9yLnNldFRvKDAsIDApO1xuICAgICAgICB0aGlzLnNjb3JlTGFiZWxJbWFnZS5zY2FsZS5zZXRUbygodGhpcy5nYW1lLndpZHRoIC8gNikgLyB0aGlzLnNjb3JlTGFiZWxJbWFnZS53aWR0aCk7XG4gICAgICAgIHRoaXMuc2NvcmVHcm91cC5hZGQodGhpcy5zY29yZUxhYmVsSW1hZ2UpO1xuXG4gICAgICAgIC8vIFNjb3JlIHRleHRcbiAgICAgICAgdGhpcy5zY29yZVRleHQgPSB0aGlzLmdhbWUuYWRkLnRleHQoXG4gICAgICAgICAgdGhpcy5zY29yZUxhYmVsSW1hZ2Uud2lkdGggKyAodGhpcy5wYWRkaW5nICogMiksXG4gICAgICAgICAgdGhpcy5wYWRkaW5nICogMC4yNSxcbiAgICAgICAgICB0aGlzLnNjb3JlLnRvTG9jYWxlU3RyaW5nKCksIHtcbiAgICAgICAgICAgIGZvbnQ6IFwiYm9sZCBcIiArICh0aGlzLmdhbWUud29ybGQuaGVpZ2h0IC8gNDApICsgXCJweCBEb3Npc1wiLFxuICAgICAgICAgICAgZmlsbDogXCIjMzliNTRhXCIsXG4gICAgICAgICAgICBhbGlnbjogXCJsZWZ0XCIsXG4gICAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuc2NvcmVUZXh0LmFuY2hvci5zZXRUbygwLCAwKTtcbiAgICAgICAgdGhpcy5zY29yZUdyb3VwLmFkZCh0aGlzLnNjb3JlVGV4dCk7XG5cbiAgICAgICAgdGhpcy5zY29yZUdyb3VwLmZpeGVkVG9DYW1lcmEgPSB0cnVlO1xuICAgICAgICB0aGlzLnNjb3JlR3JvdXAuY2FtZXJhT2Zmc2V0LnNldFRvKHRoaXMucGFkZGluZywgdGhpcy5wYWRkaW5nKTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICB0aGlzLnNjb3JlVGV4dC50ZXh0ID0gdGhpcy5zY29yZS50b0xvY2FsZVN0cmluZygpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICAvLyBSZXNldCBzY29yZVxuICAgIHJlc2V0U2NvcmU6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zY29yZVVwID0gMDtcbiAgICAgIHRoaXMuc2NvcmVDb2xsZWN0ID0gMDtcbiAgICAgIHRoaXMuc2NvcmUgPSAwO1xuICAgIH0sXG5cbiAgICAvLyBSZXNldCB2aWV3IHRyYWNraW5nXG4gICAgcmVzZXRWaWV3VHJhY2tpbmc6IGZ1bmN0aW9uKCkge1xuICAgICAgLy8gQ2FtZXJhIGFuZCBwbGF0Zm9ybSB0cmFja2luZyB2YXJzXG4gICAgICB0aGlzLmNhbWVyYVlNaW4gPSA5OTk5OTk5O1xuICAgICAgdGhpcy5wbGF0Zm9ybVlNaW4gPSA5OTk5OTk5O1xuICAgIH0sXG5cbiAgICAvLyBHZW5lcmFsIHRvdWNoaW5nXG4gICAgaXNUb3VjaGluZzogZnVuY3Rpb24oYm9keSkge1xuICAgICAgaWYgKGJvZHkgJiYgYm9keS50b3VjaCkge1xuICAgICAgICByZXR1cm4gKGJvZHkudG91Y2hpbmcudXAgfHwgYm9keS50b3VjaGluZy5kb3duIHx8XG4gICAgICAgICAgYm9keS50b3VjaGluZy5sZWZ0IHx8IGJvZHkudG91Y2hpbmcucmlnaHQpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSxcblxuICAgIC8vIERldGVybWluZSBkaWZmaWN1bHR5XG4gICAgdXBkYXRlRGlmZmljdWx0eTogZnVuY3Rpb24oKSB7XG4gICAgICAvLyBJbml0aWFsIHN0YXRlXG4gICAgICB0aGlzLnBsYXRmb3JtU3BhY2VZID0gMTEwO1xuICAgICAgdGhpcy5wbGF0Zm9ybUdhcE1heCA9IDIwMDtcbiAgICAgIHRoaXMuaG92ZXJDaGFuY2UgPSAwLjE7XG4gICAgICB0aGlzLm1pbmlDaGFuY2UgPSAwLjM7XG4gICAgICB0aGlzLmRpbGxDaGFuY2UgPSAwLjM7XG4gICAgICB0aGlzLmJvdENoYW5jZSA9IDE7XG4gICAgICB0aGlzLnBlcHBlckNoYW5jZSA9IDAuMTtcbiAgICAgIHRoaXMuY2Fycm90Q2hhbmNlID0gMC41O1xuXG4gICAgICAvLyBTZXQgaW5pdGlhbCBiYWNrZ3JvdW5kXG4gICAgICB0aGlzLmdhbWUuc3RhZ2UuYmFja2dyb3VuZENvbG9yID0gXCIjOTM3RDZGXCI7XG5cbiAgICAgIC8vIEluaXRpbGEgcGh5c2ljcyB0aW1lXG4gICAgICAvL3RoaXMuZ2FtZS50aW1lLnNsb3dNb3Rpb24gPSAxO1xuXG4gICAgICAvLyBGaXJzdCBsZXZlbFxuICAgICAgaWYgKHRoaXMuY2FtZXJhWU1pbiA+IC0yMDAwMCkge1xuICAgICAgICAvLyBEZWZhdWx0XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gU2Vjb25kIGxldmVsXG4gICAgICBlbHNlIGlmICh0aGlzLmNhbWVyYVlNaW4gPiAtNDAwMDApIHtcbiAgICAgICAgdGhpcy5ob3ZlckNoYW5jZSA9IDAuMztcbiAgICAgICAgdGhpcy5taW5pQ2hhbmNlID0gMC4zO1xuICAgICAgICB0aGlzLmRpbGxDaGFuY2UgPSAwLjQ7XG4gICAgICAgIHRoaXMuYm90Q2hhbmNlID0gMC4yO1xuICAgICAgICB0aGlzLmdhbWUuc3RhZ2UuYmFja2dyb3VuZENvbG9yID0gXCIjQkRERUI2XCI7XG4gICAgICB9XG5cbiAgICAgIC8vIFRoaXJkIGxldmVsXG4gICAgICBlbHNlIGlmICh0aGlzLmNhbWVyYVlNaW4gPiAtNjAwMDApIHtcbiAgICAgICAgdGhpcy5ob3ZlckNoYW5jZSA9IDAuNDtcbiAgICAgICAgdGhpcy5taW5pQ2hhbmNlID0gMC4yO1xuICAgICAgICB0aGlzLmRpbGxDaGFuY2UgPSAwLjQ7XG4gICAgICAgIHRoaXMuYm90Q2hhbmNlID0gMC4zO1xuICAgICAgICB0aGlzLmdhbWUuc3RhZ2UuYmFja2dyb3VuZENvbG9yID0gXCIjQjFFMEVDXCI7XG4gICAgICB9XG5cbiAgICAgIC8vIEZvdXJ0aCBsZXZlbFxuICAgICAgZWxzZSBpZiAodGhpcy5jYW1lcmFZTWluID4gLTgwMDAwKSB7XG4gICAgICAgIHRoaXMuYmdHcm91cC52aXNpYmxlID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5ob3ZlckNoYW5jZSA9IDAuNDtcbiAgICAgICAgdGhpcy5taW5pQ2hhbmNlID0gMC4yO1xuICAgICAgICB0aGlzLmRpbGxDaGFuY2UgPSAwLjQ7XG4gICAgICAgIHRoaXMuYm90Q2hhbmNlID0gMC4zO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICAvLyBDcmVhdGUgc3VwZXIgbGV2ZWwgZ3JhZGllbnRcbiAgICBjcmVhdGVTdXBlckxldmVsQkc6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zbGJnQk0gPSB0aGlzLmdhbWUubWFrZS5iaXRtYXBEYXRhKHRoaXMuZ2FtZS53aWR0aCwgdGhpcy5nYW1lLmhlaWdodCk7XG5cbiAgICAgIC8vIENyZWF0ZSBncmFkaWVudFxuICAgICAgdmFyIGdyYWRpZW50ID0gdGhpcy5zbGJnQk0uY29udGV4dC5jcmVhdGVMaW5lYXJHcmFkaWVudChcbiAgICAgICAgMCwgdGhpcy5nYW1lLmhlaWdodCAvIDIsIHRoaXMuZ2FtZS53aWR0aCwgdGhpcy5nYW1lLmhlaWdodCAvIDIpO1xuICAgICAgZ3JhZGllbnQuYWRkQ29sb3JTdG9wKDAsIFwiIzRGM0Y5QVwiKTtcbiAgICAgIGdyYWRpZW50LmFkZENvbG9yU3RvcCgxLCBcIiNFNzBCOERcIik7XG5cbiAgICAgIC8vIEFkZCB0byBiaXRtYXBcbiAgICAgIHRoaXMuc2xiZ0JNLmNvbnRleHQuZmlsbFN0eWxlID0gZ3JhZGllbnQ7XG4gICAgICB0aGlzLnNsYmdCTS5jb250ZXh0LmZpbGxSZWN0KDAsIDAsIHRoaXMuZ2FtZS53aWR0aCwgdGhpcy5nYW1lLmhlaWdodCk7XG5cbiAgICAgIC8vIENyZWF0ZSBiYWNrZ3JvdW5kIGdyb3VwIHNvIHRoYXQgd2UgY2FuIHB1dCB0aGlzIHRoZXJlIGxhdGVyXG4gICAgICB0aGlzLmJnR3JvdXAgPSB0aGlzLmdhbWUuYWRkLmdyb3VwKCk7XG4gICAgICB0aGlzLmJnR3JvdXAuZml4ZWRUb0NhbWVyYSA9IHRydWU7XG5cbiAgICAgIC8vIEFkZCBjcmF6eSBiYWNrZ3JvdW5kIGFuZCB0aGVuIGhpZGUgc2luY2UgYWRkaW5nIGluIG1pZGRsZVxuICAgICAgLy8gcmVhbGx5IG1lc3NlcyB3aXRoIHRoaW5nc1xuICAgICAgdGhpcy5iZ0dyb3VwLmNyZWF0ZSgwLCAwLCB0aGlzLnNsYmdCTSk7XG4gICAgICB0aGlzLmJnR3JvdXAudmlzaWJsZSA9IGZhbHNlO1xuICAgIH0sXG5cbiAgICAvLyBTZXQgb24gZmlyZVxuICAgIHNldE9uRmlyZTogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLm9uRmlyZSA9IHRydWU7XG4gICAgICB0aGlzLmhlcm8uc2V0T25GaXJlKCk7XG4gICAgfSxcblxuICAgIC8vIFNldCBvZmYgZmlyZVxuICAgIHB1dE91dEZpcmU6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5vbkZpcmUgPSBmYWxzZTtcbiAgICAgIHRoaXMuaGVyby5wdXRPdXRGaXJlKCk7XG4gICAgfVxuICB9KTtcblxuICAvLyBFeHBvcnRcbiAgbW9kdWxlLmV4cG9ydHMgPSBQbGF5O1xufSkoKTtcbiJdfQ==
