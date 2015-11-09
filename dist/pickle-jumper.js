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

    // Hide overlay parts
    hideOverlay: function(selector) {
      $(this.options.parentEl).find(selector).hide();
    },

    // Show overlay parts
    showOverlay: function(selector) {
      $(this.options.parentEl).find(selector).show();
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
  $(document).ready(function() {
    var p;
    p = new Pickle({
      el: "#pickle-jumper",
      parentEl: ".game-wrapper",
      debug: false
    });
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

    // Make the collision body a bit smaller
    var bodyScale = 0.8;
    this.body.setSize(this.width * bodyScale, this.height * bodyScale,
      (this.width - (this.width * bodyScale)) / 2,
      (this.height - (this.height * bodyScale)) / 2);

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
    this.isDead = false;

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
      if (!this.onFire && !this.isDead) {
        this.animations.play("jump-up", 15, false);
      }
    },

    // Jump down
    doJumpDown: function() {
      if (!this.onFire && !this.isDead) {
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
    },

    // Murder with botchy
    botchyMuder: function() {
      this.isDead = true;
      this.loadTexture("pickle-sprites", "pickle-botchy.png");

      var tween = this.game.add.tween(this).to({
        angle: 175
      }, 500, Phaser.Easing.Linear.None, true);

      tween.onComplete.add(_.bind(function() {
        // Do something
      }, this));
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

      // Make padding dependent on width
      this.padding = this.game.width / 50;

      // Place title
      this.titleImage = this.game.add.sprite(0, 0, "gameover-sprites", "gameover.png");
      this.titleImage.anchor.setTo(0.5, 0);
      this.titleImage.scale.setTo((this.game.width - (this.padding * 16)) / this.titleImage.width);
      this.titleImage.reset(this.centerStageX(this.titleImage), this.padding * 2);
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
    },

    // Center x on stage
    centerStageX: function(obj) {
      return ((this.game.width - obj.width) / 2) + (obj.width / 2);
    },

    // Center x on stage
    centerStageY: function(obj) {
      return ((this.game.height - obj.height) / 2) + (obj.height / 2);
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

      // Make padding dependent on width
      this.padding = this.game.width / 50;

      // Place title
      this.titleImage = this.game.add.sprite(0, 0, "title-sprites", "title.png");
      this.titleImage.anchor.setTo(0.5, 0.5);
      this.titleImage.scale.setTo((this.game.width - (this.padding * 4)) / this.titleImage.width);
      this.titleImage.reset(this.centerStageX(this.titleImage),
        this.centerStageY(this.titleImage) - this.padding * 4);
      this.game.add.existing(this.titleImage);

      // Place play
      this.playImage = this.game.add.sprite(0, 0, "title-sprites", "title-play.png");
      this.playImage.anchor.setTo(0.4, 1);
      this.playImage.scale.setTo((this.game.width * 0.5) / this.titleImage.width);
      this.playImage.reset(this.centerStageX(this.playImage), this.game.height - this.padding * 2);
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

      // Show any overlays
      this.game.pickle.showOverlay(".state-menu");
    },

    // Start playing
    go: function() {
      this.game.pickle.hideOverlay(".state-menu");
      this.game.state.start("play");
    },

    // Update
    update: function() {
    },

    // Center x on stage
    centerStageX: function(obj) {
      return ((this.game.width - obj.width) / 2) + (obj.width / 2);
    },

    // Center x on stage
    centerStageY: function(obj) {
      return ((this.game.height - obj.height) / 2) + (obj.height / 2);
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
      // When dead, no collisions, just fall to death.
      if (this.hero.isDead) {
        return;
      }

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
            hero.botchyMuder();
            bot.murder();
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
        /*
        this.scoreLabelImage = this.game.add.sprite(
          this.padding,
          this.padding * 0.85, "game-sprites", "your-score.png");
        this.scoreLabelImage.anchor.setTo(0, 0);
        this.scoreLabelImage.scale.setTo((this.game.width / 5) / this.scoreLabelImage.width);
        this.scoreGroup.add(this.scoreLabelImage);
        */

        // Score text
        this.scoreText = this.game.add.text(this.padding, 0,
          this.score.toLocaleString(), {
            font: "bold " + (this.game.world.height / 30) + "px OmnesRoman",
            fill: "#39b54a",
            align: "left",
          });
        this.scoreText.anchor.setTo(0, 0);
        this.scoreText.setShadow(1, 1, "rgba(0, 0, 0, 0.3)", 2);
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
      this.botChance = 0;
      this.pepperChance = 0.1;
      this.carrotChance = 0.1;

      // Set initial background
      this.game.stage.backgroundColor = "#937D6F";

      // Initila physics time
      //this.game.time.slowMotion = 1;

      // First level
      if (!this.cameraYMin || this.cameraYMin > -20000) {
        // Default
        return;
      }

      // Second level
      else if (this.cameraYMin > -40000) {
        this.hoverChance = 0.3;
        this.miniChance = 0.3;
        this.dillChance = 0.4;
        this.botChance = 0.2;
        this.carrotChance = 0.2;
        this.game.stage.backgroundColor = "#BDDEB6";
      }

      // Third level
      else if (this.cameraYMin > -60000) {
        this.hoverChance = 0.4;
        this.miniChance = 0.2;
        this.dillChance = 0.4;
        this.botChance = 0.3;
        this.carrotChance = 0.3;
        this.game.stage.backgroundColor = "#B1E0EC";
      }

      // Fourth level
      else {
        this.bgGroup.visible = true;
        this.hoverChance = 0.4;
        this.miniChance = 0.2;
        this.dillChance = 0.4;
        this.botChance = 0.3;
        this.carrotChance = 0.4;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy96em9sby9Db2RlL3BlcnNvbmFsL3BpY2tsZS1qdW1wZXIvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIi9Vc2Vycy96em9sby9Db2RlL3BlcnNvbmFsL3BpY2tsZS1qdW1wZXIvanMvZmFrZV9hNjkwNmY3ZC5qcyIsIi9Vc2Vycy96em9sby9Db2RlL3BlcnNvbmFsL3BpY2tsZS1qdW1wZXIvanMvcGlja2xlLWp1bXBlci9wcmVmYWItYmVhbi5qcyIsIi9Vc2Vycy96em9sby9Db2RlL3BlcnNvbmFsL3BpY2tsZS1qdW1wZXIvanMvcGlja2xlLWp1bXBlci9wcmVmYWItYm90dWxpc20uanMiLCIvVXNlcnMvenpvbG8vQ29kZS9wZXJzb25hbC9waWNrbGUtanVtcGVyL2pzL3BpY2tsZS1qdW1wZXIvcHJlZmFiLWNhcnJvdC5qcyIsIi9Vc2Vycy96em9sby9Db2RlL3BlcnNvbmFsL3BpY2tsZS1qdW1wZXIvanMvcGlja2xlLWp1bXBlci9wcmVmYWItZGlsbC5qcyIsIi9Vc2Vycy96em9sby9Db2RlL3BlcnNvbmFsL3BpY2tsZS1qdW1wZXIvanMvcGlja2xlLWp1bXBlci9wcmVmYWItaGVyby5qcyIsIi9Vc2Vycy96em9sby9Db2RlL3BlcnNvbmFsL3BpY2tsZS1qdW1wZXIvanMvcGlja2xlLWp1bXBlci9wcmVmYWItamFyLmpzIiwiL1VzZXJzL3p6b2xvL0NvZGUvcGVyc29uYWwvcGlja2xlLWp1bXBlci9qcy9waWNrbGUtanVtcGVyL3ByZWZhYi1taW5pLmpzIiwiL1VzZXJzL3p6b2xvL0NvZGUvcGVyc29uYWwvcGlja2xlLWp1bXBlci9qcy9waWNrbGUtanVtcGVyL3ByZWZhYi1wZXBwZXIuanMiLCIvVXNlcnMvenpvbG8vQ29kZS9wZXJzb25hbC9waWNrbGUtanVtcGVyL2pzL3BpY2tsZS1qdW1wZXIvc3RhdGUtZ2FtZW92ZXIuanMiLCIvVXNlcnMvenpvbG8vQ29kZS9wZXJzb25hbC9waWNrbGUtanVtcGVyL2pzL3BpY2tsZS1qdW1wZXIvc3RhdGUtbWVudS5qcyIsIi9Vc2Vycy96em9sby9Db2RlL3BlcnNvbmFsL3BpY2tsZS1qdW1wZXIvanMvcGlja2xlLWp1bXBlci9zdGF0ZS1wbGF5LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2SkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdFZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qIGdsb2JhbCBfOmZhbHNlLCAkOmZhbHNlLCBQaGFzZXI6ZmFsc2UgKi9cblxuLyoqXG4gKiBNYWluIEpTIGZvciBQaWNrbGUgSnVtcGVyXG4gKi9cblxuKGZ1bmN0aW9uKCkge1xuICBcInVzZSBzdHJpY3RcIjtcblxuICAvLyBEZXBlbmRlbmNpZXNcbiAgdmFyIHN0YXRlcyA9IHtcbiAgICBHYW1lb3ZlcjogcmVxdWlyZShcIi4vcGlja2xlLWp1bXBlci9zdGF0ZS1nYW1lb3Zlci5qc1wiKSxcbiAgICBQbGF5OiByZXF1aXJlKFwiLi9waWNrbGUtanVtcGVyL3N0YXRlLXBsYXkuanNcIiksXG4gICAgTWVudTogcmVxdWlyZShcIi4vcGlja2xlLWp1bXBlci9zdGF0ZS1tZW51LmpzXCIpLFxuICB9O1xuXG4gIC8vIENvbnN0cnVjdG9yZSBmb3IgUGlja2xlXG4gIHZhciBQaWNrbGUgPSB3aW5kb3cuUGlja2xlID0gZnVuY3Rpb24ob3B0aW9ucykge1xuICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG4gICAgdGhpcy5lbCA9IHRoaXMub3B0aW9ucy5lbDtcbiAgICB0aGlzLiRlbCA9ICQodGhpcy5vcHRpb25zLmVsKTtcbiAgICB0aGlzLiQgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiAkKG9wdGlvbnMuZWwpLmZpbmQ7XG4gICAgfTtcblxuICAgIHRoaXMud2lkdGggPSB0aGlzLiRlbC53aWR0aCgpO1xuICAgIHRoaXMuaGVpZ2h0ID0gJCh3aW5kb3cpLmhlaWdodCgpO1xuXG4gICAgLy8gU3RhcnRcbiAgICB0aGlzLnN0YXJ0KCk7XG4gIH07XG5cbiAgLy8gQWRkIHByb3BlcnRpZXNcbiAgXy5leHRlbmQoUGlja2xlLnByb3RvdHlwZSwge1xuICAgIC8vIFN0YXJ0IGV2ZXJ5dGhpbmdcbiAgICBzdGFydDogZnVuY3Rpb24oKSB7XG4gICAgICAvLyBDcmVhdGUgUGhhc2VyIGdhbWVcbiAgICAgIHRoaXMuZ2FtZSA9IG5ldyBQaGFzZXIuR2FtZShcbiAgICAgICAgdGhpcy53aWR0aCxcbiAgICAgICAgdGhpcy5oZWlnaHQsXG4gICAgICAgIFBoYXNlci5BVVRPLFxuICAgICAgICB0aGlzLmVsLnJlcGxhY2UoXCIjXCIsIFwiXCIpKTtcblxuICAgICAgLy8gQWRkIHJlZmVyZW5jZSB0byBnYW1lLCBzaW5jZSBtb3N0IHBhcnRzIGhhdmUgdGhpcyByZWZlcmVuY2VcbiAgICAgIC8vIGFscmVhZHlcbiAgICAgIHRoaXMuZ2FtZS5waWNrbGUgPSB0aGlzO1xuXG4gICAgICAvLyBSZWdpc3RlciBzdGF0ZXNcbiAgICAgIHRoaXMuZ2FtZS5zdGF0ZS5hZGQoXCJtZW51XCIsIHN0YXRlcy5NZW51KTtcbiAgICAgIHRoaXMuZ2FtZS5zdGF0ZS5hZGQoXCJwbGF5XCIsIHN0YXRlcy5QbGF5KTtcbiAgICAgIHRoaXMuZ2FtZS5zdGF0ZS5hZGQoXCJnYW1lb3ZlclwiLCBzdGF0ZXMuR2FtZW92ZXIpO1xuXG4gICAgICAvLyBIaWdoc2NvcmVcbiAgICAgIHRoaXMuaGlnaHNjb3JlTGltaXQgPSAxMDtcbiAgICAgIHRoaXMuZ2V0SGlnaHNjb3JlcygpO1xuXG4gICAgICAvLyBTdGFydCB3aXRoIG1lbnVcbiAgICAgIHRoaXMuZ2FtZS5zdGF0ZS5zdGFydChcIm1lbnVcIik7XG5cbiAgICAgIC8vIERlYnVnXG4gICAgICBpZiAodGhpcy5vcHRpb25zLmRlYnVnKSB7XG4gICAgICAgIHRoaXMucmVzZXRIaWdoc2NvcmVzKCk7XG4gICAgICAgIHRoaXMuZ2V0SGlnaHNjb3JlcygpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICAvLyBIaWRlIG92ZXJsYXkgcGFydHNcbiAgICBoaWRlT3ZlcmxheTogZnVuY3Rpb24oc2VsZWN0b3IpIHtcbiAgICAgICQodGhpcy5vcHRpb25zLnBhcmVudEVsKS5maW5kKHNlbGVjdG9yKS5oaWRlKCk7XG4gICAgfSxcblxuICAgIC8vIFNob3cgb3ZlcmxheSBwYXJ0c1xuICAgIHNob3dPdmVybGF5OiBmdW5jdGlvbihzZWxlY3Rvcikge1xuICAgICAgJCh0aGlzLm9wdGlvbnMucGFyZW50RWwpLmZpbmQoc2VsZWN0b3IpLnNob3coKTtcbiAgICB9LFxuXG4gICAgLy8gR2V0IGhpZ2ggc2NvcmVzXG4gICAgZ2V0SGlnaHNjb3JlczogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgcyA9IHdpbmRvdy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbShcImhpZ2hzY29yZXNcIik7XG4gICAgICBzID0gKHMpID8gSlNPTi5wYXJzZShzKSA6IFtdO1xuICAgICAgdGhpcy5oaWdoc2NvcmVzID0gcztcbiAgICAgIHRoaXMuc29ydEhpZ2hzY29yZXMoKTtcbiAgICAgIHJldHVybiB0aGlzLmhpZ2hzY29yZXM7XG4gICAgfSxcblxuICAgIC8vIEdldCBoaWdoZXN0IHNjb3JlXG4gICAgZ2V0SGlnaHNjb3JlOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBfLm1heCh0aGlzLmhpZ2hzY29yZXMsIFwic2NvcmVcIik7XG4gICAgfSxcblxuICAgIC8vIFNldCBzaW5nbGUgaGlnaHNjb3JlXG4gICAgc2V0SGlnaHNjb3JlOiBmdW5jdGlvbihzY29yZSwgbmFtZSkge1xuICAgICAgaWYgKHRoaXMuaXNIaWdoc2NvcmUoc2NvcmUpKSB7XG4gICAgICAgIHRoaXMuc29ydEhpZ2hzY29yZXMoKTtcblxuICAgICAgICAvLyBSZW1vdmUgbG93ZXN0IG9uZSBpZiBuZWVkZWRcbiAgICAgICAgaWYgKHRoaXMuaGlnaHNjb3Jlcy5sZW5ndGggPj0gdGhpcy5oaWdoc2NvcmVMaW1pdCkge1xuICAgICAgICAgIHRoaXMuaGlnaHNjb3Jlcy5zaGlmdCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQWRkIG5ldyBzY29yZVxuICAgICAgICB0aGlzLmhpZ2hzY29yZXMucHVzaCh7XG4gICAgICAgICAgbmFtZTogbmFtZSxcbiAgICAgICAgICBzY29yZTogc2NvcmVcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gU29ydCBhbmQgc2V0XG4gICAgICAgIHRoaXMuc29ydEhpZ2hzY29yZXMoKTtcbiAgICAgICAgdGhpcy5zZXRIaWdoc2NvcmVzKCk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIC8vIFNvcnQgaGlnaHNjb3Jlc1xuICAgIHNvcnRIaWdoc2NvcmVzOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuaGlnaHNjb3JlcyA9IF8uc29ydEJ5KHRoaXMuaGlnaHNjb3JlcywgXCJzY29yZVwiKTtcbiAgICB9LFxuXG4gICAgLy8gSXMgaGlnaHNjb3JlLiAgSXMgdGhlIHNjb3JlIGhpZ2hlciB0aGFuIHRoZSBsb3dlc3RcbiAgICAvLyByZWNvcmRlZCBzY29yZVxuICAgIGlzSGlnaHNjb3JlOiBmdW5jdGlvbihzY29yZSkge1xuICAgICAgdmFyIG1pbiA9IF8ubWluKHRoaXMuaGlnaHNjb3JlcywgXCJzY29yZVwiKS5zY29yZTtcbiAgICAgIHJldHVybiAoc2NvcmUgPiBtaW4gfHwgdGhpcy5oaWdoc2NvcmVzLmxlbmd0aCA8IHRoaXMuaGlnaHNjb3JlTGltaXQpO1xuICAgIH0sXG5cbiAgICAvLyBDaGVjayBpZiBzY29yZSBpcyBoaWdoZXN0IHNjb3JlXG4gICAgaXNIaWdoZXN0U2NvcmU6IGZ1bmN0aW9uKHNjb3JlKSB7XG4gICAgICB2YXIgbWF4ID0gXy5tYXgodGhpcy5oaWdoc2NvcmVzLCBcInNjb3JlXCIpLnNjb3JlIHx8IDA7XG4gICAgICByZXR1cm4gKHNjb3JlID4gbWF4KTtcbiAgICB9LFxuXG4gICAgLy8gU2V0IGhpZ2hzY29yZXNcbiAgICBzZXRIaWdoc2NvcmVzOiBmdW5jdGlvbigpIHtcbiAgICAgIHdpbmRvdy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbShcImhpZ2hzY29yZXNcIiwgSlNPTi5zdHJpbmdpZnkodGhpcy5oaWdoc2NvcmVzKSk7XG4gICAgfSxcblxuICAgIC8vIFJlc2V0IGhpZ2hzY2hvcmVzXG4gICAgcmVzZXRIaWdoc2NvcmVzOiBmdW5jdGlvbigpIHtcbiAgICAgIHdpbmRvdy5sb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbShcImhpZ2hzY29yZXNcIik7XG4gICAgfVxuICB9KTtcblxuICAvLyBDcmVhdGUgYXBwXG4gICQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCkge1xuICAgIHZhciBwO1xuICAgIHAgPSBuZXcgUGlja2xlKHtcbiAgICAgIGVsOiBcIiNwaWNrbGUtanVtcGVyXCIsXG4gICAgICBwYXJlbnRFbDogXCIuZ2FtZS13cmFwcGVyXCIsXG4gICAgICBkZWJ1ZzogZmFsc2VcbiAgICB9KTtcbiAgfSk7XG59KSgpO1xuIiwiLyogZ2xvYmFsIF86ZmFsc2UsIFBoYXNlcjpmYWxzZSAqL1xuXG4vKipcbiAqIFByZWZhYiBiZWFuIHBsYXRmb3JtXG4gKi9cblxuKGZ1bmN0aW9uKCkge1xuICBcInVzZSBzdHJpY3RcIjtcblxuICAvLyBDb25zdHJ1Y3RvclxuICB2YXIgQmVhbiA9IGZ1bmN0aW9uKGdhbWUsIHgsIHkpIHtcbiAgICAvLyBDYWxsIGRlZmF1bHQgc3ByaXRlXG4gICAgUGhhc2VyLlNwcml0ZS5jYWxsKHRoaXMsIGdhbWUsIHgsIHksIFwiZ2FtZS1zcHJpdGVzXCIsIFwiZGlsbHliZWFuLnBuZ1wiKTtcblxuICAgIC8vIENvbmZpZ3VyZVxuICAgIHRoaXMuYW5jaG9yLnNldFRvKDAuNSwgMC41KTtcbiAgICB0aGlzLnNjYWxlLnNldFRvKCh0aGlzLmdhbWUud2lkdGggLyA1KSAvIHRoaXMud2lkdGgpO1xuICAgIHRoaXMuaG92ZXIgPSBmYWxzZTtcbiAgICB0aGlzLnNldEhvdmVyU3BlZWQoMTAwKTtcblxuICAgIC8vIFBoeXNpY3NcbiAgICB0aGlzLmdhbWUucGh5c2ljcy5hcmNhZGUuZW5hYmxlQm9keSh0aGlzKTtcbiAgICB0aGlzLmJvZHkuYWxsb3dHcmF2aXR5ID0gZmFsc2U7XG4gICAgdGhpcy5ib2R5LmltbW92YWJsZSA9IHRydWU7XG5cbiAgICAvLyBPbmx5IGFsbG93IGZvciBjb2xsaXNzaW9uIHVwXG4gICAgdGhpcy5ib2R5LmNoZWNrQ29sbGlzaW9uLnVwID0gdHJ1ZTtcbiAgICB0aGlzLmJvZHkuY2hlY2tDb2xsaXNpb24uZG93biA9IGZhbHNlO1xuICAgIHRoaXMuYm9keS5jaGVja0NvbGxpc2lvbi5sZWZ0ID0gZmFsc2U7XG4gICAgdGhpcy5ib2R5LmNoZWNrQ29sbGlzaW9uLnJpZ2h0ID0gZmFsc2U7XG5cbiAgICAvLyBEZXRlcm1pbmUgYW5jaG9yIHggYm91bmRzXG4gICAgdGhpcy5wYWRkaW5nWCA9IDEwO1xuICAgIHRoaXMuZ2V0QW5jaG9yQm91bmRzWCgpO1xuICB9O1xuXG4gIC8vIEV4dGVuZCBmcm9tIFNwcml0ZVxuICBCZWFuLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUGhhc2VyLlNwcml0ZS5wcm90b3R5cGUpO1xuICBCZWFuLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEJlYW47XG5cbiAgLy8gQWRkIG1ldGhvZHNcbiAgXy5leHRlbmQoQmVhbi5wcm90b3R5cGUsIHtcbiAgICB1cGRhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKHRoaXMuaG92ZXIpIHtcbiAgICAgICAgdGhpcy5ib2R5LnZlbG9jaXR5LnggPSB0aGlzLmJvZHkudmVsb2NpdHkueCB8fCB0aGlzLmhvdmVyU3BlZWQ7XG4gICAgICAgIHRoaXMuYm9keS52ZWxvY2l0eS54ID0gKHRoaXMueCA8PSB0aGlzLm1pblgpID8gdGhpcy5ob3ZlclNwZWVkIDpcbiAgICAgICAgICAodGhpcy54ID49IHRoaXMubWF4WCkgPyAtdGhpcy5ob3ZlclNwZWVkIDogdGhpcy5ib2R5LnZlbG9jaXR5Lng7XG4gICAgICB9XG4gICAgfSxcblxuICAgIC8vIFNldCBob3ZlciBzcGVlZC4gIEFkZCBhIGJpdCBvZiB2YXJpYW5jZVxuICAgIHNldEhvdmVyU3BlZWQ6IGZ1bmN0aW9uKHNwZWVkKSB7XG4gICAgICB0aGlzLmhvdmVyU3BlZWQgPSBzcGVlZCArIHRoaXMuZ2FtZS5ybmQuaW50ZWdlckluUmFuZ2UoLTUwLCA1MCk7XG4gICAgfSxcblxuICAgIC8vIEdldCBhbmNob3IgYm91bmRzXG4gICAgZ2V0QW5jaG9yQm91bmRzWDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLm1pblggPSB0aGlzLnBhZGRpbmdYICsgKHRoaXMud2lkdGggLyAyKTtcbiAgICAgIHRoaXMubWF4WCA9IHRoaXMuZ2FtZS53aWR0aCAtICh0aGlzLnBhZGRpbmdYICsgKHRoaXMud2lkdGggLyAyKSk7XG4gICAgICByZXR1cm4gW3RoaXMubWluWCwgdGhpcy5tYXhYXTtcbiAgICB9LFxuXG4gICAgLy8gUmVzZXQgdGhpbmdzXG4gICAgcmVzZXRTZXR0aW5nczogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnJlc2V0KDAsIDApO1xuICAgICAgdGhpcy5ib2R5LnZlbG9jaXR5LnggPSAwO1xuICAgICAgdGhpcy5ob3ZlciA9IGZhbHNlO1xuICAgICAgdGhpcy5nZXRBbmNob3JCb3VuZHNYKCk7XG4gICAgfVxuICB9KTtcblxuICAvLyBFeHBvcnRcbiAgbW9kdWxlLmV4cG9ydHMgPSBCZWFuO1xufSkoKTtcbiIsIi8qIGdsb2JhbCBfOmZhbHNlLCBQaGFzZXI6ZmFsc2UgKi9cblxuLyoqXG4gKiBQcmVmYWIgZm9yIEJvdHVsaXNtLCB0aGUgYmFkIGR1ZGVzXG4gKi9cblxuKGZ1bmN0aW9uKCkge1xuICBcInVzZSBzdHJpY3RcIjtcblxuICAvLyBDb25zdHJ1Y3RvclxuICB2YXIgQm90dWxpc20gPSBmdW5jdGlvbihnYW1lLCB4LCB5KSB7XG4gICAgLy8gQ2FsbCBkZWZhdWx0IHNwcml0ZVxuICAgIFBoYXNlci5TcHJpdGUuY2FsbCh0aGlzLCBnYW1lLCB4LCB5LCBcImdhbWUtc3ByaXRlc1wiLCBcImJvdGNoeS5wbmdcIik7XG5cbiAgICAvLyBTaXplXG4gICAgdGhpcy5hbmNob3Iuc2V0VG8oMC41LCAwLjUpO1xuICAgIHRoaXMuc2NhbGUuc2V0VG8oKHRoaXMuZ2FtZS53aWR0aCAvIDEwKSAvIHRoaXMud2lkdGgpO1xuXG4gICAgLy8gQ29uZmlndXJlXG4gICAgdGhpcy5ob3ZlciA9IHRydWU7XG4gICAgdGhpcy5zZXRIb3ZlclNwZWVkKDEwMCk7XG4gICAgdGhpcy5ob3ZlclJhbmdlID0gMTAwO1xuXG4gICAgLy8gUGh5c2ljc1xuICAgIHRoaXMuZ2FtZS5waHlzaWNzLmFyY2FkZS5lbmFibGVCb2R5KHRoaXMpO1xuICAgIHRoaXMuYm9keS5hbGxvd0dyYXZpdHkgPSBmYWxzZTtcbiAgICB0aGlzLmJvZHkuaW1tb3ZhYmxlID0gdHJ1ZTtcblxuICAgIC8vIE1ha2UgdGhlIGNvbGxpc2lvbiBib2R5IGEgYml0IHNtYWxsZXJcbiAgICB2YXIgYm9keVNjYWxlID0gMC44O1xuICAgIHRoaXMuYm9keS5zZXRTaXplKHRoaXMud2lkdGggKiBib2R5U2NhbGUsIHRoaXMuaGVpZ2h0ICogYm9keVNjYWxlLFxuICAgICAgKHRoaXMud2lkdGggLSAodGhpcy53aWR0aCAqIGJvZHlTY2FsZSkpIC8gMixcbiAgICAgICh0aGlzLmhlaWdodCAtICh0aGlzLmhlaWdodCAqIGJvZHlTY2FsZSkpIC8gMik7XG5cbiAgICAvLyBEZXRlcm1pbmUgYW5jaG9yIHggYm91bmRzXG4gICAgdGhpcy5wYWRkaW5nWCA9IDEwO1xuICAgIHRoaXMucmVzZXRQbGFjZW1lbnQoeCwgeSk7XG4gIH07XG5cbiAgLy8gRXh0ZW5kIGZyb20gU3ByaXRlXG4gIEJvdHVsaXNtLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUGhhc2VyLlNwcml0ZS5wcm90b3R5cGUpO1xuICBCb3R1bGlzbS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBCb3R1bGlzbTtcblxuICAvLyBBZGQgbWV0aG9kc1xuICBfLmV4dGVuZChCb3R1bGlzbS5wcm90b3R5cGUsIHtcbiAgICB1cGRhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgLy8gRG8gaG92ZXJcbiAgICAgIGlmICh0aGlzLmhvdmVyKSB7XG4gICAgICAgIHRoaXMuYm9keS52ZWxvY2l0eS54ID0gdGhpcy5ib2R5LnZlbG9jaXR5LnggfHwgdGhpcy5ob3ZlclNwZWVkO1xuICAgICAgICB0aGlzLmJvZHkudmVsb2NpdHkueCA9ICh0aGlzLnggPD0gdGhpcy5taW5YKSA/IHRoaXMuaG92ZXJTcGVlZCA6XG4gICAgICAgICAgKHRoaXMueCA+PSB0aGlzLm1heFgpID8gLXRoaXMuaG92ZXJTcGVlZCA6IHRoaXMuYm9keS52ZWxvY2l0eS54O1xuICAgICAgfVxuICAgIH0sXG5cbiAgICAvLyBTZXQgaG92ZXIgc3BlZWQuICBBZGQgYSBiaXQgb2YgdmFyaWFuY2VcbiAgICBzZXRIb3ZlclNwZWVkOiBmdW5jdGlvbihzcGVlZCkge1xuICAgICAgdGhpcy5ob3ZlclNwZWVkID0gc3BlZWQgKyB0aGlzLmdhbWUucm5kLmludGVnZXJJblJhbmdlKC0yNSwgMjUpO1xuICAgIH0sXG5cbiAgICAvLyBHZXQgYW5jaG9yIGJvdW5kcy4gIFRoaXMgaXMgcmVsYXRpdmUgdG8gd2hlcmUgdGhlIHBsYXRmb3JtIGlzXG4gICAgZ2V0QW5jaG9yQm91bmRzWDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLm1pblggPSBNYXRoLm1heCh0aGlzLnggLSB0aGlzLmhvdmVyUmFuZ2UsIHRoaXMucGFkZGluZ1ggKyAodGhpcy53aWR0aCAvIDIpKTtcbiAgICAgIHRoaXMubWF4WCA9IE1hdGgubWluKHRoaXMueCArIHRoaXMuaG92ZXJSYW5nZSwgdGhpcy5nYW1lLndpZHRoIC0gKHRoaXMucGFkZGluZ1ggKyAodGhpcy53aWR0aCAvIDIpKSk7XG4gICAgICByZXR1cm4gW3RoaXMubWluWCwgdGhpcy5tYXhYXTtcbiAgICB9LFxuXG4gICAgLy8gUmVzZXQgdGhpbmdzXG4gICAgcmVzZXRQbGFjZW1lbnQ6IGZ1bmN0aW9uKHgsIHkpIHtcbiAgICAgIHRoaXMucmVzZXQoeCwgeSk7XG4gICAgICB0aGlzLmJvZHkudmVsb2NpdHkueCA9IDA7XG4gICAgICB0aGlzLmdldEFuY2hvckJvdW5kc1goKTtcbiAgICB9LFxuXG4gICAgLy8gUmVzZXQgaW1hZ2VcbiAgICByZXNldEltYWdlOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuaGVpZ2h0ID0gdGhpcy5vcmlnaW5hbEhlaWdodDtcbiAgICAgIHRoaXMud2lkdGggPSB0aGlzLm9yaWdpbmFsV2lkdGg7XG4gICAgICB0aGlzLmFscGhhID0gMTtcbiAgICB9LFxuXG4gICAgLy8gTXVyZGVyZWQgKG5vdCBqdXN0IGtpbGwpXG4gICAgbXVyZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgIC8vIEdldCBvcmlnaW5hbCBoZWlnaHRcbiAgICAgIHRoaXMub3JpZ2luYWxIZWlnaHQgPSB0aGlzLmhlaWdodDtcbiAgICAgIHRoaXMub3JpZ2luYWxXaWR0aCA9IHRoaXMud2lkdGg7XG5cbiAgICAgIHZhciB0d2VlbiA9IHRoaXMuZ2FtZS5hZGQudHdlZW4odGhpcykudG8oe1xuICAgICAgICBoZWlnaHQ6IDAsXG4gICAgICAgIHdpZHRoOiAwLFxuICAgICAgICBhbHBoYTogMFxuICAgICAgfSwgMjAwLCBQaGFzZXIuRWFzaW5nLkxpbmVhci5Ob25lLCB0cnVlKTtcblxuICAgICAgdHdlZW4ub25Db21wbGV0ZS5hZGQoXy5iaW5kKGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLnJlc2V0SW1hZ2UoKTtcbiAgICAgICAgdGhpcy5raWxsKCk7XG4gICAgICB9LCB0aGlzKSk7XG4gICAgfVxuICB9KTtcblxuICAvLyBFeHBvcnRcbiAgbW9kdWxlLmV4cG9ydHMgPSBCb3R1bGlzbTtcbn0pKCk7XG4iLCIvKiBnbG9iYWwgXzpmYWxzZSwgUGhhc2VyOmZhbHNlICovXG5cbi8qKlxuICogUHJlZmFiIHBsYXRmb3JtXG4gKi9cblxuKGZ1bmN0aW9uKCkge1xuICBcInVzZSBzdHJpY3RcIjtcblxuICAvLyBDb25zdHJ1Y3RvclxuICB2YXIgQ2Fycm90ID0gZnVuY3Rpb24oZ2FtZSwgeCwgeSkge1xuICAgIC8vIENhbGwgZGVmYXVsdCBzcHJpdGVcbiAgICBQaGFzZXIuU3ByaXRlLmNhbGwodGhpcywgZ2FtZSwgeCwgeSwgXCJjYXJyb3Qtc3ByaXRlc1wiLCBcImNhcnJvdC1zbmFwLTAxLnBuZ1wiKTtcblxuICAgIC8vIENvbmZpZ3VyZVxuICAgIHRoaXMuYW5jaG9yLnNldFRvKDAuNSwgMC41KTtcbiAgICB0aGlzLnNjYWxlLnNldFRvKCh0aGlzLmdhbWUud2lkdGggLyA1KSAvIHRoaXMud2lkdGgpO1xuICAgIHRoaXMuaG92ZXIgPSBmYWxzZTtcbiAgICB0aGlzLnNldEhvdmVyU3BlZWQoMTAwKTtcblxuICAgIC8vIFBoeXNpY3NcbiAgICB0aGlzLmdhbWUucGh5c2ljcy5hcmNhZGUuZW5hYmxlQm9keSh0aGlzKTtcbiAgICB0aGlzLmJvZHkuYWxsb3dHcmF2aXR5ID0gZmFsc2U7XG4gICAgdGhpcy5ib2R5LmltbW92YWJsZSA9IHRydWU7XG5cbiAgICAvLyBPbmx5IGFsbG93IGZvciBjb2xsaXNzaW9uIHVwXG4gICAgdGhpcy5ib2R5LmNoZWNrQ29sbGlzaW9uLnVwID0gdHJ1ZTtcbiAgICB0aGlzLmJvZHkuY2hlY2tDb2xsaXNpb24uZG93biA9IGZhbHNlO1xuICAgIHRoaXMuYm9keS5jaGVja0NvbGxpc2lvbi5sZWZ0ID0gZmFsc2U7XG4gICAgdGhpcy5ib2R5LmNoZWNrQ29sbGlzaW9uLnJpZ2h0ID0gZmFsc2U7XG5cbiAgICAvLyBEZXRlcm1pbmUgYW5jaG9yIHggYm91bmRzXG4gICAgdGhpcy5wYWRkaW5nWCA9IDEwO1xuICAgIHRoaXMuZ2V0QW5jaG9yQm91bmRzWCgpO1xuXG4gICAgLy8gU2V0dXAgYW5pbWF0aW9uc1xuICAgIHZhciBzbmFwRnJhbWVzID0gUGhhc2VyLkFuaW1hdGlvbi5nZW5lcmF0ZUZyYW1lTmFtZXMoXCJjYXJyb3Qtc25hcC1cIiwgMSwgNSwgXCIucG5nXCIsIDIpO1xuICAgIHRoaXMuc25hcEFuaW1hdGlvbiA9IHRoaXMuYW5pbWF0aW9ucy5hZGQoXCJzbmFwXCIsIHNuYXBGcmFtZXMpO1xuICAgIHRoaXMuc25hcEFuaW1hdGlvbi5vbkNvbXBsZXRlLmFkZCh0aGlzLnNuYXBwZWQsIHRoaXMpO1xuICB9O1xuXG4gIC8vIEV4dGVuZCBmcm9tIFNwcml0ZVxuICBDYXJyb3QucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQaGFzZXIuU3ByaXRlLnByb3RvdHlwZSk7XG4gIENhcnJvdC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBDYXJyb3Q7XG5cbiAgLy8gQWRkIG1ldGhvZHNcbiAgXy5leHRlbmQoQ2Fycm90LnByb3RvdHlwZSwge1xuICAgIHVwZGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICBpZiAodGhpcy5ob3Zlcikge1xuICAgICAgICB0aGlzLmJvZHkudmVsb2NpdHkueCA9IHRoaXMuYm9keS52ZWxvY2l0eS54IHx8IHRoaXMuaG92ZXJTcGVlZDtcbiAgICAgICAgdGhpcy5ib2R5LnZlbG9jaXR5LnggPSAodGhpcy54IDw9IHRoaXMubWluWCkgPyB0aGlzLmhvdmVyU3BlZWQgOlxuICAgICAgICAgICh0aGlzLnggPj0gdGhpcy5tYXhYKSA/IC10aGlzLmhvdmVyU3BlZWQgOiB0aGlzLmJvZHkudmVsb2NpdHkueDtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLy8gU2V0IGhvdmVyIHNwZWVkLiAgQWRkIGEgYml0IG9mIHZhcmlhbmNlXG4gICAgc2V0SG92ZXJTcGVlZDogZnVuY3Rpb24oc3BlZWQpIHtcbiAgICAgIHRoaXMuaG92ZXJTcGVlZCA9IHNwZWVkICsgdGhpcy5nYW1lLnJuZC5pbnRlZ2VySW5SYW5nZSgtNTAsIDUwKTtcbiAgICB9LFxuXG4gICAgLy8gR2V0IGFuY2hvciBib3VuZHNcbiAgICBnZXRBbmNob3JCb3VuZHNYOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMubWluWCA9IHRoaXMucGFkZGluZ1ggKyAodGhpcy53aWR0aCAvIDIpO1xuICAgICAgdGhpcy5tYXhYID0gdGhpcy5nYW1lLndpZHRoIC0gKHRoaXMucGFkZGluZ1ggKyAodGhpcy53aWR0aCAvIDIpKTtcbiAgICAgIHJldHVybiBbdGhpcy5taW5YLCB0aGlzLm1heFhdO1xuICAgIH0sXG5cbiAgICAvLyBSZXNldCB0aGluZ3NcbiAgICByZXNldFNldHRpbmdzOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMucmVzZXRJbWFnZSgpO1xuICAgICAgdGhpcy5yZXNldCgwLCAwKTtcbiAgICAgIHRoaXMuYm9keS52ZWxvY2l0eS54ID0gMDtcbiAgICAgIHRoaXMuaG92ZXIgPSBmYWxzZTtcbiAgICAgIHRoaXMuZ2V0QW5jaG9yQm91bmRzWCgpO1xuICAgIH0sXG5cbiAgICAvLyBSZXNldCBpbWFnZVxuICAgIHJlc2V0SW1hZ2U6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5hbHBoYSA9IDE7XG4gICAgICB0aGlzLmxvYWRUZXh0dXJlKFwiY2Fycm90LXNwcml0ZXNcIiwgXCJjYXJyb3Qtc25hcC0wMS5wbmdcIik7XG4gICAgfSxcblxuICAgIC8vIFNuYXAgY2Fycm90XG4gICAgc25hcDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLmFuaW1hdGlvbnMucGxheShcInNuYXBcIiwgMTUsIGZhbHNlLCBmYWxzZSk7XG4gICAgfSxcblxuICAgIC8vIFNuYXBwZWRcbiAgICBzbmFwcGVkOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciB0d2VlbiA9IHRoaXMuZ2FtZS5hZGQudHdlZW4odGhpcykudG8oe1xuICAgICAgICBhbHBoYTogMFxuICAgICAgfSwgMjAwLCBQaGFzZXIuRWFzaW5nLkxpbmVhci5Ob25lLCB0cnVlKTtcbiAgICAgIHR3ZWVuLm9uQ29tcGxldGUuYWRkKF8uYmluZChmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5yZXNldEltYWdlKCk7XG4gICAgICAgIHRoaXMua2lsbCgpO1xuICAgICAgfSwgdGhpcykpO1xuICAgIH1cbiAgfSk7XG5cbiAgLy8gRXhwb3J0XG4gIG1vZHVsZS5leHBvcnRzID0gQ2Fycm90O1xufSkoKTtcbiIsIi8qIGdsb2JhbCBfOmZhbHNlLCBQaGFzZXI6ZmFsc2UgKi9cblxuLyoqXG4gKiBQcmVmYWIgKG9iamVjdHMpIERpbGwgZm9yIGJvb3N0aW5nXG4gKi9cblxuKGZ1bmN0aW9uKCkge1xuICBcInVzZSBzdHJpY3RcIjtcblxuICAvLyBDb25zdHJ1Y3RvclxuICB2YXIgRGlsbCA9IGZ1bmN0aW9uKGdhbWUsIHgsIHkpIHtcbiAgICAvLyBDYWxsIGRlZmF1bHQgc3ByaXRlXG4gICAgUGhhc2VyLlNwcml0ZS5jYWxsKHRoaXMsIGdhbWUsIHgsIHksIFwiZ2FtZS1zcHJpdGVzXCIsIFwiZGlsbC5wbmdcIik7XG5cbiAgICAvLyBTaXplXG4gICAgdGhpcy5hbmNob3Iuc2V0VG8oMC41LCAwLjUpO1xuICAgIHRoaXMuc2NhbGUuc2V0VG8oKHRoaXMuZ2FtZS53aWR0aCAvIDkpIC8gdGhpcy53aWR0aCk7XG5cbiAgICAvLyBQaHlzaWNzXG4gICAgdGhpcy5nYW1lLnBoeXNpY3MuYXJjYWRlLmVuYWJsZUJvZHkodGhpcyk7XG4gICAgdGhpcy5ib2R5LmFsbG93R3Jhdml0eSA9IGZhbHNlO1xuICAgIHRoaXMuYm9keS5pbW1vdmFibGUgPSB0cnVlO1xuICB9O1xuXG4gIC8vIEV4dGVuZCBmcm9tIFNwcml0ZVxuICBEaWxsLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUGhhc2VyLlNwcml0ZS5wcm90b3R5cGUpO1xuICBEaWxsLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IERpbGw7XG5cbiAgLy8gQWRkIG1ldGhvZHNcbiAgXy5leHRlbmQoRGlsbC5wcm90b3R5cGUsIHtcbiAgICB1cGRhdGU6IGZ1bmN0aW9uKCkge1xuXG4gICAgfVxuICB9KTtcblxuICAvLyBFeHBvcnRcbiAgbW9kdWxlLmV4cG9ydHMgPSBEaWxsO1xufSkoKTtcbiIsIi8qIGdsb2JhbCBfOmZhbHNlLCBQaGFzZXI6ZmFsc2UgKi9cblxuLyoqXG4gKiBQcmVmYWIgSGVyby9jaGFyYWN0ZXJcbiAqL1xuXG4oZnVuY3Rpb24oKSB7XG4gIFwidXNlIHN0cmljdFwiO1xuXG4gIC8vIENvbnN0cnVjdG9yXG4gIHZhciBIZXJvID0gZnVuY3Rpb24oZ2FtZSwgeCwgeSkge1xuICAgIC8vIENhbGwgZGVmYXVsdCBzcHJpdGVcbiAgICBQaGFzZXIuU3ByaXRlLmNhbGwodGhpcywgZ2FtZSwgeCwgeSwgXCJwaWNrbGUtc3ByaXRlc1wiLCBcInBpY2tsZS1qdW1wLTAyLnBuZ1wiKTtcblxuICAgIC8vIENvbmZpZ3VyZVxuICAgIHRoaXMuYW5jaG9yLnNldFRvKDAuNSk7XG4gICAgdGhpcy5vcmlnaW5hbFNjYWxlID0gKHRoaXMuZ2FtZS53aWR0aCAvIDIyKSAvIHRoaXMud2lkdGg7XG4gICAgdGhpcy5zY2FsZS5zZXRUbyh0aGlzLm9yaWdpbmFsU2NhbGUpO1xuICAgIHRoaXMuZ2FtZS5waHlzaWNzLmFyY2FkZS5lbmFibGVCb2R5KHRoaXMpO1xuICAgIHRoaXMuaXNEZWFkID0gZmFsc2U7XG5cbiAgICAvLyBUcmFjayB3aGVyZSB0aGUgaGVybyBzdGFydGVkIGFuZCBob3cgbXVjaCB0aGUgZGlzdGFuY2VcbiAgICAvLyBoYXMgY2hhbmdlZCBmcm9tIHRoYXQgcG9pbnRcbiAgICB0aGlzLnlPcmlnID0gdGhpcy55O1xuICAgIHRoaXMueUNoYW5nZSA9IDA7XG5cbiAgICAvLyBBbmltYXRpb25zXG4gICAgdmFyIHVwRnJhbWVzID0gUGhhc2VyLkFuaW1hdGlvbi5nZW5lcmF0ZUZyYW1lTmFtZXMoXCJwaWNrbGUtanVtcC1cIiwgMSwgNCwgXCIucG5nXCIsIDIpO1xuICAgIHZhciBkb3duRnJhbWVzID0gUGhhc2VyLkFuaW1hdGlvbi5nZW5lcmF0ZUZyYW1lTmFtZXMoXCJwaWNrbGUtanVtcC1cIiwgNCwgMSwgXCIucG5nXCIsIDIpO1xuICAgIHRoaXMuanVtcFVwID0gdGhpcy5hbmltYXRpb25zLmFkZChcImp1bXAtdXBcIiwgdXBGcmFtZXMpO1xuICAgIHRoaXMuSnVtcERvd24gPSB0aGlzLmFuaW1hdGlvbnMuYWRkKFwianVtcC1kb3duXCIsIGRvd25GcmFtZXMpO1xuICAgIHRoaXMuanVtcCA9IHRoaXMuYW5pbWF0aW9ucy5hZGQoXCJqdW1wXCIsIHVwRnJhbWVzLmNvbmNhdChkb3duRnJhbWVzKSk7XG4gIH07XG5cbiAgLy8gRXh0ZW5kIGZyb20gU3ByaXRlXG4gIEhlcm8ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQaGFzZXIuU3ByaXRlLnByb3RvdHlwZSk7XG4gIEhlcm8ucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gSGVybztcblxuICAvLyBBZGQgbWV0aG9kc1xuICBfLmV4dGVuZChIZXJvLnByb3RvdHlwZSwge1xuICAgIHVwZGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAvLyBUcmFjayB0aGUgbWF4aW11bSBhbW91bnQgdGhhdCB0aGUgaGVybyBoYXMgdHJhdmVsbGVkXG4gICAgICB0aGlzLnlDaGFuZ2UgPSBNYXRoLm1heCh0aGlzLnlDaGFuZ2UsIE1hdGguYWJzKHRoaXMueSAtIHRoaXMueU9yaWcpKTtcblxuICAgICAgLy8gV3JhcCBhcm91bmQgZWRnZXMgbGVmdC90aWdodCBlZGdlc1xuICAgICAgdGhpcy5nYW1lLndvcmxkLndyYXAodGhpcywgdGhpcy53aWR0aCAvIDIsIGZhbHNlLCB0cnVlLCBmYWxzZSk7XG5cbiAgICAgIC8vIFdoZW4gaGVhZGluZyBkb3duLCBhbmltYXRlIHRvIGRvd25cbiAgICAgIGlmICh0aGlzLmJvZHkudmVsb2NpdHkueSA+IDAgJiYgdGhpcy5nb2luZ1VwKSB7XG4gICAgICAgIHRoaXMub25GaXJlID0gZmFsc2U7XG4gICAgICAgIHRoaXMuZ29pbmdVcCA9IGZhbHNlO1xuICAgICAgICB0aGlzLmRvSnVtcERvd24oKTtcbiAgICAgIH1cblxuICAgICAgLy8gRWxzZSB3aGVuIGhlYWRpbmcgdXAsIG5vdGVcbiAgICAgIGVsc2UgaWYgKHRoaXMuYm9keS52ZWxvY2l0eS55IDwgMCAmJiAhdGhpcy5nb2luZ1VwKSB7XG4gICAgICAgIHRoaXMuZ29pbmdVcCA9IHRydWU7XG4gICAgICAgIHRoaXMuZG9KdW1wVXAoKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLy8gUmVzZXQgcGxhY2VtZW50IGN1c3RvbVxuICAgIHJlc2V0UGxhY2VtZW50OiBmdW5jdGlvbih4LCB5KSB7XG4gICAgICB0aGlzLnJlc2V0KHgsIHkpO1xuICAgICAgdGhpcy55T3JpZyA9IHRoaXMueTtcbiAgICAgIHRoaXMueUNoYW5nZSA9IDA7XG4gICAgfSxcblxuICAgIC8vIEp1bXAgdXBcbiAgICBkb0p1bXBVcDogZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoIXRoaXMub25GaXJlICYmICF0aGlzLmlzRGVhZCkge1xuICAgICAgICB0aGlzLmFuaW1hdGlvbnMucGxheShcImp1bXAtdXBcIiwgMTUsIGZhbHNlKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLy8gSnVtcCBkb3duXG4gICAgZG9KdW1wRG93bjogZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoIXRoaXMub25GaXJlICYmICF0aGlzLmlzRGVhZCkge1xuICAgICAgICB0aGlzLmFuaW1hdGlvbnMucGxheShcImp1bXAtZG93blwiLCAxNSwgZmFsc2UpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICAvLyBPbiBmaXJlXG4gICAgc2V0T25GaXJlOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMub25GaXJlID0gdHJ1ZTtcbiAgICAgIHRoaXMubG9hZFRleHR1cmUoXCJwaWNrbGUtc3ByaXRlc1wiLCBcInBpY2tsZS1yb2NrZXQucG5nXCIpO1xuICAgICAgdGhpcy5zY2FsZS5zZXRUbyh0aGlzLm9yaWdpbmFsU2NhbGUgKiAxLjUpO1xuICAgIH0sXG5cbiAgICAvLyBPZmYgZmlyZVxuICAgIHB1dE91dEZpcmU6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zY2FsZS5zZXRUbyh0aGlzLm9yaWdpbmFsU2NhbGUpO1xuICAgICAgdGhpcy5vbkZpcmUgPSBmYWxzZTtcbiAgICB9LFxuXG4gICAgLy8gTXVyZGVyIHdpdGggYm90Y2h5XG4gICAgYm90Y2h5TXVkZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5pc0RlYWQgPSB0cnVlO1xuICAgICAgdGhpcy5sb2FkVGV4dHVyZShcInBpY2tsZS1zcHJpdGVzXCIsIFwicGlja2xlLWJvdGNoeS5wbmdcIik7XG5cbiAgICAgIHZhciB0d2VlbiA9IHRoaXMuZ2FtZS5hZGQudHdlZW4odGhpcykudG8oe1xuICAgICAgICBhbmdsZTogMTc1XG4gICAgICB9LCA1MDAsIFBoYXNlci5FYXNpbmcuTGluZWFyLk5vbmUsIHRydWUpO1xuXG4gICAgICB0d2Vlbi5vbkNvbXBsZXRlLmFkZChfLmJpbmQoZnVuY3Rpb24oKSB7XG4gICAgICAgIC8vIERvIHNvbWV0aGluZ1xuICAgICAgfSwgdGhpcykpO1xuICAgIH1cbiAgfSk7XG5cbiAgLy8gRXhwb3J0XG4gIG1vZHVsZS5leHBvcnRzID0gSGVybztcbn0pKCk7XG4iLCIvKiBnbG9iYWwgXzpmYWxzZSwgUGhhc2VyOmZhbHNlICovXG5cbi8qKlxuICogUHJlZmFiIGphciBwbGF0Zm9ybVxuICovXG5cbihmdW5jdGlvbigpIHtcbiAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgLy8gQ29uc3RydWN0b3JcbiAgdmFyIEphciA9IGZ1bmN0aW9uKGdhbWUsIHgsIHkpIHtcbiAgICAvLyBDYWxsIGRlZmF1bHQgc3ByaXRlXG4gICAgUGhhc2VyLlNwcml0ZS5jYWxsKHRoaXMsIGdhbWUsIHgsIHksIFwiZ2FtZS1zcHJpdGVzXCIsIFwiamFyLnBuZ1wiKTtcblxuICAgIC8vIENvbmZpZ3VyZVxuICAgIHRoaXMuYW5jaG9yLnNldFRvKDAuNSwgMC41KTtcbiAgICB0aGlzLnNjYWxlLnNldFRvKCh0aGlzLmdhbWUud2lkdGggLyAyKSAvIHRoaXMud2lkdGgpO1xuXG4gICAgLy8gUGh5c2ljc1xuICAgIHRoaXMuZ2FtZS5waHlzaWNzLmFyY2FkZS5lbmFibGVCb2R5KHRoaXMpO1xuICAgIHRoaXMuYm9keS5hbGxvd0dyYXZpdHkgPSBmYWxzZTtcbiAgICB0aGlzLmJvZHkuaW1tb3ZhYmxlID0gdHJ1ZTtcbiAgfTtcblxuICAvLyBFeHRlbmQgZnJvbSBTcHJpdGVcbiAgSmFyLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUGhhc2VyLlNwcml0ZS5wcm90b3R5cGUpO1xuICBKYXIucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gSmFyO1xuXG4gIC8vIEFkZCBtZXRob2RzXG4gIF8uZXh0ZW5kKEphci5wcm90b3R5cGUsIHtcbiAgICB1cGRhdGU6IGZ1bmN0aW9uKCkge1xuICAgIH1cbiAgfSk7XG5cbiAgLy8gRXhwb3J0XG4gIG1vZHVsZS5leHBvcnRzID0gSmFyO1xufSkoKTtcbiIsIi8qIGdsb2JhbCBfOmZhbHNlLCBQaGFzZXI6ZmFsc2UgKi9cblxuLyoqXG4gKiBQcmVmYWIgbWluaSBwaWNrbGUgKGtpbmQgb2YgbGlrZSBhIGNvaW4sIGp1c3QgcG9pbnRzKVxuICovXG5cbihmdW5jdGlvbigpIHtcbiAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgLy8gQ29uc3RydWN0b3JcbiAgdmFyIE1pbmkgPSBmdW5jdGlvbihnYW1lLCB4LCB5KSB7XG4gICAgLy8gQ2FsbCBkZWZhdWx0IHNwcml0ZVxuICAgIFBoYXNlci5TcHJpdGUuY2FsbCh0aGlzLCBnYW1lLCB4LCB5LCBcImdhbWUtc3ByaXRlc1wiLCBcIm1hZ2ljZGlsbC5wbmdcIik7XG5cbiAgICAvLyBDb25maWd1cmVcbiAgICB0aGlzLmFuY2hvci5zZXRUbygwLjUsIDAuNSk7XG4gICAgdGhpcy5zY2FsZS5zZXRUbygodGhpcy5nYW1lLndpZHRoIC8gMjApIC8gdGhpcy53aWR0aCk7XG5cbiAgICAvLyBQaHlzaWNzXG4gICAgdGhpcy5nYW1lLnBoeXNpY3MuYXJjYWRlLmVuYWJsZUJvZHkodGhpcyk7XG4gICAgdGhpcy5ib2R5LmFsbG93R3Jhdml0eSA9IGZhbHNlO1xuICAgIHRoaXMuYm9keS5pbW1vdmFibGUgPSB0cnVlO1xuICB9O1xuXG4gIC8vIEV4dGVuZCBmcm9tIFNwcml0ZVxuICBNaW5pLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUGhhc2VyLlNwcml0ZS5wcm90b3R5cGUpO1xuICBNaW5pLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IE1pbmk7XG5cbiAgLy8gQWRkIG1ldGhvZHNcbiAgXy5leHRlbmQoTWluaS5wcm90b3R5cGUsIHtcbiAgICB1cGRhdGU6IGZ1bmN0aW9uKCkge1xuXG4gICAgfVxuICB9KTtcblxuICAvLyBFeHBvcnRcbiAgbW9kdWxlLmV4cG9ydHMgPSBNaW5pO1xufSkoKTtcbiIsIi8qIGdsb2JhbCBfOmZhbHNlLCBQaGFzZXI6ZmFsc2UgKi9cblxuLyoqXG4gKiBQcmVmYWIgKG9iamVjdHMpIGJvb3N0IGZvciBwZXBwZXJcbiAqL1xuXG4oZnVuY3Rpb24oKSB7XG4gIFwidXNlIHN0cmljdFwiO1xuXG4gIC8vIENvbnN0cnVjdG9yIGZvciBCb29zdFxuICB2YXIgUGVwcGVyID0gZnVuY3Rpb24oZ2FtZSwgeCwgeSkge1xuICAgIC8vIENhbGwgZGVmYXVsdCBzcHJpdGVcbiAgICBQaGFzZXIuU3ByaXRlLmNhbGwodGhpcywgZ2FtZSwgeCwgeSwgXCJnYW1lLXNwcml0ZXNcIiwgXCJnaG9zdC1wZXBwZXIucG5nXCIpO1xuXG4gICAgLy8gU2l6ZVxuICAgIHRoaXMuYW5jaG9yLnNldFRvKDAuNSwgMC41KTtcbiAgICB0aGlzLnNjYWxlLnNldFRvKCh0aGlzLmdhbWUud2lkdGggLyAxOCkgLyB0aGlzLndpZHRoKTtcblxuICAgIC8vIFBoeXNpY3NcbiAgICB0aGlzLmdhbWUucGh5c2ljcy5hcmNhZGUuZW5hYmxlQm9keSh0aGlzKTtcbiAgICB0aGlzLmJvZHkuYWxsb3dHcmF2aXR5ID0gZmFsc2U7XG4gICAgdGhpcy5ib2R5LmltbW92YWJsZSA9IHRydWU7XG4gIH07XG5cbiAgLy8gRXh0ZW5kIGZyb20gU3ByaXRlXG4gIFBlcHBlci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFBoYXNlci5TcHJpdGUucHJvdG90eXBlKTtcbiAgUGVwcGVyLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFBlcHBlcjtcblxuICAvLyBBZGQgbWV0aG9kc1xuICBfLmV4dGVuZChQZXBwZXIucHJvdG90eXBlLCB7XG4gICAgdXBkYXRlOiBmdW5jdGlvbigpIHtcblxuICAgIH1cbiAgfSk7XG5cbiAgLy8gRXhwb3J0XG4gIG1vZHVsZS5leHBvcnRzID0gUGVwcGVyO1xufSkoKTtcbiIsIi8qIGdsb2JhbCBfOmZhbHNlLCBQaGFzZXI6ZmFsc2UgKi9cblxuLyoqXG4gKiBHYW1lb3ZlciBzdGF0ZVxuICovXG5cbihmdW5jdGlvbigpIHtcbiAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgLy8gQ29uc3RydWN0b3JcbiAgdmFyIEdhbWVvdmVyID0gZnVuY3Rpb24oKSB7XG4gICAgUGhhc2VyLlN0YXRlLmNhbGwodGhpcyk7XG4gIH07XG5cbiAgLy8gRXh0ZW5kIGZyb20gU3RhdGVcbiAgR2FtZW92ZXIucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQaGFzZXIuU3RhdGUucHJvdG90eXBlKTtcbiAgR2FtZW92ZXIucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gR2FtZW92ZXI7XG5cbiAgLy8gQWRkIG1ldGhvZHNcbiAgXy5leHRlbmQoR2FtZW92ZXIucHJvdG90eXBlLCBQaGFzZXIuU3RhdGUucHJvdG90eXBlLCB7XG4gICAgLy8gUHJlbG9hZFxuICAgIHByZWxvYWQ6IGZ1bmN0aW9uKCkge1xuICAgICAgLy8gTG9hZCB1cCBnYW1lIGltYWdlc1xuICAgICAgdGhpcy5nYW1lLmxvYWQuYXRsYXMoXCJnYW1lb3Zlci1zcHJpdGVzXCIsIFwiYXNzZXRzL2dhbWVvdmVyLXNwcml0ZXMucG5nXCIsIFwiYXNzZXRzL2dhbWVvdmVyLXNwcml0ZXMuanNvblwiKTtcbiAgICB9LFxuXG4gICAgLy8gQ3JlYXRlXG4gICAgY3JlYXRlOiBmdW5jdGlvbigpIHtcbiAgICAgIC8vIFNldCBiYWNrZ3JvdW5kXG4gICAgICB0aGlzLmdhbWUuc3RhZ2UuYmFja2dyb3VuZENvbG9yID0gXCIjOGNjNjNmXCI7XG5cbiAgICAgIC8vIE1ha2UgcGFkZGluZyBkZXBlbmRlbnQgb24gd2lkdGhcbiAgICAgIHRoaXMucGFkZGluZyA9IHRoaXMuZ2FtZS53aWR0aCAvIDUwO1xuXG4gICAgICAvLyBQbGFjZSB0aXRsZVxuICAgICAgdGhpcy50aXRsZUltYWdlID0gdGhpcy5nYW1lLmFkZC5zcHJpdGUoMCwgMCwgXCJnYW1lb3Zlci1zcHJpdGVzXCIsIFwiZ2FtZW92ZXIucG5nXCIpO1xuICAgICAgdGhpcy50aXRsZUltYWdlLmFuY2hvci5zZXRUbygwLjUsIDApO1xuICAgICAgdGhpcy50aXRsZUltYWdlLnNjYWxlLnNldFRvKCh0aGlzLmdhbWUud2lkdGggLSAodGhpcy5wYWRkaW5nICogMTYpKSAvIHRoaXMudGl0bGVJbWFnZS53aWR0aCk7XG4gICAgICB0aGlzLnRpdGxlSW1hZ2UucmVzZXQodGhpcy5jZW50ZXJTdGFnZVgodGhpcy50aXRsZUltYWdlKSwgdGhpcy5wYWRkaW5nICogMik7XG4gICAgICB0aGlzLmdhbWUuYWRkLmV4aXN0aW5nKHRoaXMudGl0bGVJbWFnZSk7XG5cbiAgICAgIC8vIEhpZ2hzY29yZSBsaXN0LiAgQ2FuJ3Qgc2VlbSB0byBmaW5kIGEgd2F5IHRvIHBhc3MgdGhlIHNjb3JlXG4gICAgICAvLyB2aWEgYSBzdGF0ZSBjaGFuZ2UuXG4gICAgICB0aGlzLnNjb3JlID0gdGhpcy5nYW1lLnBpY2tsZS5zY29yZTtcblxuICAgICAgLy8gU2hvdyBzY29yZVxuICAgICAgdGhpcy5zaG93U2NvcmUoKTtcblxuICAgICAgLy8gU2hvdyBpbnB1dCBpZiBuZXcgaGlnaHNjb3JlLCBvdGhlcndpc2Ugc2hvdyBsaXN0XG4gICAgICBpZiAodGhpcy5nYW1lLnBpY2tsZS5pc0hpZ2hzY29yZSh0aGlzLnNjb3JlKSkge1xuICAgICAgICB0aGlzLmhpZ2hzY29yZUlucHV0KCk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgdGhpcy5oaWdoc2NvcmVMaXN0KCk7XG4gICAgICB9XG5cbiAgICAgIC8vIFBsYWNlIHJlLXBsYXlcbiAgICAgIHRoaXMucmVwbGF5SW1hZ2UgPSB0aGlzLmdhbWUuYWRkLnNwcml0ZSh0aGlzLmdhbWUud2lkdGggLSB0aGlzLnBhZGRpbmcgKiAyLFxuICAgICAgICB0aGlzLmdhbWUuaGVpZ2h0IC0gdGhpcy5wYWRkaW5nICogMiwgXCJnYW1lb3Zlci1zcHJpdGVzXCIsIFwidGl0bGUtcGxheS5wbmdcIik7XG4gICAgICB0aGlzLnJlcGxheUltYWdlLmFuY2hvci5zZXRUbygxLCAxKTtcbiAgICAgIHRoaXMucmVwbGF5SW1hZ2Uuc2NhbGUuc2V0VG8oKHRoaXMuZ2FtZS53aWR0aCAqIDAuMjUpIC8gdGhpcy5yZXBsYXlJbWFnZS53aWR0aCk7XG4gICAgICB0aGlzLmdhbWUuYWRkLmV4aXN0aW5nKHRoaXMucmVwbGF5SW1hZ2UpO1xuXG4gICAgICAvLyBBZGQgaG92ZXIgZm9yIG1vdXNlXG4gICAgICB0aGlzLnJlcGxheUltYWdlLmlucHV0RW5hYmxlZCA9IHRydWU7XG4gICAgICB0aGlzLnJlcGxheUltYWdlLmV2ZW50cy5vbklucHV0T3Zlci5hZGQoZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMucmVwbGF5SW1hZ2Uub3JpZ2luYWxUaW50ID0gdGhpcy5yZXBsYXlJbWFnZS50aW50O1xuICAgICAgICB0aGlzLnJlcGxheUltYWdlLnRpbnQgPSAwLjUgKiAweEZGRkZGRjtcbiAgICAgIH0sIHRoaXMpO1xuXG4gICAgICB0aGlzLnJlcGxheUltYWdlLmV2ZW50cy5vbklucHV0T3V0LmFkZChmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5yZXBsYXlJbWFnZS50aW50ID0gdGhpcy5yZXBsYXlJbWFnZS5vcmlnaW5hbFRpbnQ7XG4gICAgICB9LCB0aGlzKTtcblxuICAgICAgLy8gQWRkIGludGVyYWN0aW9ucyBmb3Igc3RhcnRpbmdcbiAgICAgIHRoaXMucmVwbGF5SW1hZ2UuZXZlbnRzLm9uSW5wdXREb3duLmFkZCh0aGlzLnJlcGxheSwgdGhpcyk7XG5cbiAgICAgIC8vIElucHV0XG4gICAgICB0aGlzLmxlZnRCdXR0b24gPSB0aGlzLmdhbWUuaW5wdXQua2V5Ym9hcmQuYWRkS2V5KFBoYXNlci5LZXlib2FyZC5MRUZUKTtcbiAgICAgIHRoaXMucmlnaHRCdXR0b24gPSB0aGlzLmdhbWUuaW5wdXQua2V5Ym9hcmQuYWRkS2V5KFBoYXNlci5LZXlib2FyZC5SSUdIVCk7XG4gICAgICB0aGlzLnVwQnV0dG9uID0gdGhpcy5nYW1lLmlucHV0LmtleWJvYXJkLmFkZEtleShQaGFzZXIuS2V5Ym9hcmQuVVApO1xuICAgICAgdGhpcy5kb3duQnV0dG9uID0gdGhpcy5nYW1lLmlucHV0LmtleWJvYXJkLmFkZEtleShQaGFzZXIuS2V5Ym9hcmQuRE9XTik7XG4gICAgICB0aGlzLmFjdGlvbkJ1dHRvbiA9IHRoaXMuZ2FtZS5pbnB1dC5rZXlib2FyZC5hZGRLZXkoUGhhc2VyLktleWJvYXJkLlNQQUNFQkFSKTtcblxuICAgICAgdGhpcy5sZWZ0QnV0dG9uLm9uRG93bi5hZGQoZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICh0aGlzLmhJbnB1dCkge1xuICAgICAgICAgIHRoaXMubW92ZUN1cnNvcigtMSk7XG4gICAgICAgIH1cbiAgICAgIH0sIHRoaXMpO1xuXG4gICAgICB0aGlzLnJpZ2h0QnV0dG9uLm9uRG93bi5hZGQoZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICh0aGlzLmhJbnB1dCkge1xuICAgICAgICAgIHRoaXMubW92ZUN1cnNvcigxKTtcbiAgICAgICAgfVxuICAgICAgfSwgdGhpcyk7XG5cbiAgICAgIHRoaXMudXBCdXR0b24ub25Eb3duLmFkZChmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHRoaXMuaElucHV0KSB7XG4gICAgICAgICAgdGhpcy5tb3ZlTGV0dGVyKDEpO1xuICAgICAgICB9XG4gICAgICB9LCB0aGlzKTtcblxuICAgICAgdGhpcy5kb3duQnV0dG9uLm9uRG93bi5hZGQoZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICh0aGlzLmhJbnB1dCkge1xuICAgICAgICAgIHRoaXMubW92ZUxldHRlcigtMSk7XG4gICAgICAgIH1cbiAgICAgIH0sIHRoaXMpO1xuXG4gICAgICB0aGlzLmFjdGlvbkJ1dHRvbi5vbkRvd24uYWRkKGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgc2F2ZWQ7XG5cbiAgICAgICAgaWYgKHRoaXMuaElucHV0KSB7XG4gICAgICAgICAgc2F2ZWQgPSB0aGlzLnNhdmVIaWdoc2NvcmUoKTtcbiAgICAgICAgICBpZiAoc2F2ZWQpIHtcbiAgICAgICAgICAgIHRoaXMuaGlnaHNjb3JlTGlzdCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICB0aGlzLnJlcGxheSgpO1xuICAgICAgICB9XG4gICAgICB9LCB0aGlzKTtcbiAgICB9LFxuXG4gICAgLy8gVXBkYXRlXG4gICAgdXBkYXRlOiBmdW5jdGlvbigpIHtcbiAgICB9LFxuXG4gICAgLy8gU2h1dGRvd24sIGNsZWFuIHVwIG9uIHN0YXRlIGNoYW5nZVxuICAgIHNodXRkb3duOiBmdW5jdGlvbigpIHtcbiAgICAgIFtcInRpdGxlVGV4dFwiLCBcInJlcGxheVRleHRcIl0uZm9yRWFjaChfLmJpbmQoZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICBpZiAodGhpc1tpdGVtXSAmJiB0aGlzW2l0ZW1dLmRlc3Ryb3kpIHtcbiAgICAgICAgICB0aGlzW2l0ZW1dLmRlc3Ryb3koKTtcbiAgICAgICAgICB0aGlzW2l0ZW1dID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgfSwgdGhpcykpO1xuICAgIH0sXG5cbiAgICAvLyBIYW5kbGUgcmVwbGF5XG4gICAgcmVwbGF5OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuZ2FtZS5zdGF0ZS5zdGFydChcIm1lbnVcIik7XG4gICAgfSxcblxuICAgIC8vIFNob3cgaGlnaHNjb3JlXG4gICAgc2hvd1Njb3JlOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2NvcmVHcm91cCA9IHRoaXMuZ2FtZS5hZGQuZ3JvdXAoKTtcblxuICAgICAgLy8gUGxhY2UgbGFiZWxcbiAgICAgIHRoaXMueW91clNjb3JlSW1hZ2UgPSB0aGlzLmdhbWUuYWRkLnNwcml0ZShcbiAgICAgICAgdGhpcy5nYW1lLndpZHRoIC8gMiArICh0aGlzLnBhZGRpbmcgKiAzKSxcbiAgICAgICAgdGhpcy50aXRsZUltYWdlLmhlaWdodCArICh0aGlzLnBhZGRpbmcgKiA3LjUpLCBcImdhbWVvdmVyLXNwcml0ZXNcIiwgXCJ5b3VyLXNjb3JlLnBuZ1wiKTtcbiAgICAgIHRoaXMueW91clNjb3JlSW1hZ2UuYW5jaG9yLnNldFRvKDEsIDApO1xuICAgICAgdGhpcy55b3VyU2NvcmVJbWFnZS5zY2FsZS5zZXRUbygoKHRoaXMuZ2FtZS53aWR0aCAvIDIpIC0gKHRoaXMucGFkZGluZyAqIDYpKSAvIHRoaXMueW91clNjb3JlSW1hZ2Uud2lkdGgpO1xuXG4gICAgICAvLyBTY29yZVxuICAgICAgdGhpcy5zY29yZVRleHQgPSBuZXcgUGhhc2VyLlRleHQoXG4gICAgICAgIHRoaXMuZ2FtZSxcbiAgICAgICAgdGhpcy5nYW1lLndpZHRoIC8gMiArICh0aGlzLnBhZGRpbmcgKiA1KSxcbiAgICAgICAgdGhpcy50aXRsZUltYWdlLmhlaWdodCArICh0aGlzLnBhZGRpbmcgKiA2KSxcbiAgICAgICAgdGhpcy5zY29yZS50b0xvY2FsZVN0cmluZygpLCB7XG4gICAgICAgICAgZm9udDogXCJib2xkIFwiICsgKHRoaXMuZ2FtZS53b3JsZC5oZWlnaHQgLyAxNSkgKyBcInB4IERvc2lzXCIsXG4gICAgICAgICAgZmlsbDogXCIjMzliNTRhXCIsXG4gICAgICAgICAgYWxpZ246IFwibGVmdFwiLFxuICAgICAgICB9KTtcbiAgICAgIHRoaXMuc2NvcmVUZXh0LmFuY2hvci5zZXRUbygwLCAwKTtcblxuICAgICAgLy8gRm9udCBsb2FkaW5nIHRoaW5nXG4gICAgICBfLmRlbGF5KF8uYmluZChmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5zY29yZUdyb3VwLmFkZCh0aGlzLnlvdXJTY29yZUltYWdlKTtcbiAgICAgICAgdGhpcy5zY29yZUdyb3VwLmFkZCh0aGlzLnNjb3JlVGV4dCk7XG4gICAgICB9LCB0aGlzKSwgMTAwMCk7XG4gICAgfSxcblxuICAgIC8vIE1ha2UgaGlnaGVzdCBzY29yZSBpbnB1dFxuICAgIGhpZ2hzY29yZUlucHV0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuaElucHV0ID0gdHJ1ZTtcbiAgICAgIHRoaXMuaElucHV0SW5kZXggPSAwO1xuICAgICAgdGhpcy5oSW5wdXRzID0gdGhpcy5nYW1lLmFkZC5ncm91cCgpO1xuICAgICAgdmFyIHkgPSB0aGlzLmdhbWUud29ybGQuaGVpZ2h0ICogMC43O1xuXG4gICAgICAvLyBGaXJzdCBpbnB1dFxuICAgICAgdmFyIG9uZSA9IG5ldyBQaGFzZXIuVGV4dChcbiAgICAgICAgdGhpcy5nYW1lLFxuICAgICAgICB0aGlzLmdhbWUud29ybGQud2lkdGggKiAwLjMzMzMzLFxuICAgICAgICB5LFxuICAgICAgICBcIkFcIiwge1xuICAgICAgICAgIGZvbnQ6IFwiYm9sZCBcIiArICh0aGlzLmdhbWUud29ybGQuaGVpZ2h0IC8gMTUpICsgXCJweCBEb3Npc1wiLFxuICAgICAgICAgIGZpbGw6IFwiI0ZGRkZGRlwiLFxuICAgICAgICAgIGFsaWduOiBcImNlbnRlclwiLFxuICAgICAgICB9KTtcbiAgICAgIG9uZS5hbmNob3Iuc2V0KDAuNSk7XG4gICAgICB0aGlzLmhJbnB1dHMuYWRkKG9uZSk7XG5cbiAgICAgIC8vIFNlY29uZCBpbnB1dFxuICAgICAgdmFyIHNlY29uZCA9IG5ldyBQaGFzZXIuVGV4dChcbiAgICAgICAgdGhpcy5nYW1lLFxuICAgICAgICB0aGlzLmdhbWUud29ybGQud2lkdGggKiAwLjUsXG4gICAgICAgIHksXG4gICAgICAgIFwiQVwiLCB7XG4gICAgICAgICAgZm9udDogXCJib2xkIFwiICsgKHRoaXMuZ2FtZS53b3JsZC5oZWlnaHQgLyAxNSkgKyBcInB4IERvc2lzXCIsXG4gICAgICAgICAgZmlsbDogXCIjRkZGRkZGXCIsXG4gICAgICAgICAgYWxpZ246IFwiY2VudGVyXCIsXG4gICAgICAgIH0pO1xuICAgICAgc2Vjb25kLmFuY2hvci5zZXQoMC41KTtcbiAgICAgIHRoaXMuaElucHV0cy5hZGQoc2Vjb25kKTtcblxuICAgICAgLy8gU2Vjb25kIGlucHV0XG4gICAgICB2YXIgdGhpcmQgPSBuZXcgUGhhc2VyLlRleHQoXG4gICAgICAgIHRoaXMuZ2FtZSxcbiAgICAgICAgdGhpcy5nYW1lLndvcmxkLndpZHRoICogMC42NjY2NixcbiAgICAgICAgeSxcbiAgICAgICAgXCJBXCIsIHtcbiAgICAgICAgICBmb250OiBcImJvbGQgXCIgKyAodGhpcy5nYW1lLndvcmxkLmhlaWdodCAvIDE1KSArIFwicHggRG9zaXNcIixcbiAgICAgICAgICBmaWxsOiBcIiNGRkZGRkZcIixcbiAgICAgICAgICBhbGlnbjogXCJjZW50ZXJcIixcbiAgICAgICAgfSk7XG4gICAgICB0aGlyZC5hbmNob3Iuc2V0KDAuNSk7XG4gICAgICB0aGlzLmhJbnB1dHMuYWRkKHRoaXJkKTtcblxuICAgICAgLy8gQ3Vyc29yXG4gICAgICB0aGlzLmhDdXJzb3IgPSB0aGlzLmdhbWUuYWRkLnRleHQoXG4gICAgICAgIG9uZS54LFxuICAgICAgICBvbmUueSAtICh0aGlzLmdhbWUud29ybGQuaGVpZ2h0IC8gMjApLFxuICAgICAgICBcIl9cIiwge1xuICAgICAgICAgIGZvbnQ6IFwiYm9sZCBcIiArICh0aGlzLmdhbWUud29ybGQuaGVpZ2h0IC8gNSkgKyBcInB4IEFyaWFsXCIsXG4gICAgICAgICAgZmlsbDogXCIjRkZGRkZGXCIsXG4gICAgICAgICAgYWxpZ246IFwiY2VudGVyXCIsXG4gICAgICAgIH0pO1xuICAgICAgdGhpcy5oQ3Vyc29yLmFuY2hvci5zZXQoMC41KTtcblxuICAgICAgLy8gSGFuZGxlIGluaXRhbCBjdXJzb3JcbiAgICAgIHRoaXMubW92ZUN1cnNvcigwKTtcbiAgICB9LFxuXG4gICAgLy8gTW92ZSBjdXJzb3JcbiAgICBtb3ZlQ3Vyc29yOiBmdW5jdGlvbihhbW91bnQpIHtcbiAgICAgIHZhciBuZXdJbmRleCA9IHRoaXMuaElucHV0SW5kZXggKyBhbW91bnQ7XG4gICAgICB0aGlzLmhJbnB1dEluZGV4ID0gKG5ld0luZGV4IDwgMCkgPyB0aGlzLmhJbnB1dHMubGVuZ3RoIC0gMSA6XG4gICAgICAgIChuZXdJbmRleCA+PSB0aGlzLmhJbnB1dHMubGVuZ3RoKSA/IDAgOiBuZXdJbmRleDtcbiAgICAgIHZhciBpID0gdGhpcy5oSW5wdXRzLmdldENoaWxkQXQodGhpcy5oSW5wdXRJbmRleCk7XG5cbiAgICAgIC8vIE1vdmUgY3Vyc29yXG4gICAgICB0aGlzLmhDdXJzb3IueCA9IGkueDtcbiAgICAgIHRoaXMuaElucHV0cy5mb3JFYWNoKGZ1bmN0aW9uKGlucHV0KSB7XG4gICAgICAgIGlucHV0LmZpbGwgPSBcIiNGRkZGRkZcIjtcbiAgICAgIH0pO1xuXG4gICAgICBpLmZpbGwgPSBcIiNGRkREQkJcIjtcblxuICAgICAgLy8gVE9ETzogSGlnaGxpZ2h0IGlucHV0LlxuICAgIH0sXG5cbiAgICAvLyBNb3ZlIGxldHRlclxuICAgIG1vdmVMZXR0ZXI6IGZ1bmN0aW9uKGFtb3VudCkge1xuICAgICAgdmFyIGkgPSB0aGlzLmhJbnB1dHMuZ2V0Q2hpbGRBdCh0aGlzLmhJbnB1dEluZGV4KTtcbiAgICAgIHZhciB0ID0gaS50ZXh0O1xuICAgICAgdmFyIG4gPSAodCA9PT0gXCJBXCIgJiYgYW1vdW50ID09PSAtMSkgPyBcIlpcIiA6XG4gICAgICAgICh0ID09PSBcIlpcIiAmJiBhbW91bnQgPT09IDEpID8gXCJBXCIgOlxuICAgICAgICBTdHJpbmcuZnJvbUNoYXJDb2RlKHQuY2hhckNvZGVBdCgwKSArIGFtb3VudCk7XG5cbiAgICAgIGkudGV4dCA9IG47XG4gICAgfSxcblxuICAgIC8vIFNhdmUgaGlnaHNjb3JlXG4gICAgc2F2ZUhpZ2hzY29yZTogZnVuY3Rpb24oKSB7XG4gICAgICAvLyBHZXQgbmFtZVxuICAgICAgdmFyIG5hbWUgPSBcIlwiO1xuICAgICAgdGhpcy5oSW5wdXRzLmZvckVhY2goZnVuY3Rpb24oaW5wdXQpIHtcbiAgICAgICAgbmFtZSA9IG5hbWUgKyBpbnB1dC50ZXh0O1xuICAgICAgfSk7XG5cbiAgICAgIC8vIERvbid0IGFsbG93IEFBQVxuICAgICAgaWYgKG5hbWUgPT09IFwiQUFBXCIpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuXG4gICAgICAvLyBTYXZlIGhpZ2hzY29yZVxuICAgICAgdGhpcy5nYW1lLnBpY2tsZS5zZXRIaWdoc2NvcmUodGhpcy5zY29yZSwgbmFtZSk7XG5cbiAgICAgIC8vIFJlbW92ZSBpbnB1dFxuICAgICAgdGhpcy5oSW5wdXQgPSBmYWxzZTtcbiAgICAgIHRoaXMuaElucHV0cy5kZXN0cm95KCk7XG4gICAgICB0aGlzLmhDdXJzb3IuZGVzdHJveSgpO1xuXG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9LFxuXG4gICAgLy8gSGlnaHNjb3JlIGxpc3RcbiAgICBoaWdoc2NvcmVMaXN0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuaGlnaHNjb3JlTGltaXQgPSAzO1xuICAgICAgdGhpcy5oaWdoc2NvcmVMaXN0R3JvdXAgPSB0aGlzLmdhbWUuYWRkLmdyb3VwKCk7XG4gICAgICB0aGlzLmdhbWUucGlja2xlLnNvcnRIaWdoc2NvcmVzKCk7XG4gICAgICB2YXIgZm9udFNpemUgPSB0aGlzLmdhbWUud29ybGQuaGVpZ2h0IC8gMTcuNTtcblxuICAgICAgaWYgKHRoaXMuZ2FtZS5waWNrbGUuaGlnaHNjb3Jlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgIF8uZWFjaCh0aGlzLmdhbWUucGlja2xlLmhpZ2hzY29yZXMucmV2ZXJzZSgpLnNsaWNlKDAsIDMpLCBfLmJpbmQoZnVuY3Rpb24oaCwgaSkge1xuICAgICAgICAgIC8vIE5hbWVcbiAgICAgICAgICB2YXIgbmFtZSA9IG5ldyBQaGFzZXIuVGV4dChcbiAgICAgICAgICAgIHRoaXMuZ2FtZSxcbiAgICAgICAgICAgIHRoaXMuZ2FtZS53aWR0aCAvIDIgKyAodGhpcy5wYWRkaW5nICogMyksXG4gICAgICAgICAgICAodGhpcy5nYW1lLmhlaWdodCAqIDAuNikgKyAoKGZvbnRTaXplICsgdGhpcy5wYWRkaW5nKSAqIGkpLFxuICAgICAgICAgICAgaC5uYW1lLCB7XG4gICAgICAgICAgICAgIGZvbnQ6IFwiYm9sZCBcIiArICh0aGlzLmdhbWUud29ybGQuaGVpZ2h0IC8gMTUpICsgXCJweCBEb3Npc1wiLFxuICAgICAgICAgICAgICBmaWxsOiBcIiNiOGY0YmNcIixcbiAgICAgICAgICAgICAgYWxpZ246IFwicmlnaHRcIixcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIG5hbWUuYW5jaG9yLnNldFRvKDEsIDApO1xuXG4gICAgICAgICAgLy8gU2NvcmVcbiAgICAgICAgICB2YXIgc2NvcmUgPSBuZXcgUGhhc2VyLlRleHQoXG4gICAgICAgICAgICB0aGlzLmdhbWUsXG4gICAgICAgICAgICB0aGlzLmdhbWUud2lkdGggLyAyICsgKHRoaXMucGFkZGluZyAqIDUpLFxuICAgICAgICAgICAgKHRoaXMuZ2FtZS5oZWlnaHQgKiAwLjYpICsgKChmb250U2l6ZSArIHRoaXMucGFkZGluZykgKiBpKSxcbiAgICAgICAgICAgIGguc2NvcmUudG9Mb2NhbGVTdHJpbmcoKSwge1xuICAgICAgICAgICAgICBmb250OiBcImJvbGQgXCIgKyAodGhpcy5nYW1lLndvcmxkLmhlaWdodCAvIDE1KSArIFwicHggRG9zaXNcIixcbiAgICAgICAgICAgICAgZmlsbDogXCIjMzliNTRhXCIsXG4gICAgICAgICAgICAgIGFsaWduOiBcImxlZnRcIixcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIHNjb3JlLmFuY2hvci5zZXRUbygwLCAwKTtcblxuICAgICAgICAgIC8vIEZvbnQgbG9hZGluZyB0aGluZ1xuICAgICAgICAgIF8uZGVsYXkoXy5iaW5kKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5oaWdoc2NvcmVMaXN0R3JvdXAuYWRkKG5hbWUpO1xuICAgICAgICAgICAgdGhpcy5oaWdoc2NvcmVMaXN0R3JvdXAuYWRkKHNjb3JlKTtcbiAgICAgICAgICB9LCB0aGlzKSwgMTAwMCk7XG4gICAgICAgIH0sIHRoaXMpKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLy8gQ2VudGVyIHggb24gc3RhZ2VcbiAgICBjZW50ZXJTdGFnZVg6IGZ1bmN0aW9uKG9iaikge1xuICAgICAgcmV0dXJuICgodGhpcy5nYW1lLndpZHRoIC0gb2JqLndpZHRoKSAvIDIpICsgKG9iai53aWR0aCAvIDIpO1xuICAgIH0sXG5cbiAgICAvLyBDZW50ZXIgeCBvbiBzdGFnZVxuICAgIGNlbnRlclN0YWdlWTogZnVuY3Rpb24ob2JqKSB7XG4gICAgICByZXR1cm4gKCh0aGlzLmdhbWUuaGVpZ2h0IC0gb2JqLmhlaWdodCkgLyAyKSArIChvYmouaGVpZ2h0IC8gMik7XG4gICAgfVxuICB9KTtcblxuICAvLyBFeHBvcnRcbiAgbW9kdWxlLmV4cG9ydHMgPSBHYW1lb3Zlcjtcbn0pKCk7XG4iLCIvKiBnbG9iYWwgXzpmYWxzZSwgUGhhc2VyOmZhbHNlICovXG5cbi8qKlxuICogTWVudSBzdGF0ZVxuICovXG5cbihmdW5jdGlvbigpIHtcbiAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgLy8gQ29uc3RydWN0b3JcbiAgdmFyIE1lbnUgPSBmdW5jdGlvbigpIHtcbiAgICBQaGFzZXIuU3RhdGUuY2FsbCh0aGlzKTtcbiAgfTtcblxuICAvLyBFeHRlbmQgZnJvbSBTdGF0ZVxuICBNZW51LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUGhhc2VyLlN0YXRlLnByb3RvdHlwZSk7XG4gIE1lbnUucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gTWVudTtcblxuICAvLyBBZGQgbWV0aG9kc1xuICBfLmV4dGVuZChNZW51LnByb3RvdHlwZSwgUGhhc2VyLlN0YXRlLnByb3RvdHlwZSwge1xuICAgIC8vIFByZWxvYWRcbiAgICBwcmVsb2FkOiBmdW5jdGlvbigpIHtcbiAgICAgIC8vIExvYWQgdXAgZ2FtZSBpbWFnZXNcbiAgICAgIHRoaXMuZ2FtZS5sb2FkLmF0bGFzKFwidGl0bGUtc3ByaXRlc1wiLCBcImFzc2V0cy90aXRsZS1zcHJpdGVzLnBuZ1wiLCBcImFzc2V0cy90aXRsZS1zcHJpdGVzLmpzb25cIik7XG4gICAgfSxcblxuICAgIC8vIENyZWF0ZVxuICAgIGNyZWF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAvLyBTZXQgYmFja2dyb3VuZFxuICAgICAgdGhpcy5nYW1lLnN0YWdlLmJhY2tncm91bmRDb2xvciA9IFwiI2I4ZjRiY1wiO1xuXG4gICAgICAvLyBNYWtlIHBhZGRpbmcgZGVwZW5kZW50IG9uIHdpZHRoXG4gICAgICB0aGlzLnBhZGRpbmcgPSB0aGlzLmdhbWUud2lkdGggLyA1MDtcblxuICAgICAgLy8gUGxhY2UgdGl0bGVcbiAgICAgIHRoaXMudGl0bGVJbWFnZSA9IHRoaXMuZ2FtZS5hZGQuc3ByaXRlKDAsIDAsIFwidGl0bGUtc3ByaXRlc1wiLCBcInRpdGxlLnBuZ1wiKTtcbiAgICAgIHRoaXMudGl0bGVJbWFnZS5hbmNob3Iuc2V0VG8oMC41LCAwLjUpO1xuICAgICAgdGhpcy50aXRsZUltYWdlLnNjYWxlLnNldFRvKCh0aGlzLmdhbWUud2lkdGggLSAodGhpcy5wYWRkaW5nICogNCkpIC8gdGhpcy50aXRsZUltYWdlLndpZHRoKTtcbiAgICAgIHRoaXMudGl0bGVJbWFnZS5yZXNldCh0aGlzLmNlbnRlclN0YWdlWCh0aGlzLnRpdGxlSW1hZ2UpLFxuICAgICAgICB0aGlzLmNlbnRlclN0YWdlWSh0aGlzLnRpdGxlSW1hZ2UpIC0gdGhpcy5wYWRkaW5nICogNCk7XG4gICAgICB0aGlzLmdhbWUuYWRkLmV4aXN0aW5nKHRoaXMudGl0bGVJbWFnZSk7XG5cbiAgICAgIC8vIFBsYWNlIHBsYXlcbiAgICAgIHRoaXMucGxheUltYWdlID0gdGhpcy5nYW1lLmFkZC5zcHJpdGUoMCwgMCwgXCJ0aXRsZS1zcHJpdGVzXCIsIFwidGl0bGUtcGxheS5wbmdcIik7XG4gICAgICB0aGlzLnBsYXlJbWFnZS5hbmNob3Iuc2V0VG8oMC40LCAxKTtcbiAgICAgIHRoaXMucGxheUltYWdlLnNjYWxlLnNldFRvKCh0aGlzLmdhbWUud2lkdGggKiAwLjUpIC8gdGhpcy50aXRsZUltYWdlLndpZHRoKTtcbiAgICAgIHRoaXMucGxheUltYWdlLnJlc2V0KHRoaXMuY2VudGVyU3RhZ2VYKHRoaXMucGxheUltYWdlKSwgdGhpcy5nYW1lLmhlaWdodCAtIHRoaXMucGFkZGluZyAqIDIpO1xuICAgICAgdGhpcy5nYW1lLmFkZC5leGlzdGluZyh0aGlzLnBsYXlJbWFnZSk7XG5cbiAgICAgIC8vIEFkZCBob3ZlciBmb3IgbW91c2VcbiAgICAgIHRoaXMucGxheUltYWdlLmlucHV0RW5hYmxlZCA9IHRydWU7XG4gICAgICB0aGlzLnBsYXlJbWFnZS5ldmVudHMub25JbnB1dE92ZXIuYWRkKGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLnBsYXlJbWFnZS5vcmlnaW5hbFRpbnQgPSB0aGlzLnBsYXlJbWFnZS50aW50O1xuICAgICAgICB0aGlzLnBsYXlJbWFnZS50aW50ID0gMC41ICogMHhGRkZGRkY7XG4gICAgICB9LCB0aGlzKTtcblxuICAgICAgdGhpcy5wbGF5SW1hZ2UuZXZlbnRzLm9uSW5wdXRPdXQuYWRkKGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLnBsYXlJbWFnZS50aW50ID0gdGhpcy5wbGF5SW1hZ2Uub3JpZ2luYWxUaW50O1xuICAgICAgfSwgdGhpcyk7XG5cbiAgICAgIC8vIEFkZCBtb3VzZSBpbnRlcmFjdGlvblxuICAgICAgdGhpcy5wbGF5SW1hZ2UuZXZlbnRzLm9uSW5wdXREb3duLmFkZCh0aGlzLmdvLCB0aGlzKTtcblxuICAgICAgLy8gQWRkIGtleWJvYXJkIGludGVyYWN0aW9uXG4gICAgICB0aGlzLmFjdGlvbkJ1dHRvbiA9IHRoaXMuZ2FtZS5pbnB1dC5rZXlib2FyZC5hZGRLZXkoUGhhc2VyLktleWJvYXJkLlNQQUNFQkFSKTtcbiAgICAgIHRoaXMuYWN0aW9uQnV0dG9uLm9uRG93bi5hZGQoZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuZ28oKTtcbiAgICAgIH0sIHRoaXMpO1xuXG4gICAgICAvLyBTaG93IGFueSBvdmVybGF5c1xuICAgICAgdGhpcy5nYW1lLnBpY2tsZS5zaG93T3ZlcmxheShcIi5zdGF0ZS1tZW51XCIpO1xuICAgIH0sXG5cbiAgICAvLyBTdGFydCBwbGF5aW5nXG4gICAgZ286IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5nYW1lLnBpY2tsZS5oaWRlT3ZlcmxheShcIi5zdGF0ZS1tZW51XCIpO1xuICAgICAgdGhpcy5nYW1lLnN0YXRlLnN0YXJ0KFwicGxheVwiKTtcbiAgICB9LFxuXG4gICAgLy8gVXBkYXRlXG4gICAgdXBkYXRlOiBmdW5jdGlvbigpIHtcbiAgICB9LFxuXG4gICAgLy8gQ2VudGVyIHggb24gc3RhZ2VcbiAgICBjZW50ZXJTdGFnZVg6IGZ1bmN0aW9uKG9iaikge1xuICAgICAgcmV0dXJuICgodGhpcy5nYW1lLndpZHRoIC0gb2JqLndpZHRoKSAvIDIpICsgKG9iai53aWR0aCAvIDIpO1xuICAgIH0sXG5cbiAgICAvLyBDZW50ZXIgeCBvbiBzdGFnZVxuICAgIGNlbnRlclN0YWdlWTogZnVuY3Rpb24ob2JqKSB7XG4gICAgICByZXR1cm4gKCh0aGlzLmdhbWUuaGVpZ2h0IC0gb2JqLmhlaWdodCkgLyAyKSArIChvYmouaGVpZ2h0IC8gMik7XG4gICAgfVxuICB9KTtcblxuICAvLyBFeHBvcnRcbiAgbW9kdWxlLmV4cG9ydHMgPSBNZW51O1xufSkoKTtcbiIsIi8qIGdsb2JhbCBfOmZhbHNlLCBQaGFzZXI6ZmFsc2UgKi9cblxuLyoqXG4gKiBQbGF5IHN0YXRlXG4gKi9cblxuKGZ1bmN0aW9uKCkge1xuICBcInVzZSBzdHJpY3RcIjtcblxuICAvLyBEZXBlbmRlbmNpZXNcbiAgdmFyIHByZWZhYnMgPSB7XG4gICAgRGlsbDogcmVxdWlyZShcIi4vcHJlZmFiLWRpbGwuanNcIiksXG4gICAgUGVwcGVyOiByZXF1aXJlKFwiLi9wcmVmYWItcGVwcGVyLmpzXCIpLFxuICAgIEJvdHVsaXNtOiByZXF1aXJlKFwiLi9wcmVmYWItYm90dWxpc20uanNcIiksXG4gICAgTWluaTogcmVxdWlyZShcIi4vcHJlZmFiLW1pbmkuanNcIiksXG4gICAgSGVybzogcmVxdWlyZShcIi4vcHJlZmFiLWhlcm8uanNcIiksXG4gICAgQmVhbjogcmVxdWlyZShcIi4vcHJlZmFiLWJlYW4uanNcIiksXG4gICAgQ2Fycm90OiByZXF1aXJlKFwiLi9wcmVmYWItY2Fycm90LmpzXCIpLFxuICAgIEphcjogcmVxdWlyZShcIi4vcHJlZmFiLWphci5qc1wiKVxuICB9O1xuXG4gIC8vIENvbnN0cnVjdG9yXG4gIHZhciBQbGF5ID0gZnVuY3Rpb24oKSB7XG4gICAgUGhhc2VyLlN0YXRlLmNhbGwodGhpcyk7XG4gIH07XG5cbiAgLy8gRXh0ZW5kIGZyb20gU3RhdGVcbiAgUGxheS5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFBoYXNlci5TdGF0ZS5wcm90b3R5cGUpO1xuICBQbGF5LnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFBsYXk7XG5cbiAgLy8gQWRkIG1ldGhvZHNcbiAgXy5leHRlbmQoUGxheS5wcm90b3R5cGUsIFBoYXNlci5TdGF0ZS5wcm90b3R5cGUsIHtcbiAgICAvLyBQcmVsb2FkXG4gICAgcHJlbG9hZDogZnVuY3Rpb24oKSB7XG4gICAgICAvLyBMb2FkIHVwIGdhbWUgaW1hZ2VzXG4gICAgICB0aGlzLmdhbWUubG9hZC5hdGxhcyhcImdhbWUtc3ByaXRlc1wiLCBcImFzc2V0cy9nYW1lLXNwcml0ZXMucG5nXCIsIFwiYXNzZXRzL2dhbWUtc3ByaXRlcy5qc29uXCIpO1xuICAgICAgdGhpcy5nYW1lLmxvYWQuYXRsYXMoXCJwaWNrbGUtc3ByaXRlc1wiLCBcImFzc2V0cy9waWNrbGUtc3ByaXRlcy5wbmdcIiwgXCJhc3NldHMvcGlja2xlLXNwcml0ZXMuanNvblwiKTtcbiAgICAgIHRoaXMuZ2FtZS5sb2FkLmF0bGFzKFwiY2Fycm90LXNwcml0ZXNcIiwgXCJhc3NldHMvY2Fycm90LXNwcml0ZXMucG5nXCIsIFwiYXNzZXRzL2NhcnJvdC1zcHJpdGVzLmpzb25cIik7XG4gICAgfSxcblxuICAgIC8vIENyZWF0ZVxuICAgIGNyZWF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAvLyBTZXQgaW5pdGlhbCBkaWZmaWN1bHR5IGFuZCBsZXZlbCBzZXR0aW5nc1xuICAgICAgdGhpcy5jcmVhdGVTdXBlckxldmVsQkcoKTtcbiAgICAgIHRoaXMudXBkYXRlRGlmZmljdWx0eSgpO1xuXG4gICAgICAvLyBTY29yaW5nXG4gICAgICB0aGlzLnNjb3JlTWluaSA9IDEwMDtcbiAgICAgIHRoaXMuc2NvcmVEaWxsID0gNTAwO1xuICAgICAgdGhpcy5zY29yZVBlcHBlciA9IDc1MDtcbiAgICAgIHRoaXMuc2NvcmVCb3QgPSAxMDAwO1xuXG4gICAgICAvLyBTcGFjaW5nXG4gICAgICB0aGlzLnBhZGRpbmcgPSAxMDtcblxuICAgICAgLy8gRGV0ZXJtaW5lIHdoZXJlIGZpcnN0IHBsYXRmb3JtIGFuZCBoZXJvIHdpbGwgYmUuXG4gICAgICB0aGlzLnN0YXJ0WSA9IHRoaXMuZ2FtZS5oZWlnaHQgLSA1O1xuXG4gICAgICAvLyBJbml0aWFsaXplIHRyYWNraW5nIHZhcmlhYmxlc1xuICAgICAgdGhpcy5yZXNldFZpZXdUcmFja2luZygpO1xuXG4gICAgICAvLyBTY2FsaW5nXG4gICAgICB0aGlzLmdhbWUuc2NhbGUuc2NhbGVNb2RlID0gUGhhc2VyLlNjYWxlTWFuYWdlci5TSE9XX0FMTDtcbiAgICAgIHRoaXMuZ2FtZS5zY2FsZS5tYXhXaWR0aCA9IHRoaXMuZ2FtZS53aWR0aDtcbiAgICAgIHRoaXMuZ2FtZS5zY2FsZS5tYXhIZWlnaHQgPSB0aGlzLmdhbWUuaGVpZ2h0O1xuICAgICAgdGhpcy5nYW1lLnNjYWxlLnBhZ2VBbGlnbkhvcml6b250YWxseSA9IHRydWU7XG4gICAgICB0aGlzLmdhbWUuc2NhbGUucGFnZUFsaWduVmVydGljYWxseSA9IHRydWU7XG5cbiAgICAgIC8vIFBoeXNpY3NcbiAgICAgIHRoaXMuZ2FtZS5waHlzaWNzLnN0YXJ0U3lzdGVtKFBoYXNlci5QaHlzaWNzLkFSQ0FERSk7XG4gICAgICB0aGlzLmdhbWUucGh5c2ljcy5hcmNhZGUuZ3Jhdml0eS55ID0gMTAwMDtcblxuICAgICAgLy8gQ29udGFpbmVyc1xuICAgICAgdGhpcy5iZWFucyA9IHRoaXMuZ2FtZS5hZGQuZ3JvdXAoKTtcbiAgICAgIHRoaXMuY2Fycm90cyA9IHRoaXMuZ2FtZS5hZGQuZ3JvdXAoKTtcbiAgICAgIHRoaXMubWluaXMgPSB0aGlzLmdhbWUuYWRkLmdyb3VwKCk7XG4gICAgICB0aGlzLmRpbGxzID0gdGhpcy5nYW1lLmFkZC5ncm91cCgpO1xuICAgICAgdGhpcy5wZXBwZXJzID0gdGhpcy5nYW1lLmFkZC5ncm91cCgpO1xuICAgICAgdGhpcy5ib3RzID0gdGhpcy5nYW1lLmFkZC5ncm91cCgpO1xuXG4gICAgICAvLyBQbGF0Zm9ybXNcbiAgICAgIHRoaXMuYWRkUGxhdGZvcm1zKCk7XG5cbiAgICAgIC8vIEFkZCBoZXJvIGhlcmUgc28gaXMgYWx3YXlzIG9uIHRvcC5cbiAgICAgIHRoaXMuaGVybyA9IG5ldyBwcmVmYWJzLkhlcm8odGhpcy5nYW1lLCAwLCAwKTtcbiAgICAgIHRoaXMuaGVyby5yZXNldFBsYWNlbWVudCh0aGlzLmdhbWUud2lkdGggKiAwLjUsIHRoaXMuc3RhcnRZIC0gdGhpcy5oZXJvLmhlaWdodCAtIDUwKTtcbiAgICAgIHRoaXMuZ2FtZS5hZGQuZXhpc3RpbmcodGhpcy5oZXJvKTtcblxuICAgICAgLy8gSW5pdGlhbGl6ZSBzY29yZVxuICAgICAgdGhpcy5yZXNldFNjb3JlKCk7XG4gICAgICB0aGlzLnVwZGF0ZVNjb3JlKCk7XG5cbiAgICAgIC8vIEN1cnNvcnMsIGlucHV0XG4gICAgICB0aGlzLmN1cnNvcnMgPSB0aGlzLmdhbWUuaW5wdXQua2V5Ym9hcmQuY3JlYXRlQ3Vyc29yS2V5cygpO1xuICAgICAgdGhpcy5hY3Rpb25CdXR0b24gPSB0aGlzLmdhbWUuaW5wdXQua2V5Ym9hcmQuYWRkS2V5KFBoYXNlci5LZXlib2FyZC5TUEFDRUJBUik7XG4gICAgfSxcblxuICAgIC8vIFVwZGF0ZVxuICAgIHVwZGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAvLyBUaGlzIGlzIHdoZXJlIHRoZSBtYWluIG1hZ2ljIGhhcHBlbnNcbiAgICAgIC8vIHRoZSB5IG9mZnNldCBhbmQgdGhlIGhlaWdodCBvZiB0aGUgd29ybGQgYXJlIGFkanVzdGVkXG4gICAgICAvLyB0byBtYXRjaCB0aGUgaGlnaGVzdCBwb2ludCB0aGUgaGVybyBoYXMgcmVhY2hlZFxuICAgICAgdGhpcy53b3JsZC5zZXRCb3VuZHMoMCwgLXRoaXMuaGVyby55Q2hhbmdlLCB0aGlzLmdhbWUud29ybGQud2lkdGgsXG4gICAgICAgIHRoaXMuZ2FtZS5oZWlnaHQgKyB0aGlzLmhlcm8ueUNoYW5nZSk7XG5cbiAgICAgIC8vIFRoZSBidWlsdCBpbiBjYW1lcmEgZm9sbG93IG1ldGhvZHMgd29uJ3Qgd29yayBmb3Igb3VyIG5lZWRzXG4gICAgICAvLyB0aGlzIGlzIGEgY3VzdG9tIGZvbGxvdyBzdHlsZSB0aGF0IHdpbGwgbm90IGV2ZXIgbW92ZSBkb3duLCBpdCBvbmx5IG1vdmVzIHVwXG4gICAgICB0aGlzLmNhbWVyYVlNaW4gPSBNYXRoLm1pbih0aGlzLmNhbWVyYVlNaW4sIHRoaXMuaGVyby55IC0gdGhpcy5nYW1lLmhlaWdodCAvIDIpO1xuICAgICAgdGhpcy5jYW1lcmEueSA9IHRoaXMuY2FtZXJhWU1pbjtcblxuICAgICAgLy8gSWYgaGVybyBmYWxscyBiZWxvdyBjYW1lcmFcbiAgICAgIGlmICh0aGlzLmhlcm8ueSA+IHRoaXMuY2FtZXJhWU1pbiArIHRoaXMuZ2FtZS5oZWlnaHQgKyAyMDApIHtcbiAgICAgICAgdGhpcy5nYW1lT3ZlcigpO1xuICAgICAgfVxuXG4gICAgICAvLyBJZiBoZXJvIGlzIGdvaW5nIGRvd24sIHRoZW4gbm8gbG9uZ2VyIG9uIGZpcmVcbiAgICAgIGlmICh0aGlzLmhlcm8uYm9keS52ZWxvY2l0eS55ID4gMCkge1xuICAgICAgICB0aGlzLnB1dE91dEZpcmUoKTtcbiAgICAgIH1cblxuICAgICAgLy8gTW92ZSBoZXJvXG4gICAgICB0aGlzLmhlcm8uYm9keS52ZWxvY2l0eS54ID1cbiAgICAgICAgKHRoaXMuY3Vyc29ycy5sZWZ0LmlzRG93bikgPyAtKHRoaXMuZ2FtZS5waHlzaWNzLmFyY2FkZS5ncmF2aXR5LnkgLyA1KSA6XG4gICAgICAgICh0aGlzLmN1cnNvcnMucmlnaHQuaXNEb3duKSA/ICh0aGlzLmdhbWUucGh5c2ljcy5hcmNhZGUuZ3Jhdml0eS55IC8gNSkgOiAwO1xuXG4gICAgICAvLyBDb2xsaXNpb25zXG4gICAgICB0aGlzLnVwZGF0ZUNvbGxpc2lvbnMoKTtcblxuICAgICAgLy8gSXRlbXMgKHBsYXRmb3JtcyBhbmQgaXRlbXMpXG4gICAgICB0aGlzLnVwZGF0ZUl0ZW1zKCk7XG5cbiAgICAgIC8vIFVwZGF0ZSBzY29yZVxuICAgICAgdGhpcy51cGRhdGVTY29yZSgpO1xuXG4gICAgICAvLyBVcGRhdGUgZGlmZmljdWx0XG4gICAgICB0aGlzLnVwZGF0ZURpZmZpY3VsdHkoKTtcblxuICAgICAgLy8gRGVidWdcbiAgICAgIGlmICh0aGlzLmdhbWUucGlja2xlLm9wdGlvbnMuZGVidWcpIHtcbiAgICAgICAgdGhpcy5nYW1lLmRlYnVnLmJvZHkodGhpcy5oZXJvKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLy8gSGFuZGxlIGNvbGxpc2lvbnNcbiAgICB1cGRhdGVDb2xsaXNpb25zOiBmdW5jdGlvbigpIHtcbiAgICAgIC8vIFdoZW4gZGVhZCwgbm8gY29sbGlzaW9ucywganVzdCBmYWxsIHRvIGRlYXRoLlxuICAgICAgaWYgKHRoaXMuaGVyby5pc0RlYWQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBQbGF0Zm9ybSBjb2xsaXNpb25zXG4gICAgICB0aGlzLmdhbWUucGh5c2ljcy5hcmNhZGUuY29sbGlkZSh0aGlzLmhlcm8sIHRoaXMuYmVhbnMsIHRoaXMudXBkYXRlSGVyb1BsYXRmb3JtLCBudWxsLCB0aGlzKTtcbiAgICAgIHRoaXMuZ2FtZS5waHlzaWNzLmFyY2FkZS5jb2xsaWRlKHRoaXMuaGVybywgdGhpcy5jYXJyb3RzLCB0aGlzLnVwZGF0ZUhlcm9QbGF0Zm9ybSwgbnVsbCwgdGhpcyk7XG4gICAgICB0aGlzLmdhbWUucGh5c2ljcy5hcmNhZGUuY29sbGlkZSh0aGlzLmhlcm8sIHRoaXMuYmFzZSwgdGhpcy51cGRhdGVIZXJvUGxhdGZvcm0sIG51bGwsIHRoaXMpO1xuXG4gICAgICAvLyBNaW5pIGNvbGxpc2lvbnNcbiAgICAgIHRoaXMuZ2FtZS5waHlzaWNzLmFyY2FkZS5vdmVybGFwKHRoaXMuaGVybywgdGhpcy5taW5pcywgZnVuY3Rpb24oaGVybywgbWluaSkge1xuICAgICAgICBtaW5pLmtpbGwoKTtcbiAgICAgICAgdGhpcy51cGRhdGVTY29yZSh0aGlzLnNjb3JlTWluaSk7XG4gICAgICB9LCBudWxsLCB0aGlzKTtcblxuICAgICAgLy8gRGlsbCBjb2xsaXNpb25zLiAgRG9uJ3QgZG8gYW55dGhpbmcgaWYgb24gZmlyZVxuICAgICAgaWYgKCF0aGlzLm9uRmlyZSkge1xuICAgICAgICB0aGlzLmdhbWUucGh5c2ljcy5hcmNhZGUub3ZlcmxhcCh0aGlzLmhlcm8sIHRoaXMuZGlsbHMsIGZ1bmN0aW9uKGhlcm8sIGRpbGwpIHtcbiAgICAgICAgICBkaWxsLmtpbGwoKTtcbiAgICAgICAgICB0aGlzLnVwZGF0ZVNjb3JlKHRoaXMuc2NvcmVEaWxsKTtcbiAgICAgICAgICBoZXJvLmJvZHkudmVsb2NpdHkueSA9IHRoaXMuZ2FtZS5waHlzaWNzLmFyY2FkZS5ncmF2aXR5LnkgKiAtMSAqIDEuNTtcbiAgICAgICAgfSwgbnVsbCwgdGhpcyk7XG4gICAgICB9XG5cbiAgICAgIC8vIFBlcHBlciBjb2xsaXNpb25zXG4gICAgICB0aGlzLmdhbWUucGh5c2ljcy5hcmNhZGUub3ZlcmxhcCh0aGlzLmhlcm8sIHRoaXMucGVwcGVycywgZnVuY3Rpb24oaGVybywgcGVwcGVyKSB7XG4gICAgICAgIHBlcHBlci5raWxsKCk7XG4gICAgICAgIHRoaXMudXBkYXRlU2NvcmUodGhpcy5zY29yZVBlcHBlcik7XG4gICAgICAgIHRoaXMuc2V0T25GaXJlKCk7XG4gICAgICAgIGhlcm8uYm9keS52ZWxvY2l0eS55ID0gdGhpcy5nYW1lLnBoeXNpY3MuYXJjYWRlLmdyYXZpdHkueSAqIC0xICogMztcbiAgICAgIH0sIG51bGwsIHRoaXMpO1xuXG4gICAgICAvLyBCb3R1bGlzbSBjb2xsaXNpb25zLiAgSWYgaGVybyBqdW1wcyBvbiB0b3AsIHRoZW4ga2lsbCwgb3RoZXJ3aXNlIGRpZSwgYW5kXG4gICAgICAvLyBpZ25vcmUgaWYgb24gZmlyZS5cbiAgICAgIGlmICghdGhpcy5vbkZpcmUpIHtcbiAgICAgICAgdGhpcy5nYW1lLnBoeXNpY3MuYXJjYWRlLmNvbGxpZGUodGhpcy5oZXJvLCB0aGlzLmJvdHMsIGZ1bmN0aW9uKGhlcm8sIGJvdCkge1xuICAgICAgICAgIGlmIChoZXJvLmJvZHkudG91Y2hpbmcuZG93bikge1xuICAgICAgICAgICAgYm90Lm11cmRlcigpO1xuICAgICAgICAgICAgdGhpcy51cGRhdGVTY29yZSh0aGlzLnNjb3JlQm90KTtcbiAgICAgICAgICAgIGhlcm8uYm9keS52ZWxvY2l0eS55ID0gdGhpcy5nYW1lLnBoeXNpY3MuYXJjYWRlLmdyYXZpdHkueSAqIC0xICogMC41O1xuICAgICAgICAgIH1cbiAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGhlcm8uYm90Y2h5TXVkZXIoKTtcbiAgICAgICAgICAgIGJvdC5tdXJkZXIoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0sIG51bGwsIHRoaXMpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICAvLyBQbGF0Zm9ybSBjb2xsaXNpb25cbiAgICB1cGRhdGVIZXJvUGxhdGZvcm06IGZ1bmN0aW9uKGhlcm8sIGl0ZW0pIHtcbiAgICAgIC8vIE1ha2Ugc3VyZSBubyBsb25nZXIgb24gZmlyZVxuICAgICAgdGhpcy5wdXRPdXRGaXJlKCk7XG5cbiAgICAgIC8vIEp1bXBcbiAgICAgIGhlcm8uYm9keS52ZWxvY2l0eS55ID0gdGhpcy5nYW1lLnBoeXNpY3MuYXJjYWRlLmdyYXZpdHkueSAqIC0xICogMC43O1xuXG4gICAgICAvLyBJZiBjYXJyb3QsIHNuYXBcbiAgICAgIGlmIChpdGVtIGluc3RhbmNlb2YgcHJlZmFicy5DYXJyb3QpIHtcbiAgICAgICAgaXRlbS5zbmFwKCk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIC8vIEhhbmRsZSBpdGVtc1xuICAgIHVwZGF0ZUl0ZW1zOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBoaWdoZXN0O1xuICAgICAgdmFyIGJlYW47XG4gICAgICB2YXIgY2Fycm90O1xuXG4gICAgICAvLyBSZW1vdmUgYW55IGl0ZW1zIHRoYXQgYXJlIG9mZiBzY3JlZW5cbiAgICAgIFtcIm1pbmlzXCIsIFwiZGlsbHNcIiwgXCJib3RzXCIsIFwicGVwcGVyc1wiLCBcImJlYW5zXCIsIFwiY2Fycm90c1wiXS5mb3JFYWNoKF8uYmluZChmdW5jdGlvbihwb29sKSB7XG4gICAgICAgIHRoaXNbcG9vbF0uZm9yRWFjaEFsaXZlKGZ1bmN0aW9uKHApIHtcbiAgICAgICAgICAvLyBDaGVjayBpZiB0aGlzIG9uZSBpcyBvZiB0aGUgc2NyZWVuXG4gICAgICAgICAgaWYgKHAueSA+IHRoaXMuY2FtZXJhLnkgKyB0aGlzLmdhbWUuaGVpZ2h0KSB7XG4gICAgICAgICAgICBwLmtpbGwoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0sIHRoaXMpO1xuICAgICAgfSwgdGhpcykpO1xuXG4gICAgICAvLyBEZXRlcm1pbmUgd2hlcmUgdGhlIGxhc3QgcGxhdGZvcm0gaXNcbiAgICAgIFtcImJlYW5zXCIsIFwiY2Fycm90c1wiXS5mb3JFYWNoKF8uYmluZChmdW5jdGlvbihncm91cCkge1xuICAgICAgICB0aGlzW2dyb3VwXS5mb3JFYWNoQWxpdmUoZnVuY3Rpb24ocCkge1xuICAgICAgICAgIGlmIChwLnkgPCB0aGlzLnBsYXRmb3JtWU1pbikge1xuICAgICAgICAgICAgdGhpcy5wbGF0Zm9ybVlNaW4gPSBwLnk7XG4gICAgICAgICAgICBoaWdoZXN0ID0gcDtcbiAgICAgICAgICB9XG4gICAgICAgIH0sIHRoaXMpO1xuICAgICAgfSwgdGhpcykpO1xuXG4gICAgICAvLyBBZGQgbmV3IHBsYXRmb3JtIGlmIG5lZWRlZFxuICAgICAgY2Fycm90ID0gdGhpcy5jYXJyb3RzLmdldEZpcnN0RGVhZCgpO1xuICAgICAgYmVhbiA9IHRoaXMuYmVhbnMuZ2V0Rmlyc3REZWFkKCk7XG4gICAgICBpZiAoY2Fycm90ICYmIGJlYW4pIHtcbiAgICAgICAgaWYgKE1hdGgucmFuZG9tKCkgPCB0aGlzLmNhcnJvdENoYW5jZSkge1xuICAgICAgICAgIHRoaXMucGxhY2VQbGF0Zm9ybShjYXJyb3QsIGhpZ2hlc3QpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIHRoaXMucGxhY2VQbGF0Zm9ybShiZWFuLCBoaWdoZXN0KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG5cbiAgICAvLyBTaHV0ZG93blxuICAgIHNodXRkb3duOiBmdW5jdGlvbigpIHtcbiAgICAgIC8vIFJlc2V0IGV2ZXJ5dGhpbmcsIG9yIHRoZSB3b3JsZCB3aWxsIGJlIG1lc3NlZCB1cFxuICAgICAgdGhpcy53b3JsZC5zZXRCb3VuZHMoMCwgMCwgdGhpcy5nYW1lLndpZHRoLCB0aGlzLmdhbWUuaGVpZ2h0KTtcbiAgICAgIHRoaXMuY3Vyc29yID0gbnVsbDtcbiAgICAgIHRoaXMucmVzZXRWaWV3VHJhY2tpbmcoKTtcbiAgICAgIHRoaXMucmVzZXRTY29yZSgpO1xuXG4gICAgICBbXCJoZXJvXCIsIFwiYmVhbnNcIiwgXCJtaW5pc1wiLCBcImRpbGxzXCIsIFwicGVwcGVyc1wiLFxuICAgICAgICBcImNhcnJvdHNcIiwgXCJzY29yZUdyb3VwXCJdLmZvckVhY2goXy5iaW5kKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgaWYgKHRoaXNbaXRlbV0pIHtcbiAgICAgICAgICB0aGlzW2l0ZW1dLmRlc3Ryb3koKTtcbiAgICAgICAgICB0aGlzW2l0ZW1dID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgfSwgdGhpcykpO1xuICAgIH0sXG5cbiAgICAvLyBHYW1lIG92ZXJcbiAgICBnYW1lT3ZlcjogZnVuY3Rpb24oKSB7XG4gICAgICAvLyBDYW4ndCBzZWVtIHRvIGZpbmQgYSB3YXkgdG8gcGFzcyB0aGUgc2NvcmVcbiAgICAgIC8vIHZpYSBhIHN0YXRlIGNoYW5nZS5cbiAgICAgIHRoaXMuZ2FtZS5waWNrbGUuc2NvcmUgPSB0aGlzLnNjb3JlO1xuICAgICAgdGhpcy5nYW1lLnN0YXRlLnN0YXJ0KFwiZ2FtZW92ZXJcIik7XG4gICAgfSxcblxuICAgIC8vIEFkZCBwbGF0Zm9ybSBwb29sIGFuZCBjcmVhdGUgaW5pdGlhbCBvbmVcbiAgICBhZGRQbGF0Zm9ybXM6IGZ1bmN0aW9uKCkge1xuICAgICAgLy8gQWRkIGJhc2UgcGxhdGZvcm0gKGphcikuXG4gICAgICB0aGlzLmJhc2UgPSBuZXcgcHJlZmFicy5KYXIodGhpcy5nYW1lLCB0aGlzLmdhbWUud2lkdGggKiAwLjUsIHRoaXMuc3RhcnRZLCB0aGlzLmdhbWUud2lkdGggKiAyKTtcbiAgICAgIHRoaXMuZ2FtZS5hZGQuZXhpc3RpbmcodGhpcy5iYXNlKTtcblxuICAgICAgLy8gQWRkIHNvbWUgYmFzZSBjYXJyb3RzIChidXQgaGF2ZSB0aGVtIG9mZiBzY3JlZW4pXG4gICAgICBfLmVhY2goXy5yYW5nZSgxMCksIF8uYmluZChmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHAgPSBuZXcgcHJlZmFicy5DYXJyb3QodGhpcy5nYW1lLCAtOTk5LCB0aGlzLmdhbWUuaGVpZ2h0ICogMik7XG4gICAgICAgIHRoaXMuY2Fycm90cy5hZGQocCk7XG4gICAgICB9LCB0aGlzKSk7XG5cbiAgICAgIC8vIEFkZCBzb21lIGJhc2UgYmVhbnNcbiAgICAgIHZhciBwcmV2aW91cztcbiAgICAgIF8uZWFjaChfLnJhbmdlKDIwKSwgXy5iaW5kKGZ1bmN0aW9uKGkpIHtcbiAgICAgICAgdmFyIHAgPSBuZXcgcHJlZmFicy5CZWFuKHRoaXMuZ2FtZSwgMCwgMCk7XG4gICAgICAgIHRoaXMucGxhY2VQbGF0Zm9ybShwLCBwcmV2aW91cywgdGhpcy53b3JsZC5oZWlnaHQgLSB0aGlzLnBsYXRmb3JtU3BhY2VZIC0gdGhpcy5wbGF0Zm9ybVNwYWNlWSAqIGkpO1xuICAgICAgICB0aGlzLmJlYW5zLmFkZChwKTtcbiAgICAgICAgcHJldmlvdXMgPSBwO1xuICAgICAgfSwgdGhpcykpO1xuICAgIH0sXG5cbiAgICAvLyBQbGFjZSBwbGF0Zm9ybVxuICAgIHBsYWNlUGxhdGZvcm06IGZ1bmN0aW9uKHBsYXRmb3JtLCBwcmV2aW91c1BsYXRmb3JtLCBvdmVycmlkZVksIHBsYXRmb3JtVHlwZSkge1xuICAgICAgcGxhdGZvcm0ucmVzZXRTZXR0aW5ncygpO1xuICAgICAgcGxhdGZvcm1UeXBlID0gKHBsYXRmb3JtVHlwZSA9PT0gdW5kZWZpbmVkKSA/IFwiYmVhblwiIDogcGxhdGZvcm1UeXBlO1xuICAgICAgdmFyIHkgPSBvdmVycmlkZVkgfHwgdGhpcy5wbGF0Zm9ybVlNaW4gLSB0aGlzLnBsYXRmb3JtU3BhY2VZO1xuICAgICAgdmFyIG1pblggPSBwbGF0Zm9ybS5taW5YO1xuICAgICAgdmFyIG1heFggPSBwbGF0Zm9ybS5tYXhYO1xuXG4gICAgICAvLyBEZXRlcm1pbmUgeCBiYXNlZCBvbiBwcmV2aW91c1BsYXRmb3JtXG4gICAgICB2YXIgeCA9IHRoaXMucm5kLmludGVnZXJJblJhbmdlKG1pblgsIG1heFgpO1xuICAgICAgaWYgKHByZXZpb3VzUGxhdGZvcm0pIHtcbiAgICAgICAgeCA9IHRoaXMucm5kLmludGVnZXJJblJhbmdlKHByZXZpb3VzUGxhdGZvcm0ueCAtIHRoaXMucGxhdGZvcm1HYXBNYXgsIHByZXZpb3VzUGxhdGZvcm0ueCArIHRoaXMucGxhdGZvcm1HYXBNYXgpO1xuXG4gICAgICAgIC8vIFNvbWUgbG9naWMgdG8gdHJ5IHRvIHdyYXBcbiAgICAgICAgeCA9ICh4IDwgMCkgPyBNYXRoLm1pbihtYXhYLCB0aGlzLndvcmxkLndpZHRoICsgeCkgOiBNYXRoLm1heCh4LCBtaW5YKTtcbiAgICAgICAgeCA9ICh4ID4gdGhpcy53b3JsZC53aWR0aCkgPyBNYXRoLm1heChtaW5YLCB4IC0gdGhpcy53b3JsZC53aWR0aCkgOiBNYXRoLm1pbih4LCBtYXhYKTtcbiAgICAgIH1cblxuICAgICAgLy8gUGxhY2VcbiAgICAgIHBsYXRmb3JtLnJlc2V0KHgsIHkpO1xuXG4gICAgICAvLyBBZGQgc29tZSBmbHVmZlxuICAgICAgdGhpcy5mbHVmZlBsYXRmb3JtKHBsYXRmb3JtKTtcbiAgICB9LFxuXG4gICAgLy8gQWRkIHBvc3NpYmxlIGZsdWZmIHRvIHBsYXRmb3JtXG4gICAgZmx1ZmZQbGF0Zm9ybTogZnVuY3Rpb24ocGxhdGZvcm0pIHtcbiAgICAgIHZhciB4ID0gcGxhdGZvcm0ueDtcbiAgICAgIHZhciB5ID0gcGxhdGZvcm0ueSAtIHBsYXRmb3JtLmhlaWdodCAvIDIgLSAzMDtcblxuICAgICAgLy8gQWRkIGZsdWZmXG4gICAgICBpZiAoTWF0aC5yYW5kb20oKSA8PSB0aGlzLmhvdmVyQ2hhbmNlKSB7XG4gICAgICAgIHBsYXRmb3JtLmhvdmVyID0gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKE1hdGgucmFuZG9tKCkgPD0gdGhpcy5taW5pQ2hhbmNlKSB7XG4gICAgICAgIHRoaXMuYWRkV2l0aFBvb2wodGhpcy5taW5pcywgXCJNaW5pXCIsIHgsIHkpO1xuICAgICAgfVxuICAgICAgZWxzZSBpZiAoTWF0aC5yYW5kb20oKSA8PSB0aGlzLmRpbGxDaGFuY2UpIHtcbiAgICAgICAgdGhpcy5hZGRXaXRoUG9vbCh0aGlzLmRpbGxzLCBcIkRpbGxcIiwgeCwgeSk7XG4gICAgICB9XG4gICAgICBlbHNlIGlmIChNYXRoLnJhbmRvbSgpIDw9IHRoaXMuYm90Q2hhbmNlKSB7XG4gICAgICAgIHRoaXMuYWRkV2l0aFBvb2wodGhpcy5ib3RzLCBcIkJvdHVsaXNtXCIsIHgsIHkpO1xuICAgICAgfVxuICAgICAgZWxzZSBpZiAoTWF0aC5yYW5kb20oKSA8PSB0aGlzLnBlcHBlckNoYW5jZSkge1xuICAgICAgICB0aGlzLmFkZFdpdGhQb29sKHRoaXMucGVwcGVycywgXCJQZXBwZXJcIiwgeCwgeSk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIC8vIEdlbmVyaWMgYWRkIHdpdGggcG9vbGluZyBmdW5jdGlvbmFsbGl0eVxuICAgIGFkZFdpdGhQb29sOiBmdW5jdGlvbihwb29sLCBwcmVmYWIsIHgsIHkpIHtcbiAgICAgIHZhciBvID0gcG9vbC5nZXRGaXJzdERlYWQoKTtcbiAgICAgIG8gPSBvIHx8IG5ldyBwcmVmYWJzW3ByZWZhYl0odGhpcy5nYW1lLCB4LCB5KTtcblxuICAgICAgLy8gVXNlIGN1c3RvbSByZXNldCBpZiBhdmFpbGFibGVcbiAgICAgIGlmIChvLnJlc2V0UGxhY2VtZW50KSB7XG4gICAgICAgIG8ucmVzZXRQbGFjZW1lbnQoeCwgeSk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgby5yZXNldCh4LCB5KTtcbiAgICAgIH1cblxuICAgICAgcG9vbC5hZGQobyk7XG4gICAgfSxcblxuICAgIC8vIFVwZGF0ZSBzY29yZS4gIFNjb3JlIGlzIHRoZSBzY29yZSB3aXRob3V0IGhvdyBmYXIgdGhleSBoYXZlIGdvbmUgdXAuXG4gICAgdXBkYXRlU2NvcmU6IGZ1bmN0aW9uKGFkZGl0aW9uKSB7XG4gICAgICBhZGRpdGlvbiA9IGFkZGl0aW9uIHx8IDA7XG4gICAgICB0aGlzLnNjb3JlVXAgPSAoLXRoaXMuY2FtZXJhWU1pbiA+PSA5OTk5OTk5KSA/IDAgOlxuICAgICAgICBNYXRoLm1pbihNYXRoLm1heCgwLCAtdGhpcy5jYW1lcmFZTWluKSwgOTk5OTk5OSAtIDEpO1xuICAgICAgdGhpcy5zY29yZUNvbGxlY3QgPSAodGhpcy5zY29yZUNvbGxlY3QgfHwgMCkgKyBhZGRpdGlvbjtcbiAgICAgIHRoaXMuc2NvcmUgPSBNYXRoLnJvdW5kKHRoaXMuc2NvcmVVcCArIHRoaXMuc2NvcmVDb2xsZWN0KTtcblxuICAgICAgLy8gU2NvcmUgdGV4dFxuICAgICAgaWYgKCF0aGlzLnNjb3JlR3JvdXApIHtcbiAgICAgICAgdGhpcy5zY29yZUdyb3VwID0gdGhpcy5nYW1lLmFkZC5ncm91cCgpO1xuXG4gICAgICAgIC8vIFNjb3JlIGxhYmVsXG4gICAgICAgIC8qXG4gICAgICAgIHRoaXMuc2NvcmVMYWJlbEltYWdlID0gdGhpcy5nYW1lLmFkZC5zcHJpdGUoXG4gICAgICAgICAgdGhpcy5wYWRkaW5nLFxuICAgICAgICAgIHRoaXMucGFkZGluZyAqIDAuODUsIFwiZ2FtZS1zcHJpdGVzXCIsIFwieW91ci1zY29yZS5wbmdcIik7XG4gICAgICAgIHRoaXMuc2NvcmVMYWJlbEltYWdlLmFuY2hvci5zZXRUbygwLCAwKTtcbiAgICAgICAgdGhpcy5zY29yZUxhYmVsSW1hZ2Uuc2NhbGUuc2V0VG8oKHRoaXMuZ2FtZS53aWR0aCAvIDUpIC8gdGhpcy5zY29yZUxhYmVsSW1hZ2Uud2lkdGgpO1xuICAgICAgICB0aGlzLnNjb3JlR3JvdXAuYWRkKHRoaXMuc2NvcmVMYWJlbEltYWdlKTtcbiAgICAgICAgKi9cblxuICAgICAgICAvLyBTY29yZSB0ZXh0XG4gICAgICAgIHRoaXMuc2NvcmVUZXh0ID0gdGhpcy5nYW1lLmFkZC50ZXh0KHRoaXMucGFkZGluZywgMCxcbiAgICAgICAgICB0aGlzLnNjb3JlLnRvTG9jYWxlU3RyaW5nKCksIHtcbiAgICAgICAgICAgIGZvbnQ6IFwiYm9sZCBcIiArICh0aGlzLmdhbWUud29ybGQuaGVpZ2h0IC8gMzApICsgXCJweCBPbW5lc1JvbWFuXCIsXG4gICAgICAgICAgICBmaWxsOiBcIiMzOWI1NGFcIixcbiAgICAgICAgICAgIGFsaWduOiBcImxlZnRcIixcbiAgICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5zY29yZVRleHQuYW5jaG9yLnNldFRvKDAsIDApO1xuICAgICAgICB0aGlzLnNjb3JlVGV4dC5zZXRTaGFkb3coMSwgMSwgXCJyZ2JhKDAsIDAsIDAsIDAuMylcIiwgMik7XG4gICAgICAgIHRoaXMuc2NvcmVHcm91cC5hZGQodGhpcy5zY29yZVRleHQpO1xuXG4gICAgICAgIHRoaXMuc2NvcmVHcm91cC5maXhlZFRvQ2FtZXJhID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5zY29yZUdyb3VwLmNhbWVyYU9mZnNldC5zZXRUbyh0aGlzLnBhZGRpbmcsIHRoaXMucGFkZGluZyk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgdGhpcy5zY29yZVRleHQudGV4dCA9IHRoaXMuc2NvcmUudG9Mb2NhbGVTdHJpbmcoKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLy8gUmVzZXQgc2NvcmVcbiAgICByZXNldFNjb3JlOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2NvcmVVcCA9IDA7XG4gICAgICB0aGlzLnNjb3JlQ29sbGVjdCA9IDA7XG4gICAgICB0aGlzLnNjb3JlID0gMDtcbiAgICB9LFxuXG4gICAgLy8gUmVzZXQgdmlldyB0cmFja2luZ1xuICAgIHJlc2V0Vmlld1RyYWNraW5nOiBmdW5jdGlvbigpIHtcbiAgICAgIC8vIENhbWVyYSBhbmQgcGxhdGZvcm0gdHJhY2tpbmcgdmFyc1xuICAgICAgdGhpcy5jYW1lcmFZTWluID0gOTk5OTk5OTtcbiAgICAgIHRoaXMucGxhdGZvcm1ZTWluID0gOTk5OTk5OTtcbiAgICB9LFxuXG4gICAgLy8gR2VuZXJhbCB0b3VjaGluZ1xuICAgIGlzVG91Y2hpbmc6IGZ1bmN0aW9uKGJvZHkpIHtcbiAgICAgIGlmIChib2R5ICYmIGJvZHkudG91Y2gpIHtcbiAgICAgICAgcmV0dXJuIChib2R5LnRvdWNoaW5nLnVwIHx8IGJvZHkudG91Y2hpbmcuZG93biB8fFxuICAgICAgICAgIGJvZHkudG91Y2hpbmcubGVmdCB8fCBib2R5LnRvdWNoaW5nLnJpZ2h0KTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0sXG5cbiAgICAvLyBEZXRlcm1pbmUgZGlmZmljdWx0eVxuICAgIHVwZGF0ZURpZmZpY3VsdHk6IGZ1bmN0aW9uKCkge1xuICAgICAgLy8gSW5pdGlhbCBzdGF0ZVxuICAgICAgdGhpcy5wbGF0Zm9ybVNwYWNlWSA9IDExMDtcbiAgICAgIHRoaXMucGxhdGZvcm1HYXBNYXggPSAyMDA7XG4gICAgICB0aGlzLmhvdmVyQ2hhbmNlID0gMC4xO1xuICAgICAgdGhpcy5taW5pQ2hhbmNlID0gMC4zO1xuICAgICAgdGhpcy5kaWxsQ2hhbmNlID0gMC4zO1xuICAgICAgdGhpcy5ib3RDaGFuY2UgPSAwO1xuICAgICAgdGhpcy5wZXBwZXJDaGFuY2UgPSAwLjE7XG4gICAgICB0aGlzLmNhcnJvdENoYW5jZSA9IDAuMTtcblxuICAgICAgLy8gU2V0IGluaXRpYWwgYmFja2dyb3VuZFxuICAgICAgdGhpcy5nYW1lLnN0YWdlLmJhY2tncm91bmRDb2xvciA9IFwiIzkzN0Q2RlwiO1xuXG4gICAgICAvLyBJbml0aWxhIHBoeXNpY3MgdGltZVxuICAgICAgLy90aGlzLmdhbWUudGltZS5zbG93TW90aW9uID0gMTtcblxuICAgICAgLy8gRmlyc3QgbGV2ZWxcbiAgICAgIGlmICghdGhpcy5jYW1lcmFZTWluIHx8IHRoaXMuY2FtZXJhWU1pbiA+IC0yMDAwMCkge1xuICAgICAgICAvLyBEZWZhdWx0XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gU2Vjb25kIGxldmVsXG4gICAgICBlbHNlIGlmICh0aGlzLmNhbWVyYVlNaW4gPiAtNDAwMDApIHtcbiAgICAgICAgdGhpcy5ob3ZlckNoYW5jZSA9IDAuMztcbiAgICAgICAgdGhpcy5taW5pQ2hhbmNlID0gMC4zO1xuICAgICAgICB0aGlzLmRpbGxDaGFuY2UgPSAwLjQ7XG4gICAgICAgIHRoaXMuYm90Q2hhbmNlID0gMC4yO1xuICAgICAgICB0aGlzLmNhcnJvdENoYW5jZSA9IDAuMjtcbiAgICAgICAgdGhpcy5nYW1lLnN0YWdlLmJhY2tncm91bmRDb2xvciA9IFwiI0JEREVCNlwiO1xuICAgICAgfVxuXG4gICAgICAvLyBUaGlyZCBsZXZlbFxuICAgICAgZWxzZSBpZiAodGhpcy5jYW1lcmFZTWluID4gLTYwMDAwKSB7XG4gICAgICAgIHRoaXMuaG92ZXJDaGFuY2UgPSAwLjQ7XG4gICAgICAgIHRoaXMubWluaUNoYW5jZSA9IDAuMjtcbiAgICAgICAgdGhpcy5kaWxsQ2hhbmNlID0gMC40O1xuICAgICAgICB0aGlzLmJvdENoYW5jZSA9IDAuMztcbiAgICAgICAgdGhpcy5jYXJyb3RDaGFuY2UgPSAwLjM7XG4gICAgICAgIHRoaXMuZ2FtZS5zdGFnZS5iYWNrZ3JvdW5kQ29sb3IgPSBcIiNCMUUwRUNcIjtcbiAgICAgIH1cblxuICAgICAgLy8gRm91cnRoIGxldmVsXG4gICAgICBlbHNlIHtcbiAgICAgICAgdGhpcy5iZ0dyb3VwLnZpc2libGUgPSB0cnVlO1xuICAgICAgICB0aGlzLmhvdmVyQ2hhbmNlID0gMC40O1xuICAgICAgICB0aGlzLm1pbmlDaGFuY2UgPSAwLjI7XG4gICAgICAgIHRoaXMuZGlsbENoYW5jZSA9IDAuNDtcbiAgICAgICAgdGhpcy5ib3RDaGFuY2UgPSAwLjM7XG4gICAgICAgIHRoaXMuY2Fycm90Q2hhbmNlID0gMC40O1xuICAgICAgfVxuICAgIH0sXG5cbiAgICAvLyBDcmVhdGUgc3VwZXIgbGV2ZWwgZ3JhZGllbnRcbiAgICBjcmVhdGVTdXBlckxldmVsQkc6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zbGJnQk0gPSB0aGlzLmdhbWUubWFrZS5iaXRtYXBEYXRhKHRoaXMuZ2FtZS53aWR0aCwgdGhpcy5nYW1lLmhlaWdodCk7XG5cbiAgICAgIC8vIENyZWF0ZSBncmFkaWVudFxuICAgICAgdmFyIGdyYWRpZW50ID0gdGhpcy5zbGJnQk0uY29udGV4dC5jcmVhdGVMaW5lYXJHcmFkaWVudChcbiAgICAgICAgMCwgdGhpcy5nYW1lLmhlaWdodCAvIDIsIHRoaXMuZ2FtZS53aWR0aCwgdGhpcy5nYW1lLmhlaWdodCAvIDIpO1xuICAgICAgZ3JhZGllbnQuYWRkQ29sb3JTdG9wKDAsIFwiIzRGM0Y5QVwiKTtcbiAgICAgIGdyYWRpZW50LmFkZENvbG9yU3RvcCgxLCBcIiNFNzBCOERcIik7XG5cbiAgICAgIC8vIEFkZCB0byBiaXRtYXBcbiAgICAgIHRoaXMuc2xiZ0JNLmNvbnRleHQuZmlsbFN0eWxlID0gZ3JhZGllbnQ7XG4gICAgICB0aGlzLnNsYmdCTS5jb250ZXh0LmZpbGxSZWN0KDAsIDAsIHRoaXMuZ2FtZS53aWR0aCwgdGhpcy5nYW1lLmhlaWdodCk7XG5cbiAgICAgIC8vIENyZWF0ZSBiYWNrZ3JvdW5kIGdyb3VwIHNvIHRoYXQgd2UgY2FuIHB1dCB0aGlzIHRoZXJlIGxhdGVyXG4gICAgICB0aGlzLmJnR3JvdXAgPSB0aGlzLmdhbWUuYWRkLmdyb3VwKCk7XG4gICAgICB0aGlzLmJnR3JvdXAuZml4ZWRUb0NhbWVyYSA9IHRydWU7XG5cbiAgICAgIC8vIEFkZCBjcmF6eSBiYWNrZ3JvdW5kIGFuZCB0aGVuIGhpZGUgc2luY2UgYWRkaW5nIGluIG1pZGRsZVxuICAgICAgLy8gcmVhbGx5IG1lc3NlcyB3aXRoIHRoaW5nc1xuICAgICAgdGhpcy5iZ0dyb3VwLmNyZWF0ZSgwLCAwLCB0aGlzLnNsYmdCTSk7XG4gICAgICB0aGlzLmJnR3JvdXAudmlzaWJsZSA9IGZhbHNlO1xuICAgIH0sXG5cbiAgICAvLyBTZXQgb24gZmlyZVxuICAgIHNldE9uRmlyZTogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLm9uRmlyZSA9IHRydWU7XG4gICAgICB0aGlzLmhlcm8uc2V0T25GaXJlKCk7XG4gICAgfSxcblxuICAgIC8vIFNldCBvZmYgZmlyZVxuICAgIHB1dE91dEZpcmU6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5vbkZpcmUgPSBmYWxzZTtcbiAgICAgIHRoaXMuaGVyby5wdXRPdXRGaXJlKCk7XG4gICAgfVxuICB9KTtcblxuICAvLyBFeHBvcnRcbiAgbW9kdWxlLmV4cG9ydHMgPSBQbGF5O1xufSkoKTtcbiJdfQ==
