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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy96em9sby9Db2RlL3BlcnNvbmFsL3BpY2tsZS1qdW1wZXIvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIi9Vc2Vycy96em9sby9Db2RlL3BlcnNvbmFsL3BpY2tsZS1qdW1wZXIvanMvZmFrZV9mMGExZDVkMy5qcyIsIi9Vc2Vycy96em9sby9Db2RlL3BlcnNvbmFsL3BpY2tsZS1qdW1wZXIvanMvcGlja2xlLWp1bXBlci9wcmVmYWItYmVhbi5qcyIsIi9Vc2Vycy96em9sby9Db2RlL3BlcnNvbmFsL3BpY2tsZS1qdW1wZXIvanMvcGlja2xlLWp1bXBlci9wcmVmYWItYm90dWxpc20uanMiLCIvVXNlcnMvenpvbG8vQ29kZS9wZXJzb25hbC9waWNrbGUtanVtcGVyL2pzL3BpY2tsZS1qdW1wZXIvcHJlZmFiLWNhcnJvdC5qcyIsIi9Vc2Vycy96em9sby9Db2RlL3BlcnNvbmFsL3BpY2tsZS1qdW1wZXIvanMvcGlja2xlLWp1bXBlci9wcmVmYWItZGlsbC5qcyIsIi9Vc2Vycy96em9sby9Db2RlL3BlcnNvbmFsL3BpY2tsZS1qdW1wZXIvanMvcGlja2xlLWp1bXBlci9wcmVmYWItaGVyby5qcyIsIi9Vc2Vycy96em9sby9Db2RlL3BlcnNvbmFsL3BpY2tsZS1qdW1wZXIvanMvcGlja2xlLWp1bXBlci9wcmVmYWItamFyLmpzIiwiL1VzZXJzL3p6b2xvL0NvZGUvcGVyc29uYWwvcGlja2xlLWp1bXBlci9qcy9waWNrbGUtanVtcGVyL3ByZWZhYi1taW5pLmpzIiwiL1VzZXJzL3p6b2xvL0NvZGUvcGVyc29uYWwvcGlja2xlLWp1bXBlci9qcy9waWNrbGUtanVtcGVyL3ByZWZhYi1wZXBwZXIuanMiLCIvVXNlcnMvenpvbG8vQ29kZS9wZXJzb25hbC9waWNrbGUtanVtcGVyL2pzL3BpY2tsZS1qdW1wZXIvc3RhdGUtZ2FtZW92ZXIuanMiLCIvVXNlcnMvenpvbG8vQ29kZS9wZXJzb25hbC9waWNrbGUtanVtcGVyL2pzL3BpY2tsZS1qdW1wZXIvc3RhdGUtbWVudS5qcyIsIi9Vc2Vycy96em9sby9Db2RlL3BlcnNvbmFsL3BpY2tsZS1qdW1wZXIvanMvcGlja2xlLWp1bXBlci9zdGF0ZS1wbGF5LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2SkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdFZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qIGdsb2JhbCBfOmZhbHNlLCAkOmZhbHNlLCBQaGFzZXI6ZmFsc2UgKi9cblxuLyoqXG4gKiBNYWluIEpTIGZvciBQaWNrbGUgSnVtcGVyXG4gKi9cblxuKGZ1bmN0aW9uKCkge1xuICBcInVzZSBzdHJpY3RcIjtcblxuICAvLyBEZXBlbmRlbmNpZXNcbiAgdmFyIHN0YXRlcyA9IHtcbiAgICBHYW1lb3ZlcjogcmVxdWlyZShcIi4vcGlja2xlLWp1bXBlci9zdGF0ZS1nYW1lb3Zlci5qc1wiKSxcbiAgICBQbGF5OiByZXF1aXJlKFwiLi9waWNrbGUtanVtcGVyL3N0YXRlLXBsYXkuanNcIiksXG4gICAgTWVudTogcmVxdWlyZShcIi4vcGlja2xlLWp1bXBlci9zdGF0ZS1tZW51LmpzXCIpLFxuICB9O1xuXG4gIC8vIENvbnN0cnVjdG9yZSBmb3IgUGlja2xlXG4gIHZhciBQaWNrbGUgPSB3aW5kb3cuUGlja2xlID0gZnVuY3Rpb24ob3B0aW9ucykge1xuICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG4gICAgdGhpcy5lbCA9IHRoaXMub3B0aW9ucy5lbDtcbiAgICB0aGlzLiRlbCA9ICQodGhpcy5vcHRpb25zLmVsKTtcbiAgICB0aGlzLiQgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiAkKG9wdGlvbnMuZWwpLmZpbmQ7XG4gICAgfTtcblxuICAgIHRoaXMud2lkdGggPSB0aGlzLiRlbC53aWR0aCgpO1xuICAgIHRoaXMuaGVpZ2h0ID0gJCh3aW5kb3cpLmhlaWdodCgpO1xuXG4gICAgLy8gU3RhcnRcbiAgICB0aGlzLnN0YXJ0KCk7XG4gIH07XG5cbiAgLy8gQWRkIHByb3BlcnRpZXNcbiAgXy5leHRlbmQoUGlja2xlLnByb3RvdHlwZSwge1xuICAgIC8vIFN0YXJ0IGV2ZXJ5dGhpbmdcbiAgICBzdGFydDogZnVuY3Rpb24oKSB7XG4gICAgICAvLyBDcmVhdGUgUGhhc2VyIGdhbWVcbiAgICAgIHRoaXMuZ2FtZSA9IG5ldyBQaGFzZXIuR2FtZShcbiAgICAgICAgdGhpcy53aWR0aCxcbiAgICAgICAgdGhpcy5oZWlnaHQsXG4gICAgICAgIFBoYXNlci5BVVRPLFxuICAgICAgICB0aGlzLmVsLnJlcGxhY2UoXCIjXCIsIFwiXCIpKTtcblxuICAgICAgLy8gQWRkIHJlZmVyZW5jZSB0byBnYW1lLCBzaW5jZSBtb3N0IHBhcnRzIGhhdmUgdGhpcyByZWZlcmVuY2VcbiAgICAgIC8vIGFscmVhZHlcbiAgICAgIHRoaXMuZ2FtZS5waWNrbGUgPSB0aGlzO1xuXG4gICAgICAvLyBSZWdpc3RlciBzdGF0ZXNcbiAgICAgIHRoaXMuZ2FtZS5zdGF0ZS5hZGQoXCJtZW51XCIsIHN0YXRlcy5NZW51KTtcbiAgICAgIHRoaXMuZ2FtZS5zdGF0ZS5hZGQoXCJwbGF5XCIsIHN0YXRlcy5QbGF5KTtcbiAgICAgIHRoaXMuZ2FtZS5zdGF0ZS5hZGQoXCJnYW1lb3ZlclwiLCBzdGF0ZXMuR2FtZW92ZXIpO1xuXG4gICAgICAvLyBIaWdoc2NvcmVcbiAgICAgIHRoaXMuaGlnaHNjb3JlTGltaXQgPSAxMDtcbiAgICAgIHRoaXMuZ2V0SGlnaHNjb3JlcygpO1xuXG4gICAgICAvLyBTdGFydCB3aXRoIG1lbnVcbiAgICAgIHRoaXMuZ2FtZS5zdGF0ZS5zdGFydChcIm1lbnVcIik7XG5cbiAgICAgIC8vIERlYnVnXG4gICAgICBpZiAodGhpcy5vcHRpb25zLmRlYnVnKSB7XG4gICAgICAgIHRoaXMucmVzZXRIaWdoc2NvcmVzKCk7XG4gICAgICAgIHRoaXMuZ2V0SGlnaHNjb3JlcygpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICAvLyBIaWRlIG92ZXJsYXkgcGFydHNcbiAgICBoaWRlT3ZlcmxheTogZnVuY3Rpb24oc2VsZWN0b3IpIHtcbiAgICAgICQodGhpcy5vcHRpb25zLnBhcmVudEVsKS5maW5kKHNlbGVjdG9yKS5oaWRlKCk7XG4gICAgfSxcblxuICAgIC8vIFNob3cgb3ZlcmxheSBwYXJ0c1xuICAgIHNob3dPdmVybGF5OiBmdW5jdGlvbihzZWxlY3Rvcikge1xuICAgICAgJCh0aGlzLm9wdGlvbnMucGFyZW50RWwpLmZpbmQoc2VsZWN0b3IpLnNob3coKTtcbiAgICB9LFxuXG4gICAgLy8gR2V0IGhpZ2ggc2NvcmVzXG4gICAgZ2V0SGlnaHNjb3JlczogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgcyA9IHdpbmRvdy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbShcImhpZ2hzY29yZXNcIik7XG4gICAgICBzID0gKHMpID8gSlNPTi5wYXJzZShzKSA6IFtdO1xuICAgICAgdGhpcy5oaWdoc2NvcmVzID0gcztcbiAgICAgIHRoaXMuc29ydEhpZ2hzY29yZXMoKTtcbiAgICAgIHJldHVybiB0aGlzLmhpZ2hzY29yZXM7XG4gICAgfSxcblxuICAgIC8vIEdldCBoaWdoZXN0IHNjb3JlXG4gICAgZ2V0SGlnaHNjb3JlOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBfLm1heCh0aGlzLmhpZ2hzY29yZXMsIFwic2NvcmVcIik7XG4gICAgfSxcblxuICAgIC8vIFNldCBzaW5nbGUgaGlnaHNjb3JlXG4gICAgc2V0SGlnaHNjb3JlOiBmdW5jdGlvbihzY29yZSwgbmFtZSkge1xuICAgICAgaWYgKHRoaXMuaXNIaWdoc2NvcmUoc2NvcmUpKSB7XG4gICAgICAgIHRoaXMuc29ydEhpZ2hzY29yZXMoKTtcblxuICAgICAgICAvLyBSZW1vdmUgbG93ZXN0IG9uZSBpZiBuZWVkZWRcbiAgICAgICAgaWYgKHRoaXMuaGlnaHNjb3Jlcy5sZW5ndGggPj0gdGhpcy5oaWdoc2NvcmVMaW1pdCkge1xuICAgICAgICAgIHRoaXMuaGlnaHNjb3Jlcy5zaGlmdCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQWRkIG5ldyBzY29yZVxuICAgICAgICB0aGlzLmhpZ2hzY29yZXMucHVzaCh7XG4gICAgICAgICAgbmFtZTogbmFtZSxcbiAgICAgICAgICBzY29yZTogc2NvcmVcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gU29ydCBhbmQgc2V0XG4gICAgICAgIHRoaXMuc29ydEhpZ2hzY29yZXMoKTtcbiAgICAgICAgdGhpcy5zZXRIaWdoc2NvcmVzKCk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIC8vIFNvcnQgaGlnaHNjb3Jlc1xuICAgIHNvcnRIaWdoc2NvcmVzOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuaGlnaHNjb3JlcyA9IF8uc29ydEJ5KHRoaXMuaGlnaHNjb3JlcywgXCJzY29yZVwiKTtcbiAgICB9LFxuXG4gICAgLy8gSXMgaGlnaHNjb3JlLiAgSXMgdGhlIHNjb3JlIGhpZ2hlciB0aGFuIHRoZSBsb3dlc3RcbiAgICAvLyByZWNvcmRlZCBzY29yZVxuICAgIGlzSGlnaHNjb3JlOiBmdW5jdGlvbihzY29yZSkge1xuICAgICAgdmFyIG1pbiA9IF8ubWluKHRoaXMuaGlnaHNjb3JlcywgXCJzY29yZVwiKS5zY29yZTtcbiAgICAgIHJldHVybiAoc2NvcmUgPiBtaW4gfHwgdGhpcy5oaWdoc2NvcmVzLmxlbmd0aCA8IHRoaXMuaGlnaHNjb3JlTGltaXQpO1xuICAgIH0sXG5cbiAgICAvLyBDaGVjayBpZiBzY29yZSBpcyBoaWdoZXN0IHNjb3JlXG4gICAgaXNIaWdoZXN0U2NvcmU6IGZ1bmN0aW9uKHNjb3JlKSB7XG4gICAgICB2YXIgbWF4ID0gXy5tYXgodGhpcy5oaWdoc2NvcmVzLCBcInNjb3JlXCIpLnNjb3JlIHx8IDA7XG4gICAgICByZXR1cm4gKHNjb3JlID4gbWF4KTtcbiAgICB9LFxuXG4gICAgLy8gU2V0IGhpZ2hzY29yZXNcbiAgICBzZXRIaWdoc2NvcmVzOiBmdW5jdGlvbigpIHtcbiAgICAgIHdpbmRvdy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbShcImhpZ2hzY29yZXNcIiwgSlNPTi5zdHJpbmdpZnkodGhpcy5oaWdoc2NvcmVzKSk7XG4gICAgfSxcblxuICAgIC8vIFJlc2V0IGhpZ2hzY2hvcmVzXG4gICAgcmVzZXRIaWdoc2NvcmVzOiBmdW5jdGlvbigpIHtcbiAgICAgIHdpbmRvdy5sb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbShcImhpZ2hzY29yZXNcIik7XG4gICAgfVxuICB9KTtcblxuICAvLyBDcmVhdGUgYXBwXG4gICQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCkge1xuICAgIHZhciBwO1xuICAgIHAgPSBuZXcgUGlja2xlKHtcbiAgICAgIGVsOiBcIiNwaWNrbGUtanVtcGVyXCIsXG4gICAgICBwYXJlbnRFbDogXCIuZ2FtZS13cmFwcGVyXCIsXG4gICAgICBkZWJ1ZzogZmFsc2VcbiAgICB9KTtcbiAgfSk7XG59KSgpO1xuIiwiLyogZ2xvYmFsIF86ZmFsc2UsIFBoYXNlcjpmYWxzZSAqL1xuXG4vKipcbiAqIFByZWZhYiBiZWFuIHBsYXRmb3JtXG4gKi9cblxuKGZ1bmN0aW9uKCkge1xuICBcInVzZSBzdHJpY3RcIjtcblxuICAvLyBDb25zdHJ1Y3RvclxuICB2YXIgQmVhbiA9IGZ1bmN0aW9uKGdhbWUsIHgsIHkpIHtcbiAgICAvLyBDYWxsIGRlZmF1bHQgc3ByaXRlXG4gICAgUGhhc2VyLlNwcml0ZS5jYWxsKHRoaXMsIGdhbWUsIHgsIHksIFwiZ2FtZS1zcHJpdGVzXCIsIFwiZGlsbHliZWFuLnBuZ1wiKTtcblxuICAgIC8vIENvbmZpZ3VyZVxuICAgIHRoaXMuYW5jaG9yLnNldFRvKDAuNSwgMC41KTtcbiAgICB0aGlzLnNjYWxlLnNldFRvKCh0aGlzLmdhbWUud2lkdGggLyA1KSAvIHRoaXMud2lkdGgpO1xuICAgIHRoaXMuaG92ZXIgPSBmYWxzZTtcbiAgICB0aGlzLnNldEhvdmVyU3BlZWQoMTAwKTtcblxuICAgIC8vIFBoeXNpY3NcbiAgICB0aGlzLmdhbWUucGh5c2ljcy5hcmNhZGUuZW5hYmxlQm9keSh0aGlzKTtcbiAgICB0aGlzLmJvZHkuYWxsb3dHcmF2aXR5ID0gZmFsc2U7XG4gICAgdGhpcy5ib2R5LmltbW92YWJsZSA9IHRydWU7XG5cbiAgICAvLyBPbmx5IGFsbG93IGZvciBjb2xsaXNzaW9uIHVwXG4gICAgdGhpcy5ib2R5LmNoZWNrQ29sbGlzaW9uLnVwID0gdHJ1ZTtcbiAgICB0aGlzLmJvZHkuY2hlY2tDb2xsaXNpb24uZG93biA9IGZhbHNlO1xuICAgIHRoaXMuYm9keS5jaGVja0NvbGxpc2lvbi5sZWZ0ID0gZmFsc2U7XG4gICAgdGhpcy5ib2R5LmNoZWNrQ29sbGlzaW9uLnJpZ2h0ID0gZmFsc2U7XG5cbiAgICAvLyBEZXRlcm1pbmUgYW5jaG9yIHggYm91bmRzXG4gICAgdGhpcy5wYWRkaW5nWCA9IDEwO1xuICAgIHRoaXMuZ2V0QW5jaG9yQm91bmRzWCgpO1xuICB9O1xuXG4gIC8vIEV4dGVuZCBmcm9tIFNwcml0ZVxuICBCZWFuLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUGhhc2VyLlNwcml0ZS5wcm90b3R5cGUpO1xuICBCZWFuLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEJlYW47XG5cbiAgLy8gQWRkIG1ldGhvZHNcbiAgXy5leHRlbmQoQmVhbi5wcm90b3R5cGUsIHtcbiAgICB1cGRhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKHRoaXMuaG92ZXIpIHtcbiAgICAgICAgdGhpcy5ib2R5LnZlbG9jaXR5LnggPSB0aGlzLmJvZHkudmVsb2NpdHkueCB8fCB0aGlzLmhvdmVyU3BlZWQ7XG4gICAgICAgIHRoaXMuYm9keS52ZWxvY2l0eS54ID0gKHRoaXMueCA8PSB0aGlzLm1pblgpID8gdGhpcy5ob3ZlclNwZWVkIDpcbiAgICAgICAgICAodGhpcy54ID49IHRoaXMubWF4WCkgPyAtdGhpcy5ob3ZlclNwZWVkIDogdGhpcy5ib2R5LnZlbG9jaXR5Lng7XG4gICAgICB9XG4gICAgfSxcblxuICAgIC8vIFNldCBob3ZlciBzcGVlZC4gIEFkZCBhIGJpdCBvZiB2YXJpYW5jZVxuICAgIHNldEhvdmVyU3BlZWQ6IGZ1bmN0aW9uKHNwZWVkKSB7XG4gICAgICB0aGlzLmhvdmVyU3BlZWQgPSBzcGVlZCArIHRoaXMuZ2FtZS5ybmQuaW50ZWdlckluUmFuZ2UoLTUwLCA1MCk7XG4gICAgfSxcblxuICAgIC8vIEdldCBhbmNob3IgYm91bmRzXG4gICAgZ2V0QW5jaG9yQm91bmRzWDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLm1pblggPSB0aGlzLnBhZGRpbmdYICsgKHRoaXMud2lkdGggLyAyKTtcbiAgICAgIHRoaXMubWF4WCA9IHRoaXMuZ2FtZS53aWR0aCAtICh0aGlzLnBhZGRpbmdYICsgKHRoaXMud2lkdGggLyAyKSk7XG4gICAgICByZXR1cm4gW3RoaXMubWluWCwgdGhpcy5tYXhYXTtcbiAgICB9LFxuXG4gICAgLy8gUmVzZXQgdGhpbmdzXG4gICAgcmVzZXRTZXR0aW5nczogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnJlc2V0KDAsIDApO1xuICAgICAgdGhpcy5ib2R5LnZlbG9jaXR5LnggPSAwO1xuICAgICAgdGhpcy5ob3ZlciA9IGZhbHNlO1xuICAgICAgdGhpcy5nZXRBbmNob3JCb3VuZHNYKCk7XG4gICAgfVxuICB9KTtcblxuICAvLyBFeHBvcnRcbiAgbW9kdWxlLmV4cG9ydHMgPSBCZWFuO1xufSkoKTtcbiIsIi8qIGdsb2JhbCBfOmZhbHNlLCBQaGFzZXI6ZmFsc2UgKi9cblxuLyoqXG4gKiBQcmVmYWIgZm9yIEJvdHVsaXNtLCB0aGUgYmFkIGR1ZGVzXG4gKi9cblxuKGZ1bmN0aW9uKCkge1xuICBcInVzZSBzdHJpY3RcIjtcblxuICAvLyBDb25zdHJ1Y3RvclxuICB2YXIgQm90dWxpc20gPSBmdW5jdGlvbihnYW1lLCB4LCB5KSB7XG4gICAgLy8gQ2FsbCBkZWZhdWx0IHNwcml0ZVxuICAgIFBoYXNlci5TcHJpdGUuY2FsbCh0aGlzLCBnYW1lLCB4LCB5LCBcImdhbWUtc3ByaXRlc1wiLCBcImJvdGNoeS5wbmdcIik7XG5cbiAgICAvLyBTaXplXG4gICAgdGhpcy5hbmNob3Iuc2V0VG8oMC41LCAwLjUpO1xuICAgIHRoaXMuc2NhbGUuc2V0VG8oKHRoaXMuZ2FtZS53aWR0aCAvIDEwKSAvIHRoaXMud2lkdGgpO1xuXG4gICAgLy8gQ29uZmlndXJlXG4gICAgdGhpcy5ob3ZlciA9IHRydWU7XG4gICAgdGhpcy5zZXRIb3ZlclNwZWVkKDEwMCk7XG4gICAgdGhpcy5ob3ZlclJhbmdlID0gMTAwO1xuXG4gICAgLy8gUGh5c2ljc1xuICAgIHRoaXMuZ2FtZS5waHlzaWNzLmFyY2FkZS5lbmFibGVCb2R5KHRoaXMpO1xuICAgIHRoaXMuYm9keS5hbGxvd0dyYXZpdHkgPSBmYWxzZTtcbiAgICB0aGlzLmJvZHkuaW1tb3ZhYmxlID0gdHJ1ZTtcblxuICAgIC8vIERldGVybWluZSBhbmNob3IgeCBib3VuZHNcbiAgICB0aGlzLnBhZGRpbmdYID0gMTA7XG4gICAgdGhpcy5yZXNldFBsYWNlbWVudCh4LCB5KTtcbiAgfTtcblxuICAvLyBFeHRlbmQgZnJvbSBTcHJpdGVcbiAgQm90dWxpc20ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQaGFzZXIuU3ByaXRlLnByb3RvdHlwZSk7XG4gIEJvdHVsaXNtLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEJvdHVsaXNtO1xuXG4gIC8vIEFkZCBtZXRob2RzXG4gIF8uZXh0ZW5kKEJvdHVsaXNtLnByb3RvdHlwZSwge1xuICAgIHVwZGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAvLyBEbyBob3ZlclxuICAgICAgaWYgKHRoaXMuaG92ZXIpIHtcbiAgICAgICAgdGhpcy5ib2R5LnZlbG9jaXR5LnggPSB0aGlzLmJvZHkudmVsb2NpdHkueCB8fCB0aGlzLmhvdmVyU3BlZWQ7XG4gICAgICAgIHRoaXMuYm9keS52ZWxvY2l0eS54ID0gKHRoaXMueCA8PSB0aGlzLm1pblgpID8gdGhpcy5ob3ZlclNwZWVkIDpcbiAgICAgICAgICAodGhpcy54ID49IHRoaXMubWF4WCkgPyAtdGhpcy5ob3ZlclNwZWVkIDogdGhpcy5ib2R5LnZlbG9jaXR5Lng7XG4gICAgICB9XG4gICAgfSxcblxuICAgIC8vIFNldCBob3ZlciBzcGVlZC4gIEFkZCBhIGJpdCBvZiB2YXJpYW5jZVxuICAgIHNldEhvdmVyU3BlZWQ6IGZ1bmN0aW9uKHNwZWVkKSB7XG4gICAgICB0aGlzLmhvdmVyU3BlZWQgPSBzcGVlZCArIHRoaXMuZ2FtZS5ybmQuaW50ZWdlckluUmFuZ2UoLTI1LCAyNSk7XG4gICAgfSxcblxuICAgIC8vIEdldCBhbmNob3IgYm91bmRzLiAgVGhpcyBpcyByZWxhdGl2ZSB0byB3aGVyZSB0aGUgcGxhdGZvcm0gaXNcbiAgICBnZXRBbmNob3JCb3VuZHNYOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMubWluWCA9IE1hdGgubWF4KHRoaXMueCAtIHRoaXMuaG92ZXJSYW5nZSwgdGhpcy5wYWRkaW5nWCArICh0aGlzLndpZHRoIC8gMikpO1xuICAgICAgdGhpcy5tYXhYID0gTWF0aC5taW4odGhpcy54ICsgdGhpcy5ob3ZlclJhbmdlLCB0aGlzLmdhbWUud2lkdGggLSAodGhpcy5wYWRkaW5nWCArICh0aGlzLndpZHRoIC8gMikpKTtcbiAgICAgIHJldHVybiBbdGhpcy5taW5YLCB0aGlzLm1heFhdO1xuICAgIH0sXG5cbiAgICAvLyBSZXNldCB0aGluZ3NcbiAgICByZXNldFBsYWNlbWVudDogZnVuY3Rpb24oeCwgeSkge1xuICAgICAgdGhpcy5yZXNldCh4LCB5KTtcbiAgICAgIHRoaXMuYm9keS52ZWxvY2l0eS54ID0gMDtcbiAgICAgIHRoaXMuZ2V0QW5jaG9yQm91bmRzWCgpO1xuICAgIH0sXG5cbiAgICAvLyBSZXNldCBpbWFnZVxuICAgIHJlc2V0SW1hZ2U6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5oZWlnaHQgPSB0aGlzLm9yaWdpbmFsSGVpZ2h0O1xuICAgICAgdGhpcy53aWR0aCA9IHRoaXMub3JpZ2luYWxXaWR0aDtcbiAgICAgIHRoaXMuYWxwaGEgPSAxO1xuICAgIH0sXG5cbiAgICAvLyBNdXJkZXJlZCAobm90IGp1c3Qga2lsbClcbiAgICBtdXJkZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgLy8gR2V0IG9yaWdpbmFsIGhlaWdodFxuICAgICAgdGhpcy5vcmlnaW5hbEhlaWdodCA9IHRoaXMuaGVpZ2h0O1xuICAgICAgdGhpcy5vcmlnaW5hbFdpZHRoID0gdGhpcy53aWR0aDtcblxuICAgICAgdmFyIHR3ZWVuID0gdGhpcy5nYW1lLmFkZC50d2Vlbih0aGlzKS50byh7XG4gICAgICAgIGhlaWdodDogMCxcbiAgICAgICAgd2lkdGg6IDAsXG4gICAgICAgIGFscGhhOiAwXG4gICAgICB9LCAyMDAsIFBoYXNlci5FYXNpbmcuTGluZWFyLk5vbmUsIHRydWUpO1xuXG4gICAgICB0d2Vlbi5vbkNvbXBsZXRlLmFkZChfLmJpbmQoZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMucmVzZXRJbWFnZSgpO1xuICAgICAgICB0aGlzLmtpbGwoKTtcbiAgICAgIH0sIHRoaXMpKTtcbiAgICB9XG4gIH0pO1xuXG4gIC8vIEV4cG9ydFxuICBtb2R1bGUuZXhwb3J0cyA9IEJvdHVsaXNtO1xufSkoKTtcbiIsIi8qIGdsb2JhbCBfOmZhbHNlLCBQaGFzZXI6ZmFsc2UgKi9cblxuLyoqXG4gKiBQcmVmYWIgcGxhdGZvcm1cbiAqL1xuXG4oZnVuY3Rpb24oKSB7XG4gIFwidXNlIHN0cmljdFwiO1xuXG4gIC8vIENvbnN0cnVjdG9yXG4gIHZhciBDYXJyb3QgPSBmdW5jdGlvbihnYW1lLCB4LCB5KSB7XG4gICAgLy8gQ2FsbCBkZWZhdWx0IHNwcml0ZVxuICAgIFBoYXNlci5TcHJpdGUuY2FsbCh0aGlzLCBnYW1lLCB4LCB5LCBcImNhcnJvdC1zcHJpdGVzXCIsIFwiY2Fycm90LXNuYXAtMDEucG5nXCIpO1xuXG4gICAgLy8gQ29uZmlndXJlXG4gICAgdGhpcy5hbmNob3Iuc2V0VG8oMC41LCAwLjUpO1xuICAgIHRoaXMuc2NhbGUuc2V0VG8oKHRoaXMuZ2FtZS53aWR0aCAvIDUpIC8gdGhpcy53aWR0aCk7XG4gICAgdGhpcy5ob3ZlciA9IGZhbHNlO1xuICAgIHRoaXMuc2V0SG92ZXJTcGVlZCgxMDApO1xuXG4gICAgLy8gUGh5c2ljc1xuICAgIHRoaXMuZ2FtZS5waHlzaWNzLmFyY2FkZS5lbmFibGVCb2R5KHRoaXMpO1xuICAgIHRoaXMuYm9keS5hbGxvd0dyYXZpdHkgPSBmYWxzZTtcbiAgICB0aGlzLmJvZHkuaW1tb3ZhYmxlID0gdHJ1ZTtcblxuICAgIC8vIE9ubHkgYWxsb3cgZm9yIGNvbGxpc3Npb24gdXBcbiAgICB0aGlzLmJvZHkuY2hlY2tDb2xsaXNpb24udXAgPSB0cnVlO1xuICAgIHRoaXMuYm9keS5jaGVja0NvbGxpc2lvbi5kb3duID0gZmFsc2U7XG4gICAgdGhpcy5ib2R5LmNoZWNrQ29sbGlzaW9uLmxlZnQgPSBmYWxzZTtcbiAgICB0aGlzLmJvZHkuY2hlY2tDb2xsaXNpb24ucmlnaHQgPSBmYWxzZTtcblxuICAgIC8vIERldGVybWluZSBhbmNob3IgeCBib3VuZHNcbiAgICB0aGlzLnBhZGRpbmdYID0gMTA7XG4gICAgdGhpcy5nZXRBbmNob3JCb3VuZHNYKCk7XG5cbiAgICAvLyBTZXR1cCBhbmltYXRpb25zXG4gICAgdmFyIHNuYXBGcmFtZXMgPSBQaGFzZXIuQW5pbWF0aW9uLmdlbmVyYXRlRnJhbWVOYW1lcyhcImNhcnJvdC1zbmFwLVwiLCAxLCA1LCBcIi5wbmdcIiwgMik7XG4gICAgdGhpcy5zbmFwQW5pbWF0aW9uID0gdGhpcy5hbmltYXRpb25zLmFkZChcInNuYXBcIiwgc25hcEZyYW1lcyk7XG4gICAgdGhpcy5zbmFwQW5pbWF0aW9uLm9uQ29tcGxldGUuYWRkKHRoaXMuc25hcHBlZCwgdGhpcyk7XG4gIH07XG5cbiAgLy8gRXh0ZW5kIGZyb20gU3ByaXRlXG4gIENhcnJvdC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFBoYXNlci5TcHJpdGUucHJvdG90eXBlKTtcbiAgQ2Fycm90LnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IENhcnJvdDtcblxuICAvLyBBZGQgbWV0aG9kc1xuICBfLmV4dGVuZChDYXJyb3QucHJvdG90eXBlLCB7XG4gICAgdXBkYXRlOiBmdW5jdGlvbigpIHtcbiAgICAgIGlmICh0aGlzLmhvdmVyKSB7XG4gICAgICAgIHRoaXMuYm9keS52ZWxvY2l0eS54ID0gdGhpcy5ib2R5LnZlbG9jaXR5LnggfHwgdGhpcy5ob3ZlclNwZWVkO1xuICAgICAgICB0aGlzLmJvZHkudmVsb2NpdHkueCA9ICh0aGlzLnggPD0gdGhpcy5taW5YKSA/IHRoaXMuaG92ZXJTcGVlZCA6XG4gICAgICAgICAgKHRoaXMueCA+PSB0aGlzLm1heFgpID8gLXRoaXMuaG92ZXJTcGVlZCA6IHRoaXMuYm9keS52ZWxvY2l0eS54O1xuICAgICAgfVxuICAgIH0sXG5cbiAgICAvLyBTZXQgaG92ZXIgc3BlZWQuICBBZGQgYSBiaXQgb2YgdmFyaWFuY2VcbiAgICBzZXRIb3ZlclNwZWVkOiBmdW5jdGlvbihzcGVlZCkge1xuICAgICAgdGhpcy5ob3ZlclNwZWVkID0gc3BlZWQgKyB0aGlzLmdhbWUucm5kLmludGVnZXJJblJhbmdlKC01MCwgNTApO1xuICAgIH0sXG5cbiAgICAvLyBHZXQgYW5jaG9yIGJvdW5kc1xuICAgIGdldEFuY2hvckJvdW5kc1g6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5taW5YID0gdGhpcy5wYWRkaW5nWCArICh0aGlzLndpZHRoIC8gMik7XG4gICAgICB0aGlzLm1heFggPSB0aGlzLmdhbWUud2lkdGggLSAodGhpcy5wYWRkaW5nWCArICh0aGlzLndpZHRoIC8gMikpO1xuICAgICAgcmV0dXJuIFt0aGlzLm1pblgsIHRoaXMubWF4WF07XG4gICAgfSxcblxuICAgIC8vIFJlc2V0IHRoaW5nc1xuICAgIHJlc2V0U2V0dGluZ3M6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5yZXNldEltYWdlKCk7XG4gICAgICB0aGlzLnJlc2V0KDAsIDApO1xuICAgICAgdGhpcy5ib2R5LnZlbG9jaXR5LnggPSAwO1xuICAgICAgdGhpcy5ob3ZlciA9IGZhbHNlO1xuICAgICAgdGhpcy5nZXRBbmNob3JCb3VuZHNYKCk7XG4gICAgfSxcblxuICAgIC8vIFJlc2V0IGltYWdlXG4gICAgcmVzZXRJbWFnZTogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLmFscGhhID0gMTtcbiAgICAgIHRoaXMubG9hZFRleHR1cmUoXCJjYXJyb3Qtc3ByaXRlc1wiLCBcImNhcnJvdC1zbmFwLTAxLnBuZ1wiKTtcbiAgICB9LFxuXG4gICAgLy8gU25hcCBjYXJyb3RcbiAgICBzbmFwOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuYW5pbWF0aW9ucy5wbGF5KFwic25hcFwiLCAxNSwgZmFsc2UsIGZhbHNlKTtcbiAgICB9LFxuXG4gICAgLy8gU25hcHBlZFxuICAgIHNuYXBwZWQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHR3ZWVuID0gdGhpcy5nYW1lLmFkZC50d2Vlbih0aGlzKS50byh7XG4gICAgICAgIGFscGhhOiAwXG4gICAgICB9LCAyMDAsIFBoYXNlci5FYXNpbmcuTGluZWFyLk5vbmUsIHRydWUpO1xuICAgICAgdHdlZW4ub25Db21wbGV0ZS5hZGQoXy5iaW5kKGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLnJlc2V0SW1hZ2UoKTtcbiAgICAgICAgdGhpcy5raWxsKCk7XG4gICAgICB9LCB0aGlzKSk7XG4gICAgfVxuICB9KTtcblxuICAvLyBFeHBvcnRcbiAgbW9kdWxlLmV4cG9ydHMgPSBDYXJyb3Q7XG59KSgpO1xuIiwiLyogZ2xvYmFsIF86ZmFsc2UsIFBoYXNlcjpmYWxzZSAqL1xuXG4vKipcbiAqIFByZWZhYiAob2JqZWN0cykgRGlsbCBmb3IgYm9vc3RpbmdcbiAqL1xuXG4oZnVuY3Rpb24oKSB7XG4gIFwidXNlIHN0cmljdFwiO1xuXG4gIC8vIENvbnN0cnVjdG9yXG4gIHZhciBEaWxsID0gZnVuY3Rpb24oZ2FtZSwgeCwgeSkge1xuICAgIC8vIENhbGwgZGVmYXVsdCBzcHJpdGVcbiAgICBQaGFzZXIuU3ByaXRlLmNhbGwodGhpcywgZ2FtZSwgeCwgeSwgXCJnYW1lLXNwcml0ZXNcIiwgXCJkaWxsLnBuZ1wiKTtcblxuICAgIC8vIFNpemVcbiAgICB0aGlzLmFuY2hvci5zZXRUbygwLjUsIDAuNSk7XG4gICAgdGhpcy5zY2FsZS5zZXRUbygodGhpcy5nYW1lLndpZHRoIC8gOSkgLyB0aGlzLndpZHRoKTtcblxuICAgIC8vIFBoeXNpY3NcbiAgICB0aGlzLmdhbWUucGh5c2ljcy5hcmNhZGUuZW5hYmxlQm9keSh0aGlzKTtcbiAgICB0aGlzLmJvZHkuYWxsb3dHcmF2aXR5ID0gZmFsc2U7XG4gICAgdGhpcy5ib2R5LmltbW92YWJsZSA9IHRydWU7XG4gIH07XG5cbiAgLy8gRXh0ZW5kIGZyb20gU3ByaXRlXG4gIERpbGwucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQaGFzZXIuU3ByaXRlLnByb3RvdHlwZSk7XG4gIERpbGwucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gRGlsbDtcblxuICAvLyBBZGQgbWV0aG9kc1xuICBfLmV4dGVuZChEaWxsLnByb3RvdHlwZSwge1xuICAgIHVwZGF0ZTogZnVuY3Rpb24oKSB7XG5cbiAgICB9XG4gIH0pO1xuXG4gIC8vIEV4cG9ydFxuICBtb2R1bGUuZXhwb3J0cyA9IERpbGw7XG59KSgpO1xuIiwiLyogZ2xvYmFsIF86ZmFsc2UsIFBoYXNlcjpmYWxzZSAqL1xuXG4vKipcbiAqIFByZWZhYiBIZXJvL2NoYXJhY3RlclxuICovXG5cbihmdW5jdGlvbigpIHtcbiAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgLy8gQ29uc3RydWN0b3JcbiAgdmFyIEhlcm8gPSBmdW5jdGlvbihnYW1lLCB4LCB5KSB7XG4gICAgLy8gQ2FsbCBkZWZhdWx0IHNwcml0ZVxuICAgIFBoYXNlci5TcHJpdGUuY2FsbCh0aGlzLCBnYW1lLCB4LCB5LCBcInBpY2tsZS1zcHJpdGVzXCIsIFwicGlja2xlLWp1bXAtMDIucG5nXCIpO1xuXG4gICAgLy8gQ29uZmlndXJlXG4gICAgdGhpcy5hbmNob3Iuc2V0VG8oMC41KTtcbiAgICB0aGlzLm9yaWdpbmFsU2NhbGUgPSAodGhpcy5nYW1lLndpZHRoIC8gMjIpIC8gdGhpcy53aWR0aDtcbiAgICB0aGlzLnNjYWxlLnNldFRvKHRoaXMub3JpZ2luYWxTY2FsZSk7XG4gICAgdGhpcy5nYW1lLnBoeXNpY3MuYXJjYWRlLmVuYWJsZUJvZHkodGhpcyk7XG4gICAgdGhpcy5pc0RlYWQgPSBmYWxzZTtcblxuICAgIC8vIFRyYWNrIHdoZXJlIHRoZSBoZXJvIHN0YXJ0ZWQgYW5kIGhvdyBtdWNoIHRoZSBkaXN0YW5jZVxuICAgIC8vIGhhcyBjaGFuZ2VkIGZyb20gdGhhdCBwb2ludFxuICAgIHRoaXMueU9yaWcgPSB0aGlzLnk7XG4gICAgdGhpcy55Q2hhbmdlID0gMDtcblxuICAgIC8vIEFuaW1hdGlvbnNcbiAgICB2YXIgdXBGcmFtZXMgPSBQaGFzZXIuQW5pbWF0aW9uLmdlbmVyYXRlRnJhbWVOYW1lcyhcInBpY2tsZS1qdW1wLVwiLCAxLCA0LCBcIi5wbmdcIiwgMik7XG4gICAgdmFyIGRvd25GcmFtZXMgPSBQaGFzZXIuQW5pbWF0aW9uLmdlbmVyYXRlRnJhbWVOYW1lcyhcInBpY2tsZS1qdW1wLVwiLCA0LCAxLCBcIi5wbmdcIiwgMik7XG4gICAgdGhpcy5qdW1wVXAgPSB0aGlzLmFuaW1hdGlvbnMuYWRkKFwianVtcC11cFwiLCB1cEZyYW1lcyk7XG4gICAgdGhpcy5KdW1wRG93biA9IHRoaXMuYW5pbWF0aW9ucy5hZGQoXCJqdW1wLWRvd25cIiwgZG93bkZyYW1lcyk7XG4gICAgdGhpcy5qdW1wID0gdGhpcy5hbmltYXRpb25zLmFkZChcImp1bXBcIiwgdXBGcmFtZXMuY29uY2F0KGRvd25GcmFtZXMpKTtcbiAgfTtcblxuICAvLyBFeHRlbmQgZnJvbSBTcHJpdGVcbiAgSGVyby5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFBoYXNlci5TcHJpdGUucHJvdG90eXBlKTtcbiAgSGVyby5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBIZXJvO1xuXG4gIC8vIEFkZCBtZXRob2RzXG4gIF8uZXh0ZW5kKEhlcm8ucHJvdG90eXBlLCB7XG4gICAgdXBkYXRlOiBmdW5jdGlvbigpIHtcbiAgICAgIC8vIFRyYWNrIHRoZSBtYXhpbXVtIGFtb3VudCB0aGF0IHRoZSBoZXJvIGhhcyB0cmF2ZWxsZWRcbiAgICAgIHRoaXMueUNoYW5nZSA9IE1hdGgubWF4KHRoaXMueUNoYW5nZSwgTWF0aC5hYnModGhpcy55IC0gdGhpcy55T3JpZykpO1xuXG4gICAgICAvLyBXcmFwIGFyb3VuZCBlZGdlcyBsZWZ0L3RpZ2h0IGVkZ2VzXG4gICAgICB0aGlzLmdhbWUud29ybGQud3JhcCh0aGlzLCB0aGlzLndpZHRoIC8gMiwgZmFsc2UsIHRydWUsIGZhbHNlKTtcblxuICAgICAgLy8gV2hlbiBoZWFkaW5nIGRvd24sIGFuaW1hdGUgdG8gZG93blxuICAgICAgaWYgKHRoaXMuYm9keS52ZWxvY2l0eS55ID4gMCAmJiB0aGlzLmdvaW5nVXApIHtcbiAgICAgICAgdGhpcy5vbkZpcmUgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5nb2luZ1VwID0gZmFsc2U7XG4gICAgICAgIHRoaXMuZG9KdW1wRG93bigpO1xuICAgICAgfVxuXG4gICAgICAvLyBFbHNlIHdoZW4gaGVhZGluZyB1cCwgbm90ZVxuICAgICAgZWxzZSBpZiAodGhpcy5ib2R5LnZlbG9jaXR5LnkgPCAwICYmICF0aGlzLmdvaW5nVXApIHtcbiAgICAgICAgdGhpcy5nb2luZ1VwID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5kb0p1bXBVcCgpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICAvLyBSZXNldCBwbGFjZW1lbnQgY3VzdG9tXG4gICAgcmVzZXRQbGFjZW1lbnQ6IGZ1bmN0aW9uKHgsIHkpIHtcbiAgICAgIHRoaXMucmVzZXQoeCwgeSk7XG4gICAgICB0aGlzLnlPcmlnID0gdGhpcy55O1xuICAgICAgdGhpcy55Q2hhbmdlID0gMDtcbiAgICB9LFxuXG4gICAgLy8gSnVtcCB1cFxuICAgIGRvSnVtcFVwOiBmdW5jdGlvbigpIHtcbiAgICAgIGlmICghdGhpcy5vbkZpcmUgJiYgIXRoaXMuaXNEZWFkKSB7XG4gICAgICAgIHRoaXMuYW5pbWF0aW9ucy5wbGF5KFwianVtcC11cFwiLCAxNSwgZmFsc2UpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICAvLyBKdW1wIGRvd25cbiAgICBkb0p1bXBEb3duOiBmdW5jdGlvbigpIHtcbiAgICAgIGlmICghdGhpcy5vbkZpcmUgJiYgIXRoaXMuaXNEZWFkKSB7XG4gICAgICAgIHRoaXMuYW5pbWF0aW9ucy5wbGF5KFwianVtcC1kb3duXCIsIDE1LCBmYWxzZSk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIC8vIE9uIGZpcmVcbiAgICBzZXRPbkZpcmU6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5vbkZpcmUgPSB0cnVlO1xuICAgICAgdGhpcy5sb2FkVGV4dHVyZShcInBpY2tsZS1zcHJpdGVzXCIsIFwicGlja2xlLXJvY2tldC5wbmdcIik7XG4gICAgICB0aGlzLnNjYWxlLnNldFRvKHRoaXMub3JpZ2luYWxTY2FsZSAqIDEuNSk7XG4gICAgfSxcblxuICAgIC8vIE9mZiBmaXJlXG4gICAgcHV0T3V0RmlyZTogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnNjYWxlLnNldFRvKHRoaXMub3JpZ2luYWxTY2FsZSk7XG4gICAgICB0aGlzLm9uRmlyZSA9IGZhbHNlO1xuICAgIH0sXG5cbiAgICAvLyBNdXJkZXIgd2l0aCBib3RjaHlcbiAgICBib3RjaHlNdWRlcjogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLmlzRGVhZCA9IHRydWU7XG4gICAgICB0aGlzLmxvYWRUZXh0dXJlKFwicGlja2xlLXNwcml0ZXNcIiwgXCJwaWNrbGUtYm90Y2h5LnBuZ1wiKTtcblxuICAgICAgdmFyIHR3ZWVuID0gdGhpcy5nYW1lLmFkZC50d2Vlbih0aGlzKS50byh7XG4gICAgICAgIGFuZ2xlOiAxNzVcbiAgICAgIH0sIDUwMCwgUGhhc2VyLkVhc2luZy5MaW5lYXIuTm9uZSwgdHJ1ZSk7XG5cbiAgICAgIHR3ZWVuLm9uQ29tcGxldGUuYWRkKF8uYmluZChmdW5jdGlvbigpIHtcbiAgICAgICAgLy8gRG8gc29tZXRoaW5nXG4gICAgICB9LCB0aGlzKSk7XG4gICAgfVxuICB9KTtcblxuICAvLyBFeHBvcnRcbiAgbW9kdWxlLmV4cG9ydHMgPSBIZXJvO1xufSkoKTtcbiIsIi8qIGdsb2JhbCBfOmZhbHNlLCBQaGFzZXI6ZmFsc2UgKi9cblxuLyoqXG4gKiBQcmVmYWIgamFyIHBsYXRmb3JtXG4gKi9cblxuKGZ1bmN0aW9uKCkge1xuICBcInVzZSBzdHJpY3RcIjtcblxuICAvLyBDb25zdHJ1Y3RvclxuICB2YXIgSmFyID0gZnVuY3Rpb24oZ2FtZSwgeCwgeSkge1xuICAgIC8vIENhbGwgZGVmYXVsdCBzcHJpdGVcbiAgICBQaGFzZXIuU3ByaXRlLmNhbGwodGhpcywgZ2FtZSwgeCwgeSwgXCJnYW1lLXNwcml0ZXNcIiwgXCJqYXIucG5nXCIpO1xuXG4gICAgLy8gQ29uZmlndXJlXG4gICAgdGhpcy5hbmNob3Iuc2V0VG8oMC41LCAwLjUpO1xuICAgIHRoaXMuc2NhbGUuc2V0VG8oKHRoaXMuZ2FtZS53aWR0aCAvIDIpIC8gdGhpcy53aWR0aCk7XG5cbiAgICAvLyBQaHlzaWNzXG4gICAgdGhpcy5nYW1lLnBoeXNpY3MuYXJjYWRlLmVuYWJsZUJvZHkodGhpcyk7XG4gICAgdGhpcy5ib2R5LmFsbG93R3Jhdml0eSA9IGZhbHNlO1xuICAgIHRoaXMuYm9keS5pbW1vdmFibGUgPSB0cnVlO1xuICB9O1xuXG4gIC8vIEV4dGVuZCBmcm9tIFNwcml0ZVxuICBKYXIucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQaGFzZXIuU3ByaXRlLnByb3RvdHlwZSk7XG4gIEphci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBKYXI7XG5cbiAgLy8gQWRkIG1ldGhvZHNcbiAgXy5leHRlbmQoSmFyLnByb3RvdHlwZSwge1xuICAgIHVwZGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgfVxuICB9KTtcblxuICAvLyBFeHBvcnRcbiAgbW9kdWxlLmV4cG9ydHMgPSBKYXI7XG59KSgpO1xuIiwiLyogZ2xvYmFsIF86ZmFsc2UsIFBoYXNlcjpmYWxzZSAqL1xuXG4vKipcbiAqIFByZWZhYiBtaW5pIHBpY2tsZSAoa2luZCBvZiBsaWtlIGEgY29pbiwganVzdCBwb2ludHMpXG4gKi9cblxuKGZ1bmN0aW9uKCkge1xuICBcInVzZSBzdHJpY3RcIjtcblxuICAvLyBDb25zdHJ1Y3RvclxuICB2YXIgTWluaSA9IGZ1bmN0aW9uKGdhbWUsIHgsIHkpIHtcbiAgICAvLyBDYWxsIGRlZmF1bHQgc3ByaXRlXG4gICAgUGhhc2VyLlNwcml0ZS5jYWxsKHRoaXMsIGdhbWUsIHgsIHksIFwiZ2FtZS1zcHJpdGVzXCIsIFwibWFnaWNkaWxsLnBuZ1wiKTtcblxuICAgIC8vIENvbmZpZ3VyZVxuICAgIHRoaXMuYW5jaG9yLnNldFRvKDAuNSwgMC41KTtcbiAgICB0aGlzLnNjYWxlLnNldFRvKCh0aGlzLmdhbWUud2lkdGggLyAyMCkgLyB0aGlzLndpZHRoKTtcblxuICAgIC8vIFBoeXNpY3NcbiAgICB0aGlzLmdhbWUucGh5c2ljcy5hcmNhZGUuZW5hYmxlQm9keSh0aGlzKTtcbiAgICB0aGlzLmJvZHkuYWxsb3dHcmF2aXR5ID0gZmFsc2U7XG4gICAgdGhpcy5ib2R5LmltbW92YWJsZSA9IHRydWU7XG4gIH07XG5cbiAgLy8gRXh0ZW5kIGZyb20gU3ByaXRlXG4gIE1pbmkucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQaGFzZXIuU3ByaXRlLnByb3RvdHlwZSk7XG4gIE1pbmkucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gTWluaTtcblxuICAvLyBBZGQgbWV0aG9kc1xuICBfLmV4dGVuZChNaW5pLnByb3RvdHlwZSwge1xuICAgIHVwZGF0ZTogZnVuY3Rpb24oKSB7XG5cbiAgICB9XG4gIH0pO1xuXG4gIC8vIEV4cG9ydFxuICBtb2R1bGUuZXhwb3J0cyA9IE1pbmk7XG59KSgpO1xuIiwiLyogZ2xvYmFsIF86ZmFsc2UsIFBoYXNlcjpmYWxzZSAqL1xuXG4vKipcbiAqIFByZWZhYiAob2JqZWN0cykgYm9vc3QgZm9yIHBlcHBlclxuICovXG5cbihmdW5jdGlvbigpIHtcbiAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgLy8gQ29uc3RydWN0b3IgZm9yIEJvb3N0XG4gIHZhciBQZXBwZXIgPSBmdW5jdGlvbihnYW1lLCB4LCB5KSB7XG4gICAgLy8gQ2FsbCBkZWZhdWx0IHNwcml0ZVxuICAgIFBoYXNlci5TcHJpdGUuY2FsbCh0aGlzLCBnYW1lLCB4LCB5LCBcImdhbWUtc3ByaXRlc1wiLCBcImdob3N0LXBlcHBlci5wbmdcIik7XG5cbiAgICAvLyBTaXplXG4gICAgdGhpcy5hbmNob3Iuc2V0VG8oMC41LCAwLjUpO1xuICAgIHRoaXMuc2NhbGUuc2V0VG8oKHRoaXMuZ2FtZS53aWR0aCAvIDE4KSAvIHRoaXMud2lkdGgpO1xuXG4gICAgLy8gUGh5c2ljc1xuICAgIHRoaXMuZ2FtZS5waHlzaWNzLmFyY2FkZS5lbmFibGVCb2R5KHRoaXMpO1xuICAgIHRoaXMuYm9keS5hbGxvd0dyYXZpdHkgPSBmYWxzZTtcbiAgICB0aGlzLmJvZHkuaW1tb3ZhYmxlID0gdHJ1ZTtcbiAgfTtcblxuICAvLyBFeHRlbmQgZnJvbSBTcHJpdGVcbiAgUGVwcGVyLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUGhhc2VyLlNwcml0ZS5wcm90b3R5cGUpO1xuICBQZXBwZXIucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gUGVwcGVyO1xuXG4gIC8vIEFkZCBtZXRob2RzXG4gIF8uZXh0ZW5kKFBlcHBlci5wcm90b3R5cGUsIHtcbiAgICB1cGRhdGU6IGZ1bmN0aW9uKCkge1xuXG4gICAgfVxuICB9KTtcblxuICAvLyBFeHBvcnRcbiAgbW9kdWxlLmV4cG9ydHMgPSBQZXBwZXI7XG59KSgpO1xuIiwiLyogZ2xvYmFsIF86ZmFsc2UsIFBoYXNlcjpmYWxzZSAqL1xuXG4vKipcbiAqIEdhbWVvdmVyIHN0YXRlXG4gKi9cblxuKGZ1bmN0aW9uKCkge1xuICBcInVzZSBzdHJpY3RcIjtcblxuICAvLyBDb25zdHJ1Y3RvclxuICB2YXIgR2FtZW92ZXIgPSBmdW5jdGlvbigpIHtcbiAgICBQaGFzZXIuU3RhdGUuY2FsbCh0aGlzKTtcbiAgfTtcblxuICAvLyBFeHRlbmQgZnJvbSBTdGF0ZVxuICBHYW1lb3Zlci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFBoYXNlci5TdGF0ZS5wcm90b3R5cGUpO1xuICBHYW1lb3Zlci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBHYW1lb3ZlcjtcblxuICAvLyBBZGQgbWV0aG9kc1xuICBfLmV4dGVuZChHYW1lb3Zlci5wcm90b3R5cGUsIFBoYXNlci5TdGF0ZS5wcm90b3R5cGUsIHtcbiAgICAvLyBQcmVsb2FkXG4gICAgcHJlbG9hZDogZnVuY3Rpb24oKSB7XG4gICAgICAvLyBMb2FkIHVwIGdhbWUgaW1hZ2VzXG4gICAgICB0aGlzLmdhbWUubG9hZC5hdGxhcyhcImdhbWVvdmVyLXNwcml0ZXNcIiwgXCJhc3NldHMvZ2FtZW92ZXItc3ByaXRlcy5wbmdcIiwgXCJhc3NldHMvZ2FtZW92ZXItc3ByaXRlcy5qc29uXCIpO1xuICAgIH0sXG5cbiAgICAvLyBDcmVhdGVcbiAgICBjcmVhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgLy8gU2V0IGJhY2tncm91bmRcbiAgICAgIHRoaXMuZ2FtZS5zdGFnZS5iYWNrZ3JvdW5kQ29sb3IgPSBcIiM4Y2M2M2ZcIjtcblxuICAgICAgLy8gTWFrZSBwYWRkaW5nIGRlcGVuZGVudCBvbiB3aWR0aFxuICAgICAgdGhpcy5wYWRkaW5nID0gdGhpcy5nYW1lLndpZHRoIC8gNTA7XG5cbiAgICAgIC8vIFBsYWNlIHRpdGxlXG4gICAgICB0aGlzLnRpdGxlSW1hZ2UgPSB0aGlzLmdhbWUuYWRkLnNwcml0ZSgwLCAwLCBcImdhbWVvdmVyLXNwcml0ZXNcIiwgXCJnYW1lb3Zlci5wbmdcIik7XG4gICAgICB0aGlzLnRpdGxlSW1hZ2UuYW5jaG9yLnNldFRvKDAuNSwgMCk7XG4gICAgICB0aGlzLnRpdGxlSW1hZ2Uuc2NhbGUuc2V0VG8oKHRoaXMuZ2FtZS53aWR0aCAtICh0aGlzLnBhZGRpbmcgKiAxNikpIC8gdGhpcy50aXRsZUltYWdlLndpZHRoKTtcbiAgICAgIHRoaXMudGl0bGVJbWFnZS5yZXNldCh0aGlzLmNlbnRlclN0YWdlWCh0aGlzLnRpdGxlSW1hZ2UpLCB0aGlzLnBhZGRpbmcgKiAyKTtcbiAgICAgIHRoaXMuZ2FtZS5hZGQuZXhpc3RpbmcodGhpcy50aXRsZUltYWdlKTtcblxuICAgICAgLy8gSGlnaHNjb3JlIGxpc3QuICBDYW4ndCBzZWVtIHRvIGZpbmQgYSB3YXkgdG8gcGFzcyB0aGUgc2NvcmVcbiAgICAgIC8vIHZpYSBhIHN0YXRlIGNoYW5nZS5cbiAgICAgIHRoaXMuc2NvcmUgPSB0aGlzLmdhbWUucGlja2xlLnNjb3JlO1xuXG4gICAgICAvLyBTaG93IHNjb3JlXG4gICAgICB0aGlzLnNob3dTY29yZSgpO1xuXG4gICAgICAvLyBTaG93IGlucHV0IGlmIG5ldyBoaWdoc2NvcmUsIG90aGVyd2lzZSBzaG93IGxpc3RcbiAgICAgIGlmICh0aGlzLmdhbWUucGlja2xlLmlzSGlnaHNjb3JlKHRoaXMuc2NvcmUpKSB7XG4gICAgICAgIHRoaXMuaGlnaHNjb3JlSW5wdXQoKTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICB0aGlzLmhpZ2hzY29yZUxpc3QoKTtcbiAgICAgIH1cblxuICAgICAgLy8gUGxhY2UgcmUtcGxheVxuICAgICAgdGhpcy5yZXBsYXlJbWFnZSA9IHRoaXMuZ2FtZS5hZGQuc3ByaXRlKHRoaXMuZ2FtZS53aWR0aCAtIHRoaXMucGFkZGluZyAqIDIsXG4gICAgICAgIHRoaXMuZ2FtZS5oZWlnaHQgLSB0aGlzLnBhZGRpbmcgKiAyLCBcImdhbWVvdmVyLXNwcml0ZXNcIiwgXCJ0aXRsZS1wbGF5LnBuZ1wiKTtcbiAgICAgIHRoaXMucmVwbGF5SW1hZ2UuYW5jaG9yLnNldFRvKDEsIDEpO1xuICAgICAgdGhpcy5yZXBsYXlJbWFnZS5zY2FsZS5zZXRUbygodGhpcy5nYW1lLndpZHRoICogMC4yNSkgLyB0aGlzLnJlcGxheUltYWdlLndpZHRoKTtcbiAgICAgIHRoaXMuZ2FtZS5hZGQuZXhpc3RpbmcodGhpcy5yZXBsYXlJbWFnZSk7XG5cbiAgICAgIC8vIEFkZCBob3ZlciBmb3IgbW91c2VcbiAgICAgIHRoaXMucmVwbGF5SW1hZ2UuaW5wdXRFbmFibGVkID0gdHJ1ZTtcbiAgICAgIHRoaXMucmVwbGF5SW1hZ2UuZXZlbnRzLm9uSW5wdXRPdmVyLmFkZChmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5yZXBsYXlJbWFnZS5vcmlnaW5hbFRpbnQgPSB0aGlzLnJlcGxheUltYWdlLnRpbnQ7XG4gICAgICAgIHRoaXMucmVwbGF5SW1hZ2UudGludCA9IDAuNSAqIDB4RkZGRkZGO1xuICAgICAgfSwgdGhpcyk7XG5cbiAgICAgIHRoaXMucmVwbGF5SW1hZ2UuZXZlbnRzLm9uSW5wdXRPdXQuYWRkKGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLnJlcGxheUltYWdlLnRpbnQgPSB0aGlzLnJlcGxheUltYWdlLm9yaWdpbmFsVGludDtcbiAgICAgIH0sIHRoaXMpO1xuXG4gICAgICAvLyBBZGQgaW50ZXJhY3Rpb25zIGZvciBzdGFydGluZ1xuICAgICAgdGhpcy5yZXBsYXlJbWFnZS5ldmVudHMub25JbnB1dERvd24uYWRkKHRoaXMucmVwbGF5LCB0aGlzKTtcblxuICAgICAgLy8gSW5wdXRcbiAgICAgIHRoaXMubGVmdEJ1dHRvbiA9IHRoaXMuZ2FtZS5pbnB1dC5rZXlib2FyZC5hZGRLZXkoUGhhc2VyLktleWJvYXJkLkxFRlQpO1xuICAgICAgdGhpcy5yaWdodEJ1dHRvbiA9IHRoaXMuZ2FtZS5pbnB1dC5rZXlib2FyZC5hZGRLZXkoUGhhc2VyLktleWJvYXJkLlJJR0hUKTtcbiAgICAgIHRoaXMudXBCdXR0b24gPSB0aGlzLmdhbWUuaW5wdXQua2V5Ym9hcmQuYWRkS2V5KFBoYXNlci5LZXlib2FyZC5VUCk7XG4gICAgICB0aGlzLmRvd25CdXR0b24gPSB0aGlzLmdhbWUuaW5wdXQua2V5Ym9hcmQuYWRkS2V5KFBoYXNlci5LZXlib2FyZC5ET1dOKTtcbiAgICAgIHRoaXMuYWN0aW9uQnV0dG9uID0gdGhpcy5nYW1lLmlucHV0LmtleWJvYXJkLmFkZEtleShQaGFzZXIuS2V5Ym9hcmQuU1BBQ0VCQVIpO1xuXG4gICAgICB0aGlzLmxlZnRCdXR0b24ub25Eb3duLmFkZChmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHRoaXMuaElucHV0KSB7XG4gICAgICAgICAgdGhpcy5tb3ZlQ3Vyc29yKC0xKTtcbiAgICAgICAgfVxuICAgICAgfSwgdGhpcyk7XG5cbiAgICAgIHRoaXMucmlnaHRCdXR0b24ub25Eb3duLmFkZChmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHRoaXMuaElucHV0KSB7XG4gICAgICAgICAgdGhpcy5tb3ZlQ3Vyc29yKDEpO1xuICAgICAgICB9XG4gICAgICB9LCB0aGlzKTtcblxuICAgICAgdGhpcy51cEJ1dHRvbi5vbkRvd24uYWRkKGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAodGhpcy5oSW5wdXQpIHtcbiAgICAgICAgICB0aGlzLm1vdmVMZXR0ZXIoMSk7XG4gICAgICAgIH1cbiAgICAgIH0sIHRoaXMpO1xuXG4gICAgICB0aGlzLmRvd25CdXR0b24ub25Eb3duLmFkZChmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHRoaXMuaElucHV0KSB7XG4gICAgICAgICAgdGhpcy5tb3ZlTGV0dGVyKC0xKTtcbiAgICAgICAgfVxuICAgICAgfSwgdGhpcyk7XG5cbiAgICAgIHRoaXMuYWN0aW9uQnV0dG9uLm9uRG93bi5hZGQoZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBzYXZlZDtcblxuICAgICAgICBpZiAodGhpcy5oSW5wdXQpIHtcbiAgICAgICAgICBzYXZlZCA9IHRoaXMuc2F2ZUhpZ2hzY29yZSgpO1xuICAgICAgICAgIGlmIChzYXZlZCkge1xuICAgICAgICAgICAgdGhpcy5oaWdoc2NvcmVMaXN0KCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIHRoaXMucmVwbGF5KCk7XG4gICAgICAgIH1cbiAgICAgIH0sIHRoaXMpO1xuICAgIH0sXG5cbiAgICAvLyBVcGRhdGVcbiAgICB1cGRhdGU6IGZ1bmN0aW9uKCkge1xuICAgIH0sXG5cbiAgICAvLyBTaHV0ZG93biwgY2xlYW4gdXAgb24gc3RhdGUgY2hhbmdlXG4gICAgc2h1dGRvd246IGZ1bmN0aW9uKCkge1xuICAgICAgW1widGl0bGVUZXh0XCIsIFwicmVwbGF5VGV4dFwiXS5mb3JFYWNoKF8uYmluZChmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgIGlmICh0aGlzW2l0ZW1dICYmIHRoaXNbaXRlbV0uZGVzdHJveSkge1xuICAgICAgICAgIHRoaXNbaXRlbV0uZGVzdHJveSgpO1xuICAgICAgICAgIHRoaXNbaXRlbV0gPSBudWxsO1xuICAgICAgICB9XG4gICAgICB9LCB0aGlzKSk7XG4gICAgfSxcblxuICAgIC8vIEhhbmRsZSByZXBsYXlcbiAgICByZXBsYXk6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5nYW1lLnN0YXRlLnN0YXJ0KFwibWVudVwiKTtcbiAgICB9LFxuXG4gICAgLy8gU2hvdyBoaWdoc2NvcmVcbiAgICBzaG93U2NvcmU6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zY29yZUdyb3VwID0gdGhpcy5nYW1lLmFkZC5ncm91cCgpO1xuXG4gICAgICAvLyBQbGFjZSBsYWJlbFxuICAgICAgdGhpcy55b3VyU2NvcmVJbWFnZSA9IHRoaXMuZ2FtZS5hZGQuc3ByaXRlKFxuICAgICAgICB0aGlzLmdhbWUud2lkdGggLyAyICsgKHRoaXMucGFkZGluZyAqIDMpLFxuICAgICAgICB0aGlzLnRpdGxlSW1hZ2UuaGVpZ2h0ICsgKHRoaXMucGFkZGluZyAqIDcuNSksIFwiZ2FtZW92ZXItc3ByaXRlc1wiLCBcInlvdXItc2NvcmUucG5nXCIpO1xuICAgICAgdGhpcy55b3VyU2NvcmVJbWFnZS5hbmNob3Iuc2V0VG8oMSwgMCk7XG4gICAgICB0aGlzLnlvdXJTY29yZUltYWdlLnNjYWxlLnNldFRvKCgodGhpcy5nYW1lLndpZHRoIC8gMikgLSAodGhpcy5wYWRkaW5nICogNikpIC8gdGhpcy55b3VyU2NvcmVJbWFnZS53aWR0aCk7XG5cbiAgICAgIC8vIFNjb3JlXG4gICAgICB0aGlzLnNjb3JlVGV4dCA9IG5ldyBQaGFzZXIuVGV4dChcbiAgICAgICAgdGhpcy5nYW1lLFxuICAgICAgICB0aGlzLmdhbWUud2lkdGggLyAyICsgKHRoaXMucGFkZGluZyAqIDUpLFxuICAgICAgICB0aGlzLnRpdGxlSW1hZ2UuaGVpZ2h0ICsgKHRoaXMucGFkZGluZyAqIDYpLFxuICAgICAgICB0aGlzLnNjb3JlLnRvTG9jYWxlU3RyaW5nKCksIHtcbiAgICAgICAgICBmb250OiBcImJvbGQgXCIgKyAodGhpcy5nYW1lLndvcmxkLmhlaWdodCAvIDE1KSArIFwicHggRG9zaXNcIixcbiAgICAgICAgICBmaWxsOiBcIiMzOWI1NGFcIixcbiAgICAgICAgICBhbGlnbjogXCJsZWZ0XCIsXG4gICAgICAgIH0pO1xuICAgICAgdGhpcy5zY29yZVRleHQuYW5jaG9yLnNldFRvKDAsIDApO1xuXG4gICAgICAvLyBGb250IGxvYWRpbmcgdGhpbmdcbiAgICAgIF8uZGVsYXkoXy5iaW5kKGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLnNjb3JlR3JvdXAuYWRkKHRoaXMueW91clNjb3JlSW1hZ2UpO1xuICAgICAgICB0aGlzLnNjb3JlR3JvdXAuYWRkKHRoaXMuc2NvcmVUZXh0KTtcbiAgICAgIH0sIHRoaXMpLCAxMDAwKTtcbiAgICB9LFxuXG4gICAgLy8gTWFrZSBoaWdoZXN0IHNjb3JlIGlucHV0XG4gICAgaGlnaHNjb3JlSW5wdXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5oSW5wdXQgPSB0cnVlO1xuICAgICAgdGhpcy5oSW5wdXRJbmRleCA9IDA7XG4gICAgICB0aGlzLmhJbnB1dHMgPSB0aGlzLmdhbWUuYWRkLmdyb3VwKCk7XG4gICAgICB2YXIgeSA9IHRoaXMuZ2FtZS53b3JsZC5oZWlnaHQgKiAwLjc7XG5cbiAgICAgIC8vIEZpcnN0IGlucHV0XG4gICAgICB2YXIgb25lID0gbmV3IFBoYXNlci5UZXh0KFxuICAgICAgICB0aGlzLmdhbWUsXG4gICAgICAgIHRoaXMuZ2FtZS53b3JsZC53aWR0aCAqIDAuMzMzMzMsXG4gICAgICAgIHksXG4gICAgICAgIFwiQVwiLCB7XG4gICAgICAgICAgZm9udDogXCJib2xkIFwiICsgKHRoaXMuZ2FtZS53b3JsZC5oZWlnaHQgLyAxNSkgKyBcInB4IERvc2lzXCIsXG4gICAgICAgICAgZmlsbDogXCIjRkZGRkZGXCIsXG4gICAgICAgICAgYWxpZ246IFwiY2VudGVyXCIsXG4gICAgICAgIH0pO1xuICAgICAgb25lLmFuY2hvci5zZXQoMC41KTtcbiAgICAgIHRoaXMuaElucHV0cy5hZGQob25lKTtcblxuICAgICAgLy8gU2Vjb25kIGlucHV0XG4gICAgICB2YXIgc2Vjb25kID0gbmV3IFBoYXNlci5UZXh0KFxuICAgICAgICB0aGlzLmdhbWUsXG4gICAgICAgIHRoaXMuZ2FtZS53b3JsZC53aWR0aCAqIDAuNSxcbiAgICAgICAgeSxcbiAgICAgICAgXCJBXCIsIHtcbiAgICAgICAgICBmb250OiBcImJvbGQgXCIgKyAodGhpcy5nYW1lLndvcmxkLmhlaWdodCAvIDE1KSArIFwicHggRG9zaXNcIixcbiAgICAgICAgICBmaWxsOiBcIiNGRkZGRkZcIixcbiAgICAgICAgICBhbGlnbjogXCJjZW50ZXJcIixcbiAgICAgICAgfSk7XG4gICAgICBzZWNvbmQuYW5jaG9yLnNldCgwLjUpO1xuICAgICAgdGhpcy5oSW5wdXRzLmFkZChzZWNvbmQpO1xuXG4gICAgICAvLyBTZWNvbmQgaW5wdXRcbiAgICAgIHZhciB0aGlyZCA9IG5ldyBQaGFzZXIuVGV4dChcbiAgICAgICAgdGhpcy5nYW1lLFxuICAgICAgICB0aGlzLmdhbWUud29ybGQud2lkdGggKiAwLjY2NjY2LFxuICAgICAgICB5LFxuICAgICAgICBcIkFcIiwge1xuICAgICAgICAgIGZvbnQ6IFwiYm9sZCBcIiArICh0aGlzLmdhbWUud29ybGQuaGVpZ2h0IC8gMTUpICsgXCJweCBEb3Npc1wiLFxuICAgICAgICAgIGZpbGw6IFwiI0ZGRkZGRlwiLFxuICAgICAgICAgIGFsaWduOiBcImNlbnRlclwiLFxuICAgICAgICB9KTtcbiAgICAgIHRoaXJkLmFuY2hvci5zZXQoMC41KTtcbiAgICAgIHRoaXMuaElucHV0cy5hZGQodGhpcmQpO1xuXG4gICAgICAvLyBDdXJzb3JcbiAgICAgIHRoaXMuaEN1cnNvciA9IHRoaXMuZ2FtZS5hZGQudGV4dChcbiAgICAgICAgb25lLngsXG4gICAgICAgIG9uZS55IC0gKHRoaXMuZ2FtZS53b3JsZC5oZWlnaHQgLyAyMCksXG4gICAgICAgIFwiX1wiLCB7XG4gICAgICAgICAgZm9udDogXCJib2xkIFwiICsgKHRoaXMuZ2FtZS53b3JsZC5oZWlnaHQgLyA1KSArIFwicHggQXJpYWxcIixcbiAgICAgICAgICBmaWxsOiBcIiNGRkZGRkZcIixcbiAgICAgICAgICBhbGlnbjogXCJjZW50ZXJcIixcbiAgICAgICAgfSk7XG4gICAgICB0aGlzLmhDdXJzb3IuYW5jaG9yLnNldCgwLjUpO1xuXG4gICAgICAvLyBIYW5kbGUgaW5pdGFsIGN1cnNvclxuICAgICAgdGhpcy5tb3ZlQ3Vyc29yKDApO1xuICAgIH0sXG5cbiAgICAvLyBNb3ZlIGN1cnNvclxuICAgIG1vdmVDdXJzb3I6IGZ1bmN0aW9uKGFtb3VudCkge1xuICAgICAgdmFyIG5ld0luZGV4ID0gdGhpcy5oSW5wdXRJbmRleCArIGFtb3VudDtcbiAgICAgIHRoaXMuaElucHV0SW5kZXggPSAobmV3SW5kZXggPCAwKSA/IHRoaXMuaElucHV0cy5sZW5ndGggLSAxIDpcbiAgICAgICAgKG5ld0luZGV4ID49IHRoaXMuaElucHV0cy5sZW5ndGgpID8gMCA6IG5ld0luZGV4O1xuICAgICAgdmFyIGkgPSB0aGlzLmhJbnB1dHMuZ2V0Q2hpbGRBdCh0aGlzLmhJbnB1dEluZGV4KTtcblxuICAgICAgLy8gTW92ZSBjdXJzb3JcbiAgICAgIHRoaXMuaEN1cnNvci54ID0gaS54O1xuICAgICAgdGhpcy5oSW5wdXRzLmZvckVhY2goZnVuY3Rpb24oaW5wdXQpIHtcbiAgICAgICAgaW5wdXQuZmlsbCA9IFwiI0ZGRkZGRlwiO1xuICAgICAgfSk7XG5cbiAgICAgIGkuZmlsbCA9IFwiI0ZGRERCQlwiO1xuXG4gICAgICAvLyBUT0RPOiBIaWdobGlnaHQgaW5wdXQuXG4gICAgfSxcblxuICAgIC8vIE1vdmUgbGV0dGVyXG4gICAgbW92ZUxldHRlcjogZnVuY3Rpb24oYW1vdW50KSB7XG4gICAgICB2YXIgaSA9IHRoaXMuaElucHV0cy5nZXRDaGlsZEF0KHRoaXMuaElucHV0SW5kZXgpO1xuICAgICAgdmFyIHQgPSBpLnRleHQ7XG4gICAgICB2YXIgbiA9ICh0ID09PSBcIkFcIiAmJiBhbW91bnQgPT09IC0xKSA/IFwiWlwiIDpcbiAgICAgICAgKHQgPT09IFwiWlwiICYmIGFtb3VudCA9PT0gMSkgPyBcIkFcIiA6XG4gICAgICAgIFN0cmluZy5mcm9tQ2hhckNvZGUodC5jaGFyQ29kZUF0KDApICsgYW1vdW50KTtcblxuICAgICAgaS50ZXh0ID0gbjtcbiAgICB9LFxuXG4gICAgLy8gU2F2ZSBoaWdoc2NvcmVcbiAgICBzYXZlSGlnaHNjb3JlOiBmdW5jdGlvbigpIHtcbiAgICAgIC8vIEdldCBuYW1lXG4gICAgICB2YXIgbmFtZSA9IFwiXCI7XG4gICAgICB0aGlzLmhJbnB1dHMuZm9yRWFjaChmdW5jdGlvbihpbnB1dCkge1xuICAgICAgICBuYW1lID0gbmFtZSArIGlucHV0LnRleHQ7XG4gICAgICB9KTtcblxuICAgICAgLy8gRG9uJ3QgYWxsb3cgQUFBXG4gICAgICBpZiAobmFtZSA9PT0gXCJBQUFcIikge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIC8vIFNhdmUgaGlnaHNjb3JlXG4gICAgICB0aGlzLmdhbWUucGlja2xlLnNldEhpZ2hzY29yZSh0aGlzLnNjb3JlLCBuYW1lKTtcblxuICAgICAgLy8gUmVtb3ZlIGlucHV0XG4gICAgICB0aGlzLmhJbnB1dCA9IGZhbHNlO1xuICAgICAgdGhpcy5oSW5wdXRzLmRlc3Ryb3koKTtcbiAgICAgIHRoaXMuaEN1cnNvci5kZXN0cm95KCk7XG5cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0sXG5cbiAgICAvLyBIaWdoc2NvcmUgbGlzdFxuICAgIGhpZ2hzY29yZUxpc3Q6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5oaWdoc2NvcmVMaW1pdCA9IDM7XG4gICAgICB0aGlzLmhpZ2hzY29yZUxpc3RHcm91cCA9IHRoaXMuZ2FtZS5hZGQuZ3JvdXAoKTtcbiAgICAgIHRoaXMuZ2FtZS5waWNrbGUuc29ydEhpZ2hzY29yZXMoKTtcbiAgICAgIHZhciBmb250U2l6ZSA9IHRoaXMuZ2FtZS53b3JsZC5oZWlnaHQgLyAxNy41O1xuXG4gICAgICBpZiAodGhpcy5nYW1lLnBpY2tsZS5oaWdoc2NvcmVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgXy5lYWNoKHRoaXMuZ2FtZS5waWNrbGUuaGlnaHNjb3Jlcy5yZXZlcnNlKCkuc2xpY2UoMCwgMyksIF8uYmluZChmdW5jdGlvbihoLCBpKSB7XG4gICAgICAgICAgLy8gTmFtZVxuICAgICAgICAgIHZhciBuYW1lID0gbmV3IFBoYXNlci5UZXh0KFxuICAgICAgICAgICAgdGhpcy5nYW1lLFxuICAgICAgICAgICAgdGhpcy5nYW1lLndpZHRoIC8gMiArICh0aGlzLnBhZGRpbmcgKiAzKSxcbiAgICAgICAgICAgICh0aGlzLmdhbWUuaGVpZ2h0ICogMC42KSArICgoZm9udFNpemUgKyB0aGlzLnBhZGRpbmcpICogaSksXG4gICAgICAgICAgICBoLm5hbWUsIHtcbiAgICAgICAgICAgICAgZm9udDogXCJib2xkIFwiICsgKHRoaXMuZ2FtZS53b3JsZC5oZWlnaHQgLyAxNSkgKyBcInB4IERvc2lzXCIsXG4gICAgICAgICAgICAgIGZpbGw6IFwiI2I4ZjRiY1wiLFxuICAgICAgICAgICAgICBhbGlnbjogXCJyaWdodFwiLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgbmFtZS5hbmNob3Iuc2V0VG8oMSwgMCk7XG5cbiAgICAgICAgICAvLyBTY29yZVxuICAgICAgICAgIHZhciBzY29yZSA9IG5ldyBQaGFzZXIuVGV4dChcbiAgICAgICAgICAgIHRoaXMuZ2FtZSxcbiAgICAgICAgICAgIHRoaXMuZ2FtZS53aWR0aCAvIDIgKyAodGhpcy5wYWRkaW5nICogNSksXG4gICAgICAgICAgICAodGhpcy5nYW1lLmhlaWdodCAqIDAuNikgKyAoKGZvbnRTaXplICsgdGhpcy5wYWRkaW5nKSAqIGkpLFxuICAgICAgICAgICAgaC5zY29yZS50b0xvY2FsZVN0cmluZygpLCB7XG4gICAgICAgICAgICAgIGZvbnQ6IFwiYm9sZCBcIiArICh0aGlzLmdhbWUud29ybGQuaGVpZ2h0IC8gMTUpICsgXCJweCBEb3Npc1wiLFxuICAgICAgICAgICAgICBmaWxsOiBcIiMzOWI1NGFcIixcbiAgICAgICAgICAgICAgYWxpZ246IFwibGVmdFwiLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgc2NvcmUuYW5jaG9yLnNldFRvKDAsIDApO1xuXG4gICAgICAgICAgLy8gRm9udCBsb2FkaW5nIHRoaW5nXG4gICAgICAgICAgXy5kZWxheShfLmJpbmQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLmhpZ2hzY29yZUxpc3RHcm91cC5hZGQobmFtZSk7XG4gICAgICAgICAgICB0aGlzLmhpZ2hzY29yZUxpc3RHcm91cC5hZGQoc2NvcmUpO1xuICAgICAgICAgIH0sIHRoaXMpLCAxMDAwKTtcbiAgICAgICAgfSwgdGhpcykpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICAvLyBDZW50ZXIgeCBvbiBzdGFnZVxuICAgIGNlbnRlclN0YWdlWDogZnVuY3Rpb24ob2JqKSB7XG4gICAgICByZXR1cm4gKCh0aGlzLmdhbWUud2lkdGggLSBvYmoud2lkdGgpIC8gMikgKyAob2JqLndpZHRoIC8gMik7XG4gICAgfSxcblxuICAgIC8vIENlbnRlciB4IG9uIHN0YWdlXG4gICAgY2VudGVyU3RhZ2VZOiBmdW5jdGlvbihvYmopIHtcbiAgICAgIHJldHVybiAoKHRoaXMuZ2FtZS5oZWlnaHQgLSBvYmouaGVpZ2h0KSAvIDIpICsgKG9iai5oZWlnaHQgLyAyKTtcbiAgICB9XG4gIH0pO1xuXG4gIC8vIEV4cG9ydFxuICBtb2R1bGUuZXhwb3J0cyA9IEdhbWVvdmVyO1xufSkoKTtcbiIsIi8qIGdsb2JhbCBfOmZhbHNlLCBQaGFzZXI6ZmFsc2UgKi9cblxuLyoqXG4gKiBNZW51IHN0YXRlXG4gKi9cblxuKGZ1bmN0aW9uKCkge1xuICBcInVzZSBzdHJpY3RcIjtcblxuICAvLyBDb25zdHJ1Y3RvclxuICB2YXIgTWVudSA9IGZ1bmN0aW9uKCkge1xuICAgIFBoYXNlci5TdGF0ZS5jYWxsKHRoaXMpO1xuICB9O1xuXG4gIC8vIEV4dGVuZCBmcm9tIFN0YXRlXG4gIE1lbnUucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQaGFzZXIuU3RhdGUucHJvdG90eXBlKTtcbiAgTWVudS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBNZW51O1xuXG4gIC8vIEFkZCBtZXRob2RzXG4gIF8uZXh0ZW5kKE1lbnUucHJvdG90eXBlLCBQaGFzZXIuU3RhdGUucHJvdG90eXBlLCB7XG4gICAgLy8gUHJlbG9hZFxuICAgIHByZWxvYWQ6IGZ1bmN0aW9uKCkge1xuICAgICAgLy8gTG9hZCB1cCBnYW1lIGltYWdlc1xuICAgICAgdGhpcy5nYW1lLmxvYWQuYXRsYXMoXCJ0aXRsZS1zcHJpdGVzXCIsIFwiYXNzZXRzL3RpdGxlLXNwcml0ZXMucG5nXCIsIFwiYXNzZXRzL3RpdGxlLXNwcml0ZXMuanNvblwiKTtcbiAgICB9LFxuXG4gICAgLy8gQ3JlYXRlXG4gICAgY3JlYXRlOiBmdW5jdGlvbigpIHtcbiAgICAgIC8vIFNldCBiYWNrZ3JvdW5kXG4gICAgICB0aGlzLmdhbWUuc3RhZ2UuYmFja2dyb3VuZENvbG9yID0gXCIjYjhmNGJjXCI7XG5cbiAgICAgIC8vIE1ha2UgcGFkZGluZyBkZXBlbmRlbnQgb24gd2lkdGhcbiAgICAgIHRoaXMucGFkZGluZyA9IHRoaXMuZ2FtZS53aWR0aCAvIDUwO1xuXG4gICAgICAvLyBQbGFjZSB0aXRsZVxuICAgICAgdGhpcy50aXRsZUltYWdlID0gdGhpcy5nYW1lLmFkZC5zcHJpdGUoMCwgMCwgXCJ0aXRsZS1zcHJpdGVzXCIsIFwidGl0bGUucG5nXCIpO1xuICAgICAgdGhpcy50aXRsZUltYWdlLmFuY2hvci5zZXRUbygwLjUsIDAuNSk7XG4gICAgICB0aGlzLnRpdGxlSW1hZ2Uuc2NhbGUuc2V0VG8oKHRoaXMuZ2FtZS53aWR0aCAtICh0aGlzLnBhZGRpbmcgKiA0KSkgLyB0aGlzLnRpdGxlSW1hZ2Uud2lkdGgpO1xuICAgICAgdGhpcy50aXRsZUltYWdlLnJlc2V0KHRoaXMuY2VudGVyU3RhZ2VYKHRoaXMudGl0bGVJbWFnZSksXG4gICAgICAgIHRoaXMuY2VudGVyU3RhZ2VZKHRoaXMudGl0bGVJbWFnZSkgLSB0aGlzLnBhZGRpbmcgKiA0KTtcbiAgICAgIHRoaXMuZ2FtZS5hZGQuZXhpc3RpbmcodGhpcy50aXRsZUltYWdlKTtcblxuICAgICAgLy8gUGxhY2UgcGxheVxuICAgICAgdGhpcy5wbGF5SW1hZ2UgPSB0aGlzLmdhbWUuYWRkLnNwcml0ZSgwLCAwLCBcInRpdGxlLXNwcml0ZXNcIiwgXCJ0aXRsZS1wbGF5LnBuZ1wiKTtcbiAgICAgIHRoaXMucGxheUltYWdlLmFuY2hvci5zZXRUbygwLjQsIDEpO1xuICAgICAgdGhpcy5wbGF5SW1hZ2Uuc2NhbGUuc2V0VG8oKHRoaXMuZ2FtZS53aWR0aCAqIDAuNSkgLyB0aGlzLnRpdGxlSW1hZ2Uud2lkdGgpO1xuICAgICAgdGhpcy5wbGF5SW1hZ2UucmVzZXQodGhpcy5jZW50ZXJTdGFnZVgodGhpcy5wbGF5SW1hZ2UpLCB0aGlzLmdhbWUuaGVpZ2h0IC0gdGhpcy5wYWRkaW5nICogMik7XG4gICAgICB0aGlzLmdhbWUuYWRkLmV4aXN0aW5nKHRoaXMucGxheUltYWdlKTtcblxuICAgICAgLy8gQWRkIGhvdmVyIGZvciBtb3VzZVxuICAgICAgdGhpcy5wbGF5SW1hZ2UuaW5wdXRFbmFibGVkID0gdHJ1ZTtcbiAgICAgIHRoaXMucGxheUltYWdlLmV2ZW50cy5vbklucHV0T3Zlci5hZGQoZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMucGxheUltYWdlLm9yaWdpbmFsVGludCA9IHRoaXMucGxheUltYWdlLnRpbnQ7XG4gICAgICAgIHRoaXMucGxheUltYWdlLnRpbnQgPSAwLjUgKiAweEZGRkZGRjtcbiAgICAgIH0sIHRoaXMpO1xuXG4gICAgICB0aGlzLnBsYXlJbWFnZS5ldmVudHMub25JbnB1dE91dC5hZGQoZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMucGxheUltYWdlLnRpbnQgPSB0aGlzLnBsYXlJbWFnZS5vcmlnaW5hbFRpbnQ7XG4gICAgICB9LCB0aGlzKTtcblxuICAgICAgLy8gQWRkIG1vdXNlIGludGVyYWN0aW9uXG4gICAgICB0aGlzLnBsYXlJbWFnZS5ldmVudHMub25JbnB1dERvd24uYWRkKHRoaXMuZ28sIHRoaXMpO1xuXG4gICAgICAvLyBBZGQga2V5Ym9hcmQgaW50ZXJhY3Rpb25cbiAgICAgIHRoaXMuYWN0aW9uQnV0dG9uID0gdGhpcy5nYW1lLmlucHV0LmtleWJvYXJkLmFkZEtleShQaGFzZXIuS2V5Ym9hcmQuU1BBQ0VCQVIpO1xuICAgICAgdGhpcy5hY3Rpb25CdXR0b24ub25Eb3duLmFkZChmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5nbygpO1xuICAgICAgfSwgdGhpcyk7XG5cbiAgICAgIC8vIFNob3cgYW55IG92ZXJsYXlzXG4gICAgICB0aGlzLmdhbWUucGlja2xlLnNob3dPdmVybGF5KFwiLnN0YXRlLW1lbnVcIik7XG4gICAgfSxcblxuICAgIC8vIFN0YXJ0IHBsYXlpbmdcbiAgICBnbzogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLmdhbWUucGlja2xlLmhpZGVPdmVybGF5KFwiLnN0YXRlLW1lbnVcIik7XG4gICAgICB0aGlzLmdhbWUuc3RhdGUuc3RhcnQoXCJwbGF5XCIpO1xuICAgIH0sXG5cbiAgICAvLyBVcGRhdGVcbiAgICB1cGRhdGU6IGZ1bmN0aW9uKCkge1xuICAgIH0sXG5cbiAgICAvLyBDZW50ZXIgeCBvbiBzdGFnZVxuICAgIGNlbnRlclN0YWdlWDogZnVuY3Rpb24ob2JqKSB7XG4gICAgICByZXR1cm4gKCh0aGlzLmdhbWUud2lkdGggLSBvYmoud2lkdGgpIC8gMikgKyAob2JqLndpZHRoIC8gMik7XG4gICAgfSxcblxuICAgIC8vIENlbnRlciB4IG9uIHN0YWdlXG4gICAgY2VudGVyU3RhZ2VZOiBmdW5jdGlvbihvYmopIHtcbiAgICAgIHJldHVybiAoKHRoaXMuZ2FtZS5oZWlnaHQgLSBvYmouaGVpZ2h0KSAvIDIpICsgKG9iai5oZWlnaHQgLyAyKTtcbiAgICB9XG4gIH0pO1xuXG4gIC8vIEV4cG9ydFxuICBtb2R1bGUuZXhwb3J0cyA9IE1lbnU7XG59KSgpO1xuIiwiLyogZ2xvYmFsIF86ZmFsc2UsIFBoYXNlcjpmYWxzZSAqL1xuXG4vKipcbiAqIFBsYXkgc3RhdGVcbiAqL1xuXG4oZnVuY3Rpb24oKSB7XG4gIFwidXNlIHN0cmljdFwiO1xuXG4gIC8vIERlcGVuZGVuY2llc1xuICB2YXIgcHJlZmFicyA9IHtcbiAgICBEaWxsOiByZXF1aXJlKFwiLi9wcmVmYWItZGlsbC5qc1wiKSxcbiAgICBQZXBwZXI6IHJlcXVpcmUoXCIuL3ByZWZhYi1wZXBwZXIuanNcIiksXG4gICAgQm90dWxpc206IHJlcXVpcmUoXCIuL3ByZWZhYi1ib3R1bGlzbS5qc1wiKSxcbiAgICBNaW5pOiByZXF1aXJlKFwiLi9wcmVmYWItbWluaS5qc1wiKSxcbiAgICBIZXJvOiByZXF1aXJlKFwiLi9wcmVmYWItaGVyby5qc1wiKSxcbiAgICBCZWFuOiByZXF1aXJlKFwiLi9wcmVmYWItYmVhbi5qc1wiKSxcbiAgICBDYXJyb3Q6IHJlcXVpcmUoXCIuL3ByZWZhYi1jYXJyb3QuanNcIiksXG4gICAgSmFyOiByZXF1aXJlKFwiLi9wcmVmYWItamFyLmpzXCIpXG4gIH07XG5cbiAgLy8gQ29uc3RydWN0b3JcbiAgdmFyIFBsYXkgPSBmdW5jdGlvbigpIHtcbiAgICBQaGFzZXIuU3RhdGUuY2FsbCh0aGlzKTtcbiAgfTtcblxuICAvLyBFeHRlbmQgZnJvbSBTdGF0ZVxuICBQbGF5LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUGhhc2VyLlN0YXRlLnByb3RvdHlwZSk7XG4gIFBsYXkucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gUGxheTtcblxuICAvLyBBZGQgbWV0aG9kc1xuICBfLmV4dGVuZChQbGF5LnByb3RvdHlwZSwgUGhhc2VyLlN0YXRlLnByb3RvdHlwZSwge1xuICAgIC8vIFByZWxvYWRcbiAgICBwcmVsb2FkOiBmdW5jdGlvbigpIHtcbiAgICAgIC8vIExvYWQgdXAgZ2FtZSBpbWFnZXNcbiAgICAgIHRoaXMuZ2FtZS5sb2FkLmF0bGFzKFwiZ2FtZS1zcHJpdGVzXCIsIFwiYXNzZXRzL2dhbWUtc3ByaXRlcy5wbmdcIiwgXCJhc3NldHMvZ2FtZS1zcHJpdGVzLmpzb25cIik7XG4gICAgICB0aGlzLmdhbWUubG9hZC5hdGxhcyhcInBpY2tsZS1zcHJpdGVzXCIsIFwiYXNzZXRzL3BpY2tsZS1zcHJpdGVzLnBuZ1wiLCBcImFzc2V0cy9waWNrbGUtc3ByaXRlcy5qc29uXCIpO1xuICAgICAgdGhpcy5nYW1lLmxvYWQuYXRsYXMoXCJjYXJyb3Qtc3ByaXRlc1wiLCBcImFzc2V0cy9jYXJyb3Qtc3ByaXRlcy5wbmdcIiwgXCJhc3NldHMvY2Fycm90LXNwcml0ZXMuanNvblwiKTtcbiAgICB9LFxuXG4gICAgLy8gQ3JlYXRlXG4gICAgY3JlYXRlOiBmdW5jdGlvbigpIHtcbiAgICAgIC8vIFNldCBpbml0aWFsIGRpZmZpY3VsdHkgYW5kIGxldmVsIHNldHRpbmdzXG4gICAgICB0aGlzLmNyZWF0ZVN1cGVyTGV2ZWxCRygpO1xuICAgICAgdGhpcy51cGRhdGVEaWZmaWN1bHR5KCk7XG5cbiAgICAgIC8vIFNjb3JpbmdcbiAgICAgIHRoaXMuc2NvcmVNaW5pID0gMTAwO1xuICAgICAgdGhpcy5zY29yZURpbGwgPSA1MDA7XG4gICAgICB0aGlzLnNjb3JlUGVwcGVyID0gNzUwO1xuICAgICAgdGhpcy5zY29yZUJvdCA9IDEwMDA7XG5cbiAgICAgIC8vIFNwYWNpbmdcbiAgICAgIHRoaXMucGFkZGluZyA9IDEwO1xuXG4gICAgICAvLyBEZXRlcm1pbmUgd2hlcmUgZmlyc3QgcGxhdGZvcm0gYW5kIGhlcm8gd2lsbCBiZS5cbiAgICAgIHRoaXMuc3RhcnRZID0gdGhpcy5nYW1lLmhlaWdodCAtIDU7XG5cbiAgICAgIC8vIEluaXRpYWxpemUgdHJhY2tpbmcgdmFyaWFibGVzXG4gICAgICB0aGlzLnJlc2V0Vmlld1RyYWNraW5nKCk7XG5cbiAgICAgIC8vIFNjYWxpbmdcbiAgICAgIHRoaXMuZ2FtZS5zY2FsZS5zY2FsZU1vZGUgPSBQaGFzZXIuU2NhbGVNYW5hZ2VyLlNIT1dfQUxMO1xuICAgICAgdGhpcy5nYW1lLnNjYWxlLm1heFdpZHRoID0gdGhpcy5nYW1lLndpZHRoO1xuICAgICAgdGhpcy5nYW1lLnNjYWxlLm1heEhlaWdodCA9IHRoaXMuZ2FtZS5oZWlnaHQ7XG4gICAgICB0aGlzLmdhbWUuc2NhbGUucGFnZUFsaWduSG9yaXpvbnRhbGx5ID0gdHJ1ZTtcbiAgICAgIHRoaXMuZ2FtZS5zY2FsZS5wYWdlQWxpZ25WZXJ0aWNhbGx5ID0gdHJ1ZTtcblxuICAgICAgLy8gUGh5c2ljc1xuICAgICAgdGhpcy5nYW1lLnBoeXNpY3Muc3RhcnRTeXN0ZW0oUGhhc2VyLlBoeXNpY3MuQVJDQURFKTtcbiAgICAgIHRoaXMuZ2FtZS5waHlzaWNzLmFyY2FkZS5ncmF2aXR5LnkgPSAxMDAwO1xuXG4gICAgICAvLyBDb250YWluZXJzXG4gICAgICB0aGlzLmJlYW5zID0gdGhpcy5nYW1lLmFkZC5ncm91cCgpO1xuICAgICAgdGhpcy5jYXJyb3RzID0gdGhpcy5nYW1lLmFkZC5ncm91cCgpO1xuICAgICAgdGhpcy5taW5pcyA9IHRoaXMuZ2FtZS5hZGQuZ3JvdXAoKTtcbiAgICAgIHRoaXMuZGlsbHMgPSB0aGlzLmdhbWUuYWRkLmdyb3VwKCk7XG4gICAgICB0aGlzLnBlcHBlcnMgPSB0aGlzLmdhbWUuYWRkLmdyb3VwKCk7XG4gICAgICB0aGlzLmJvdHMgPSB0aGlzLmdhbWUuYWRkLmdyb3VwKCk7XG5cbiAgICAgIC8vIFBsYXRmb3Jtc1xuICAgICAgdGhpcy5hZGRQbGF0Zm9ybXMoKTtcblxuICAgICAgLy8gQWRkIGhlcm8gaGVyZSBzbyBpcyBhbHdheXMgb24gdG9wLlxuICAgICAgdGhpcy5oZXJvID0gbmV3IHByZWZhYnMuSGVybyh0aGlzLmdhbWUsIDAsIDApO1xuICAgICAgdGhpcy5oZXJvLnJlc2V0UGxhY2VtZW50KHRoaXMuZ2FtZS53aWR0aCAqIDAuNSwgdGhpcy5zdGFydFkgLSB0aGlzLmhlcm8uaGVpZ2h0IC0gNTApO1xuICAgICAgdGhpcy5nYW1lLmFkZC5leGlzdGluZyh0aGlzLmhlcm8pO1xuXG4gICAgICAvLyBJbml0aWFsaXplIHNjb3JlXG4gICAgICB0aGlzLnJlc2V0U2NvcmUoKTtcbiAgICAgIHRoaXMudXBkYXRlU2NvcmUoKTtcblxuICAgICAgLy8gQ3Vyc29ycywgaW5wdXRcbiAgICAgIHRoaXMuY3Vyc29ycyA9IHRoaXMuZ2FtZS5pbnB1dC5rZXlib2FyZC5jcmVhdGVDdXJzb3JLZXlzKCk7XG4gICAgICB0aGlzLmFjdGlvbkJ1dHRvbiA9IHRoaXMuZ2FtZS5pbnB1dC5rZXlib2FyZC5hZGRLZXkoUGhhc2VyLktleWJvYXJkLlNQQUNFQkFSKTtcbiAgICB9LFxuXG4gICAgLy8gVXBkYXRlXG4gICAgdXBkYXRlOiBmdW5jdGlvbigpIHtcbiAgICAgIC8vIFRoaXMgaXMgd2hlcmUgdGhlIG1haW4gbWFnaWMgaGFwcGVuc1xuICAgICAgLy8gdGhlIHkgb2Zmc2V0IGFuZCB0aGUgaGVpZ2h0IG9mIHRoZSB3b3JsZCBhcmUgYWRqdXN0ZWRcbiAgICAgIC8vIHRvIG1hdGNoIHRoZSBoaWdoZXN0IHBvaW50IHRoZSBoZXJvIGhhcyByZWFjaGVkXG4gICAgICB0aGlzLndvcmxkLnNldEJvdW5kcygwLCAtdGhpcy5oZXJvLnlDaGFuZ2UsIHRoaXMuZ2FtZS53b3JsZC53aWR0aCxcbiAgICAgICAgdGhpcy5nYW1lLmhlaWdodCArIHRoaXMuaGVyby55Q2hhbmdlKTtcblxuICAgICAgLy8gVGhlIGJ1aWx0IGluIGNhbWVyYSBmb2xsb3cgbWV0aG9kcyB3b24ndCB3b3JrIGZvciBvdXIgbmVlZHNcbiAgICAgIC8vIHRoaXMgaXMgYSBjdXN0b20gZm9sbG93IHN0eWxlIHRoYXQgd2lsbCBub3QgZXZlciBtb3ZlIGRvd24sIGl0IG9ubHkgbW92ZXMgdXBcbiAgICAgIHRoaXMuY2FtZXJhWU1pbiA9IE1hdGgubWluKHRoaXMuY2FtZXJhWU1pbiwgdGhpcy5oZXJvLnkgLSB0aGlzLmdhbWUuaGVpZ2h0IC8gMik7XG4gICAgICB0aGlzLmNhbWVyYS55ID0gdGhpcy5jYW1lcmFZTWluO1xuXG4gICAgICAvLyBJZiBoZXJvIGZhbGxzIGJlbG93IGNhbWVyYVxuICAgICAgaWYgKHRoaXMuaGVyby55ID4gdGhpcy5jYW1lcmFZTWluICsgdGhpcy5nYW1lLmhlaWdodCArIDIwMCkge1xuICAgICAgICB0aGlzLmdhbWVPdmVyKCk7XG4gICAgICB9XG5cbiAgICAgIC8vIElmIGhlcm8gaXMgZ29pbmcgZG93biwgdGhlbiBubyBsb25nZXIgb24gZmlyZVxuICAgICAgaWYgKHRoaXMuaGVyby5ib2R5LnZlbG9jaXR5LnkgPiAwKSB7XG4gICAgICAgIHRoaXMucHV0T3V0RmlyZSgpO1xuICAgICAgfVxuXG4gICAgICAvLyBNb3ZlIGhlcm9cbiAgICAgIHRoaXMuaGVyby5ib2R5LnZlbG9jaXR5LnggPVxuICAgICAgICAodGhpcy5jdXJzb3JzLmxlZnQuaXNEb3duKSA/IC0odGhpcy5nYW1lLnBoeXNpY3MuYXJjYWRlLmdyYXZpdHkueSAvIDUpIDpcbiAgICAgICAgKHRoaXMuY3Vyc29ycy5yaWdodC5pc0Rvd24pID8gKHRoaXMuZ2FtZS5waHlzaWNzLmFyY2FkZS5ncmF2aXR5LnkgLyA1KSA6IDA7XG5cbiAgICAgIC8vIENvbGxpc2lvbnNcbiAgICAgIHRoaXMudXBkYXRlQ29sbGlzaW9ucygpO1xuXG4gICAgICAvLyBJdGVtcyAocGxhdGZvcm1zIGFuZCBpdGVtcylcbiAgICAgIHRoaXMudXBkYXRlSXRlbXMoKTtcblxuICAgICAgLy8gVXBkYXRlIHNjb3JlXG4gICAgICB0aGlzLnVwZGF0ZVNjb3JlKCk7XG5cbiAgICAgIC8vIFVwZGF0ZSBkaWZmaWN1bHRcbiAgICAgIHRoaXMudXBkYXRlRGlmZmljdWx0eSgpO1xuXG4gICAgICAvLyBEZWJ1Z1xuICAgICAgaWYgKHRoaXMuZ2FtZS5waWNrbGUub3B0aW9ucy5kZWJ1Zykge1xuICAgICAgICB0aGlzLmdhbWUuZGVidWcuYm9keSh0aGlzLmhlcm8pO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICAvLyBIYW5kbGUgY29sbGlzaW9uc1xuICAgIHVwZGF0ZUNvbGxpc2lvbnM6IGZ1bmN0aW9uKCkge1xuICAgICAgLy8gV2hlbiBkZWFkLCBubyBjb2xsaXNpb25zLCBqdXN0IGZhbGwgdG8gZGVhdGguXG4gICAgICBpZiAodGhpcy5oZXJvLmlzRGVhZCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIFBsYXRmb3JtIGNvbGxpc2lvbnNcbiAgICAgIHRoaXMuZ2FtZS5waHlzaWNzLmFyY2FkZS5jb2xsaWRlKHRoaXMuaGVybywgdGhpcy5iZWFucywgdGhpcy51cGRhdGVIZXJvUGxhdGZvcm0sIG51bGwsIHRoaXMpO1xuICAgICAgdGhpcy5nYW1lLnBoeXNpY3MuYXJjYWRlLmNvbGxpZGUodGhpcy5oZXJvLCB0aGlzLmNhcnJvdHMsIHRoaXMudXBkYXRlSGVyb1BsYXRmb3JtLCBudWxsLCB0aGlzKTtcbiAgICAgIHRoaXMuZ2FtZS5waHlzaWNzLmFyY2FkZS5jb2xsaWRlKHRoaXMuaGVybywgdGhpcy5iYXNlLCB0aGlzLnVwZGF0ZUhlcm9QbGF0Zm9ybSwgbnVsbCwgdGhpcyk7XG5cbiAgICAgIC8vIE1pbmkgY29sbGlzaW9uc1xuICAgICAgdGhpcy5nYW1lLnBoeXNpY3MuYXJjYWRlLm92ZXJsYXAodGhpcy5oZXJvLCB0aGlzLm1pbmlzLCBmdW5jdGlvbihoZXJvLCBtaW5pKSB7XG4gICAgICAgIG1pbmkua2lsbCgpO1xuICAgICAgICB0aGlzLnVwZGF0ZVNjb3JlKHRoaXMuc2NvcmVNaW5pKTtcbiAgICAgIH0sIG51bGwsIHRoaXMpO1xuXG4gICAgICAvLyBEaWxsIGNvbGxpc2lvbnMuICBEb24ndCBkbyBhbnl0aGluZyBpZiBvbiBmaXJlXG4gICAgICBpZiAoIXRoaXMub25GaXJlKSB7XG4gICAgICAgIHRoaXMuZ2FtZS5waHlzaWNzLmFyY2FkZS5vdmVybGFwKHRoaXMuaGVybywgdGhpcy5kaWxscywgZnVuY3Rpb24oaGVybywgZGlsbCkge1xuICAgICAgICAgIGRpbGwua2lsbCgpO1xuICAgICAgICAgIHRoaXMudXBkYXRlU2NvcmUodGhpcy5zY29yZURpbGwpO1xuICAgICAgICAgIGhlcm8uYm9keS52ZWxvY2l0eS55ID0gdGhpcy5nYW1lLnBoeXNpY3MuYXJjYWRlLmdyYXZpdHkueSAqIC0xICogMS41O1xuICAgICAgICB9LCBudWxsLCB0aGlzKTtcbiAgICAgIH1cblxuICAgICAgLy8gUGVwcGVyIGNvbGxpc2lvbnNcbiAgICAgIHRoaXMuZ2FtZS5waHlzaWNzLmFyY2FkZS5vdmVybGFwKHRoaXMuaGVybywgdGhpcy5wZXBwZXJzLCBmdW5jdGlvbihoZXJvLCBwZXBwZXIpIHtcbiAgICAgICAgcGVwcGVyLmtpbGwoKTtcbiAgICAgICAgdGhpcy51cGRhdGVTY29yZSh0aGlzLnNjb3JlUGVwcGVyKTtcbiAgICAgICAgdGhpcy5zZXRPbkZpcmUoKTtcbiAgICAgICAgaGVyby5ib2R5LnZlbG9jaXR5LnkgPSB0aGlzLmdhbWUucGh5c2ljcy5hcmNhZGUuZ3Jhdml0eS55ICogLTEgKiAzO1xuICAgICAgfSwgbnVsbCwgdGhpcyk7XG5cbiAgICAgIC8vIEJvdHVsaXNtIGNvbGxpc2lvbnMuICBJZiBoZXJvIGp1bXBzIG9uIHRvcCwgdGhlbiBraWxsLCBvdGhlcndpc2UgZGllLCBhbmRcbiAgICAgIC8vIGlnbm9yZSBpZiBvbiBmaXJlLlxuICAgICAgaWYgKCF0aGlzLm9uRmlyZSkge1xuICAgICAgICB0aGlzLmdhbWUucGh5c2ljcy5hcmNhZGUuY29sbGlkZSh0aGlzLmhlcm8sIHRoaXMuYm90cywgZnVuY3Rpb24oaGVybywgYm90KSB7XG4gICAgICAgICAgaWYgKGhlcm8uYm9keS50b3VjaGluZy5kb3duKSB7XG4gICAgICAgICAgICBib3QubXVyZGVyKCk7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZVNjb3JlKHRoaXMuc2NvcmVCb3QpO1xuICAgICAgICAgICAgaGVyby5ib2R5LnZlbG9jaXR5LnkgPSB0aGlzLmdhbWUucGh5c2ljcy5hcmNhZGUuZ3Jhdml0eS55ICogLTEgKiAwLjU7XG4gICAgICAgICAgfVxuICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgaGVyby5ib3RjaHlNdWRlcigpO1xuICAgICAgICAgICAgYm90Lm11cmRlcigpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSwgbnVsbCwgdGhpcyk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIC8vIFBsYXRmb3JtIGNvbGxpc2lvblxuICAgIHVwZGF0ZUhlcm9QbGF0Zm9ybTogZnVuY3Rpb24oaGVybywgaXRlbSkge1xuICAgICAgLy8gTWFrZSBzdXJlIG5vIGxvbmdlciBvbiBmaXJlXG4gICAgICB0aGlzLnB1dE91dEZpcmUoKTtcblxuICAgICAgLy8gSnVtcFxuICAgICAgaGVyby5ib2R5LnZlbG9jaXR5LnkgPSB0aGlzLmdhbWUucGh5c2ljcy5hcmNhZGUuZ3Jhdml0eS55ICogLTEgKiAwLjc7XG5cbiAgICAgIC8vIElmIGNhcnJvdCwgc25hcFxuICAgICAgaWYgKGl0ZW0gaW5zdGFuY2VvZiBwcmVmYWJzLkNhcnJvdCkge1xuICAgICAgICBpdGVtLnNuYXAoKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLy8gSGFuZGxlIGl0ZW1zXG4gICAgdXBkYXRlSXRlbXM6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGhpZ2hlc3Q7XG4gICAgICB2YXIgYmVhbjtcbiAgICAgIHZhciBjYXJyb3Q7XG5cbiAgICAgIC8vIFJlbW92ZSBhbnkgaXRlbXMgdGhhdCBhcmUgb2ZmIHNjcmVlblxuICAgICAgW1wibWluaXNcIiwgXCJkaWxsc1wiLCBcImJvdHNcIiwgXCJwZXBwZXJzXCIsIFwiYmVhbnNcIiwgXCJjYXJyb3RzXCJdLmZvckVhY2goXy5iaW5kKGZ1bmN0aW9uKHBvb2wpIHtcbiAgICAgICAgdGhpc1twb29sXS5mb3JFYWNoQWxpdmUoZnVuY3Rpb24ocCkge1xuICAgICAgICAgIC8vIENoZWNrIGlmIHRoaXMgb25lIGlzIG9mIHRoZSBzY3JlZW5cbiAgICAgICAgICBpZiAocC55ID4gdGhpcy5jYW1lcmEueSArIHRoaXMuZ2FtZS5oZWlnaHQpIHtcbiAgICAgICAgICAgIHAua2lsbCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSwgdGhpcyk7XG4gICAgICB9LCB0aGlzKSk7XG5cbiAgICAgIC8vIERldGVybWluZSB3aGVyZSB0aGUgbGFzdCBwbGF0Zm9ybSBpc1xuICAgICAgW1wiYmVhbnNcIiwgXCJjYXJyb3RzXCJdLmZvckVhY2goXy5iaW5kKGZ1bmN0aW9uKGdyb3VwKSB7XG4gICAgICAgIHRoaXNbZ3JvdXBdLmZvckVhY2hBbGl2ZShmdW5jdGlvbihwKSB7XG4gICAgICAgICAgaWYgKHAueSA8IHRoaXMucGxhdGZvcm1ZTWluKSB7XG4gICAgICAgICAgICB0aGlzLnBsYXRmb3JtWU1pbiA9IHAueTtcbiAgICAgICAgICAgIGhpZ2hlc3QgPSBwO1xuICAgICAgICAgIH1cbiAgICAgICAgfSwgdGhpcyk7XG4gICAgICB9LCB0aGlzKSk7XG5cbiAgICAgIC8vIEFkZCBuZXcgcGxhdGZvcm0gaWYgbmVlZGVkXG4gICAgICBjYXJyb3QgPSB0aGlzLmNhcnJvdHMuZ2V0Rmlyc3REZWFkKCk7XG4gICAgICBiZWFuID0gdGhpcy5iZWFucy5nZXRGaXJzdERlYWQoKTtcbiAgICAgIGlmIChjYXJyb3QgJiYgYmVhbikge1xuICAgICAgICBpZiAoTWF0aC5yYW5kb20oKSA8IHRoaXMuY2Fycm90Q2hhbmNlKSB7XG4gICAgICAgICAgdGhpcy5wbGFjZVBsYXRmb3JtKGNhcnJvdCwgaGlnaGVzdCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgdGhpcy5wbGFjZVBsYXRmb3JtKGJlYW4sIGhpZ2hlc3QpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcblxuICAgIC8vIFNodXRkb3duXG4gICAgc2h1dGRvd246IGZ1bmN0aW9uKCkge1xuICAgICAgLy8gUmVzZXQgZXZlcnl0aGluZywgb3IgdGhlIHdvcmxkIHdpbGwgYmUgbWVzc2VkIHVwXG4gICAgICB0aGlzLndvcmxkLnNldEJvdW5kcygwLCAwLCB0aGlzLmdhbWUud2lkdGgsIHRoaXMuZ2FtZS5oZWlnaHQpO1xuICAgICAgdGhpcy5jdXJzb3IgPSBudWxsO1xuICAgICAgdGhpcy5yZXNldFZpZXdUcmFja2luZygpO1xuICAgICAgdGhpcy5yZXNldFNjb3JlKCk7XG5cbiAgICAgIFtcImhlcm9cIiwgXCJiZWFuc1wiLCBcIm1pbmlzXCIsIFwiZGlsbHNcIiwgXCJwZXBwZXJzXCIsXG4gICAgICAgIFwiY2Fycm90c1wiLCBcInNjb3JlR3JvdXBcIl0uZm9yRWFjaChfLmJpbmQoZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICBpZiAodGhpc1tpdGVtXSkge1xuICAgICAgICAgIHRoaXNbaXRlbV0uZGVzdHJveSgpO1xuICAgICAgICAgIHRoaXNbaXRlbV0gPSBudWxsO1xuICAgICAgICB9XG4gICAgICB9LCB0aGlzKSk7XG4gICAgfSxcblxuICAgIC8vIEdhbWUgb3ZlclxuICAgIGdhbWVPdmVyOiBmdW5jdGlvbigpIHtcbiAgICAgIC8vIENhbid0IHNlZW0gdG8gZmluZCBhIHdheSB0byBwYXNzIHRoZSBzY29yZVxuICAgICAgLy8gdmlhIGEgc3RhdGUgY2hhbmdlLlxuICAgICAgdGhpcy5nYW1lLnBpY2tsZS5zY29yZSA9IHRoaXMuc2NvcmU7XG4gICAgICB0aGlzLmdhbWUuc3RhdGUuc3RhcnQoXCJnYW1lb3ZlclwiKTtcbiAgICB9LFxuXG4gICAgLy8gQWRkIHBsYXRmb3JtIHBvb2wgYW5kIGNyZWF0ZSBpbml0aWFsIG9uZVxuICAgIGFkZFBsYXRmb3JtczogZnVuY3Rpb24oKSB7XG4gICAgICAvLyBBZGQgYmFzZSBwbGF0Zm9ybSAoamFyKS5cbiAgICAgIHRoaXMuYmFzZSA9IG5ldyBwcmVmYWJzLkphcih0aGlzLmdhbWUsIHRoaXMuZ2FtZS53aWR0aCAqIDAuNSwgdGhpcy5zdGFydFksIHRoaXMuZ2FtZS53aWR0aCAqIDIpO1xuICAgICAgdGhpcy5nYW1lLmFkZC5leGlzdGluZyh0aGlzLmJhc2UpO1xuXG4gICAgICAvLyBBZGQgc29tZSBiYXNlIGNhcnJvdHMgKGJ1dCBoYXZlIHRoZW0gb2ZmIHNjcmVlbilcbiAgICAgIF8uZWFjaChfLnJhbmdlKDEwKSwgXy5iaW5kKGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcCA9IG5ldyBwcmVmYWJzLkNhcnJvdCh0aGlzLmdhbWUsIC05OTksIHRoaXMuZ2FtZS5oZWlnaHQgKiAyKTtcbiAgICAgICAgdGhpcy5jYXJyb3RzLmFkZChwKTtcbiAgICAgIH0sIHRoaXMpKTtcblxuICAgICAgLy8gQWRkIHNvbWUgYmFzZSBiZWFuc1xuICAgICAgdmFyIHByZXZpb3VzO1xuICAgICAgXy5lYWNoKF8ucmFuZ2UoMjApLCBfLmJpbmQoZnVuY3Rpb24oaSkge1xuICAgICAgICB2YXIgcCA9IG5ldyBwcmVmYWJzLkJlYW4odGhpcy5nYW1lLCAwLCAwKTtcbiAgICAgICAgdGhpcy5wbGFjZVBsYXRmb3JtKHAsIHByZXZpb3VzLCB0aGlzLndvcmxkLmhlaWdodCAtIHRoaXMucGxhdGZvcm1TcGFjZVkgLSB0aGlzLnBsYXRmb3JtU3BhY2VZICogaSk7XG4gICAgICAgIHRoaXMuYmVhbnMuYWRkKHApO1xuICAgICAgICBwcmV2aW91cyA9IHA7XG4gICAgICB9LCB0aGlzKSk7XG4gICAgfSxcblxuICAgIC8vIFBsYWNlIHBsYXRmb3JtXG4gICAgcGxhY2VQbGF0Zm9ybTogZnVuY3Rpb24ocGxhdGZvcm0sIHByZXZpb3VzUGxhdGZvcm0sIG92ZXJyaWRlWSwgcGxhdGZvcm1UeXBlKSB7XG4gICAgICBwbGF0Zm9ybS5yZXNldFNldHRpbmdzKCk7XG4gICAgICBwbGF0Zm9ybVR5cGUgPSAocGxhdGZvcm1UeXBlID09PSB1bmRlZmluZWQpID8gXCJiZWFuXCIgOiBwbGF0Zm9ybVR5cGU7XG4gICAgICB2YXIgeSA9IG92ZXJyaWRlWSB8fCB0aGlzLnBsYXRmb3JtWU1pbiAtIHRoaXMucGxhdGZvcm1TcGFjZVk7XG4gICAgICB2YXIgbWluWCA9IHBsYXRmb3JtLm1pblg7XG4gICAgICB2YXIgbWF4WCA9IHBsYXRmb3JtLm1heFg7XG5cbiAgICAgIC8vIERldGVybWluZSB4IGJhc2VkIG9uIHByZXZpb3VzUGxhdGZvcm1cbiAgICAgIHZhciB4ID0gdGhpcy5ybmQuaW50ZWdlckluUmFuZ2UobWluWCwgbWF4WCk7XG4gICAgICBpZiAocHJldmlvdXNQbGF0Zm9ybSkge1xuICAgICAgICB4ID0gdGhpcy5ybmQuaW50ZWdlckluUmFuZ2UocHJldmlvdXNQbGF0Zm9ybS54IC0gdGhpcy5wbGF0Zm9ybUdhcE1heCwgcHJldmlvdXNQbGF0Zm9ybS54ICsgdGhpcy5wbGF0Zm9ybUdhcE1heCk7XG5cbiAgICAgICAgLy8gU29tZSBsb2dpYyB0byB0cnkgdG8gd3JhcFxuICAgICAgICB4ID0gKHggPCAwKSA/IE1hdGgubWluKG1heFgsIHRoaXMud29ybGQud2lkdGggKyB4KSA6IE1hdGgubWF4KHgsIG1pblgpO1xuICAgICAgICB4ID0gKHggPiB0aGlzLndvcmxkLndpZHRoKSA/IE1hdGgubWF4KG1pblgsIHggLSB0aGlzLndvcmxkLndpZHRoKSA6IE1hdGgubWluKHgsIG1heFgpO1xuICAgICAgfVxuXG4gICAgICAvLyBQbGFjZVxuICAgICAgcGxhdGZvcm0ucmVzZXQoeCwgeSk7XG5cbiAgICAgIC8vIEFkZCBzb21lIGZsdWZmXG4gICAgICB0aGlzLmZsdWZmUGxhdGZvcm0ocGxhdGZvcm0pO1xuICAgIH0sXG5cbiAgICAvLyBBZGQgcG9zc2libGUgZmx1ZmYgdG8gcGxhdGZvcm1cbiAgICBmbHVmZlBsYXRmb3JtOiBmdW5jdGlvbihwbGF0Zm9ybSkge1xuICAgICAgdmFyIHggPSBwbGF0Zm9ybS54O1xuICAgICAgdmFyIHkgPSBwbGF0Zm9ybS55IC0gcGxhdGZvcm0uaGVpZ2h0IC8gMiAtIDMwO1xuXG4gICAgICAvLyBBZGQgZmx1ZmZcbiAgICAgIGlmIChNYXRoLnJhbmRvbSgpIDw9IHRoaXMuaG92ZXJDaGFuY2UpIHtcbiAgICAgICAgcGxhdGZvcm0uaG92ZXIgPSB0cnVlO1xuICAgICAgfVxuICAgICAgZWxzZSBpZiAoTWF0aC5yYW5kb20oKSA8PSB0aGlzLm1pbmlDaGFuY2UpIHtcbiAgICAgICAgdGhpcy5hZGRXaXRoUG9vbCh0aGlzLm1pbmlzLCBcIk1pbmlcIiwgeCwgeSk7XG4gICAgICB9XG4gICAgICBlbHNlIGlmIChNYXRoLnJhbmRvbSgpIDw9IHRoaXMuZGlsbENoYW5jZSkge1xuICAgICAgICB0aGlzLmFkZFdpdGhQb29sKHRoaXMuZGlsbHMsIFwiRGlsbFwiLCB4LCB5KTtcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKE1hdGgucmFuZG9tKCkgPD0gdGhpcy5ib3RDaGFuY2UpIHtcbiAgICAgICAgdGhpcy5hZGRXaXRoUG9vbCh0aGlzLmJvdHMsIFwiQm90dWxpc21cIiwgeCwgeSk7XG4gICAgICB9XG4gICAgICBlbHNlIGlmIChNYXRoLnJhbmRvbSgpIDw9IHRoaXMucGVwcGVyQ2hhbmNlKSB7XG4gICAgICAgIHRoaXMuYWRkV2l0aFBvb2wodGhpcy5wZXBwZXJzLCBcIlBlcHBlclwiLCB4LCB5KTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLy8gR2VuZXJpYyBhZGQgd2l0aCBwb29saW5nIGZ1bmN0aW9uYWxsaXR5XG4gICAgYWRkV2l0aFBvb2w6IGZ1bmN0aW9uKHBvb2wsIHByZWZhYiwgeCwgeSkge1xuICAgICAgdmFyIG8gPSBwb29sLmdldEZpcnN0RGVhZCgpO1xuICAgICAgbyA9IG8gfHwgbmV3IHByZWZhYnNbcHJlZmFiXSh0aGlzLmdhbWUsIHgsIHkpO1xuXG4gICAgICAvLyBVc2UgY3VzdG9tIHJlc2V0IGlmIGF2YWlsYWJsZVxuICAgICAgaWYgKG8ucmVzZXRQbGFjZW1lbnQpIHtcbiAgICAgICAgby5yZXNldFBsYWNlbWVudCh4LCB5KTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICBvLnJlc2V0KHgsIHkpO1xuICAgICAgfVxuXG4gICAgICBwb29sLmFkZChvKTtcbiAgICB9LFxuXG4gICAgLy8gVXBkYXRlIHNjb3JlLiAgU2NvcmUgaXMgdGhlIHNjb3JlIHdpdGhvdXQgaG93IGZhciB0aGV5IGhhdmUgZ29uZSB1cC5cbiAgICB1cGRhdGVTY29yZTogZnVuY3Rpb24oYWRkaXRpb24pIHtcbiAgICAgIGFkZGl0aW9uID0gYWRkaXRpb24gfHwgMDtcbiAgICAgIHRoaXMuc2NvcmVVcCA9ICgtdGhpcy5jYW1lcmFZTWluID49IDk5OTk5OTkpID8gMCA6XG4gICAgICAgIE1hdGgubWluKE1hdGgubWF4KDAsIC10aGlzLmNhbWVyYVlNaW4pLCA5OTk5OTk5IC0gMSk7XG4gICAgICB0aGlzLnNjb3JlQ29sbGVjdCA9ICh0aGlzLnNjb3JlQ29sbGVjdCB8fCAwKSArIGFkZGl0aW9uO1xuICAgICAgdGhpcy5zY29yZSA9IE1hdGgucm91bmQodGhpcy5zY29yZVVwICsgdGhpcy5zY29yZUNvbGxlY3QpO1xuXG4gICAgICAvLyBTY29yZSB0ZXh0XG4gICAgICBpZiAoIXRoaXMuc2NvcmVHcm91cCkge1xuICAgICAgICB0aGlzLnNjb3JlR3JvdXAgPSB0aGlzLmdhbWUuYWRkLmdyb3VwKCk7XG5cbiAgICAgICAgLy8gU2NvcmUgbGFiZWxcbiAgICAgICAgLypcbiAgICAgICAgdGhpcy5zY29yZUxhYmVsSW1hZ2UgPSB0aGlzLmdhbWUuYWRkLnNwcml0ZShcbiAgICAgICAgICB0aGlzLnBhZGRpbmcsXG4gICAgICAgICAgdGhpcy5wYWRkaW5nICogMC44NSwgXCJnYW1lLXNwcml0ZXNcIiwgXCJ5b3VyLXNjb3JlLnBuZ1wiKTtcbiAgICAgICAgdGhpcy5zY29yZUxhYmVsSW1hZ2UuYW5jaG9yLnNldFRvKDAsIDApO1xuICAgICAgICB0aGlzLnNjb3JlTGFiZWxJbWFnZS5zY2FsZS5zZXRUbygodGhpcy5nYW1lLndpZHRoIC8gNSkgLyB0aGlzLnNjb3JlTGFiZWxJbWFnZS53aWR0aCk7XG4gICAgICAgIHRoaXMuc2NvcmVHcm91cC5hZGQodGhpcy5zY29yZUxhYmVsSW1hZ2UpO1xuICAgICAgICAqL1xuXG4gICAgICAgIC8vIFNjb3JlIHRleHRcbiAgICAgICAgdGhpcy5zY29yZVRleHQgPSB0aGlzLmdhbWUuYWRkLnRleHQodGhpcy5wYWRkaW5nLCAwLFxuICAgICAgICAgIHRoaXMuc2NvcmUudG9Mb2NhbGVTdHJpbmcoKSwge1xuICAgICAgICAgICAgZm9udDogXCJib2xkIFwiICsgKHRoaXMuZ2FtZS53b3JsZC5oZWlnaHQgLyAzMCkgKyBcInB4IE9tbmVzUm9tYW5cIixcbiAgICAgICAgICAgIGZpbGw6IFwiIzM5YjU0YVwiLFxuICAgICAgICAgICAgYWxpZ246IFwibGVmdFwiLFxuICAgICAgICAgIH0pO1xuICAgICAgICB0aGlzLnNjb3JlVGV4dC5hbmNob3Iuc2V0VG8oMCwgMCk7XG4gICAgICAgIHRoaXMuc2NvcmVUZXh0LnNldFNoYWRvdygxLCAxLCBcInJnYmEoMCwgMCwgMCwgMC4zKVwiLCAyKTtcbiAgICAgICAgdGhpcy5zY29yZUdyb3VwLmFkZCh0aGlzLnNjb3JlVGV4dCk7XG5cbiAgICAgICAgdGhpcy5zY29yZUdyb3VwLmZpeGVkVG9DYW1lcmEgPSB0cnVlO1xuICAgICAgICB0aGlzLnNjb3JlR3JvdXAuY2FtZXJhT2Zmc2V0LnNldFRvKHRoaXMucGFkZGluZywgdGhpcy5wYWRkaW5nKTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICB0aGlzLnNjb3JlVGV4dC50ZXh0ID0gdGhpcy5zY29yZS50b0xvY2FsZVN0cmluZygpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICAvLyBSZXNldCBzY29yZVxuICAgIHJlc2V0U2NvcmU6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zY29yZVVwID0gMDtcbiAgICAgIHRoaXMuc2NvcmVDb2xsZWN0ID0gMDtcbiAgICAgIHRoaXMuc2NvcmUgPSAwO1xuICAgIH0sXG5cbiAgICAvLyBSZXNldCB2aWV3IHRyYWNraW5nXG4gICAgcmVzZXRWaWV3VHJhY2tpbmc6IGZ1bmN0aW9uKCkge1xuICAgICAgLy8gQ2FtZXJhIGFuZCBwbGF0Zm9ybSB0cmFja2luZyB2YXJzXG4gICAgICB0aGlzLmNhbWVyYVlNaW4gPSA5OTk5OTk5O1xuICAgICAgdGhpcy5wbGF0Zm9ybVlNaW4gPSA5OTk5OTk5O1xuICAgIH0sXG5cbiAgICAvLyBHZW5lcmFsIHRvdWNoaW5nXG4gICAgaXNUb3VjaGluZzogZnVuY3Rpb24oYm9keSkge1xuICAgICAgaWYgKGJvZHkgJiYgYm9keS50b3VjaCkge1xuICAgICAgICByZXR1cm4gKGJvZHkudG91Y2hpbmcudXAgfHwgYm9keS50b3VjaGluZy5kb3duIHx8XG4gICAgICAgICAgYm9keS50b3VjaGluZy5sZWZ0IHx8IGJvZHkudG91Y2hpbmcucmlnaHQpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSxcblxuICAgIC8vIERldGVybWluZSBkaWZmaWN1bHR5XG4gICAgdXBkYXRlRGlmZmljdWx0eTogZnVuY3Rpb24oKSB7XG4gICAgICAvLyBJbml0aWFsIHN0YXRlXG4gICAgICB0aGlzLnBsYXRmb3JtU3BhY2VZID0gMTEwO1xuICAgICAgdGhpcy5wbGF0Zm9ybUdhcE1heCA9IDIwMDtcbiAgICAgIHRoaXMuaG92ZXJDaGFuY2UgPSAwLjE7XG4gICAgICB0aGlzLm1pbmlDaGFuY2UgPSAwLjM7XG4gICAgICB0aGlzLmRpbGxDaGFuY2UgPSAwLjM7XG4gICAgICB0aGlzLmJvdENoYW5jZSA9IDA7XG4gICAgICB0aGlzLnBlcHBlckNoYW5jZSA9IDAuMTtcbiAgICAgIHRoaXMuY2Fycm90Q2hhbmNlID0gMC4xO1xuXG4gICAgICAvLyBTZXQgaW5pdGlhbCBiYWNrZ3JvdW5kXG4gICAgICB0aGlzLmdhbWUuc3RhZ2UuYmFja2dyb3VuZENvbG9yID0gXCIjOTM3RDZGXCI7XG5cbiAgICAgIC8vIEluaXRpbGEgcGh5c2ljcyB0aW1lXG4gICAgICAvL3RoaXMuZ2FtZS50aW1lLnNsb3dNb3Rpb24gPSAxO1xuXG4gICAgICAvLyBGaXJzdCBsZXZlbFxuICAgICAgaWYgKCF0aGlzLmNhbWVyYVlNaW4gfHwgdGhpcy5jYW1lcmFZTWluID4gLTIwMDAwKSB7XG4gICAgICAgIC8vIERlZmF1bHRcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBTZWNvbmQgbGV2ZWxcbiAgICAgIGVsc2UgaWYgKHRoaXMuY2FtZXJhWU1pbiA+IC00MDAwMCkge1xuICAgICAgICB0aGlzLmhvdmVyQ2hhbmNlID0gMC4zO1xuICAgICAgICB0aGlzLm1pbmlDaGFuY2UgPSAwLjM7XG4gICAgICAgIHRoaXMuZGlsbENoYW5jZSA9IDAuNDtcbiAgICAgICAgdGhpcy5ib3RDaGFuY2UgPSAwLjI7XG4gICAgICAgIHRoaXMuY2Fycm90Q2hhbmNlID0gMC4yO1xuICAgICAgICB0aGlzLmdhbWUuc3RhZ2UuYmFja2dyb3VuZENvbG9yID0gXCIjQkRERUI2XCI7XG4gICAgICB9XG5cbiAgICAgIC8vIFRoaXJkIGxldmVsXG4gICAgICBlbHNlIGlmICh0aGlzLmNhbWVyYVlNaW4gPiAtNjAwMDApIHtcbiAgICAgICAgdGhpcy5ob3ZlckNoYW5jZSA9IDAuNDtcbiAgICAgICAgdGhpcy5taW5pQ2hhbmNlID0gMC4yO1xuICAgICAgICB0aGlzLmRpbGxDaGFuY2UgPSAwLjQ7XG4gICAgICAgIHRoaXMuYm90Q2hhbmNlID0gMC4zO1xuICAgICAgICB0aGlzLmNhcnJvdENoYW5jZSA9IDAuMztcbiAgICAgICAgdGhpcy5nYW1lLnN0YWdlLmJhY2tncm91bmRDb2xvciA9IFwiI0IxRTBFQ1wiO1xuICAgICAgfVxuXG4gICAgICAvLyBGb3VydGggbGV2ZWxcbiAgICAgIGVsc2Uge1xuICAgICAgICB0aGlzLmJnR3JvdXAudmlzaWJsZSA9IHRydWU7XG4gICAgICAgIHRoaXMuaG92ZXJDaGFuY2UgPSAwLjQ7XG4gICAgICAgIHRoaXMubWluaUNoYW5jZSA9IDAuMjtcbiAgICAgICAgdGhpcy5kaWxsQ2hhbmNlID0gMC40O1xuICAgICAgICB0aGlzLmJvdENoYW5jZSA9IDAuMztcbiAgICAgICAgdGhpcy5jYXJyb3RDaGFuY2UgPSAwLjQ7XG4gICAgICB9XG4gICAgfSxcblxuICAgIC8vIENyZWF0ZSBzdXBlciBsZXZlbCBncmFkaWVudFxuICAgIGNyZWF0ZVN1cGVyTGV2ZWxCRzogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnNsYmdCTSA9IHRoaXMuZ2FtZS5tYWtlLmJpdG1hcERhdGEodGhpcy5nYW1lLndpZHRoLCB0aGlzLmdhbWUuaGVpZ2h0KTtcblxuICAgICAgLy8gQ3JlYXRlIGdyYWRpZW50XG4gICAgICB2YXIgZ3JhZGllbnQgPSB0aGlzLnNsYmdCTS5jb250ZXh0LmNyZWF0ZUxpbmVhckdyYWRpZW50KFxuICAgICAgICAwLCB0aGlzLmdhbWUuaGVpZ2h0IC8gMiwgdGhpcy5nYW1lLndpZHRoLCB0aGlzLmdhbWUuaGVpZ2h0IC8gMik7XG4gICAgICBncmFkaWVudC5hZGRDb2xvclN0b3AoMCwgXCIjNEYzRjlBXCIpO1xuICAgICAgZ3JhZGllbnQuYWRkQ29sb3JTdG9wKDEsIFwiI0U3MEI4RFwiKTtcblxuICAgICAgLy8gQWRkIHRvIGJpdG1hcFxuICAgICAgdGhpcy5zbGJnQk0uY29udGV4dC5maWxsU3R5bGUgPSBncmFkaWVudDtcbiAgICAgIHRoaXMuc2xiZ0JNLmNvbnRleHQuZmlsbFJlY3QoMCwgMCwgdGhpcy5nYW1lLndpZHRoLCB0aGlzLmdhbWUuaGVpZ2h0KTtcblxuICAgICAgLy8gQ3JlYXRlIGJhY2tncm91bmQgZ3JvdXAgc28gdGhhdCB3ZSBjYW4gcHV0IHRoaXMgdGhlcmUgbGF0ZXJcbiAgICAgIHRoaXMuYmdHcm91cCA9IHRoaXMuZ2FtZS5hZGQuZ3JvdXAoKTtcbiAgICAgIHRoaXMuYmdHcm91cC5maXhlZFRvQ2FtZXJhID0gdHJ1ZTtcblxuICAgICAgLy8gQWRkIGNyYXp5IGJhY2tncm91bmQgYW5kIHRoZW4gaGlkZSBzaW5jZSBhZGRpbmcgaW4gbWlkZGxlXG4gICAgICAvLyByZWFsbHkgbWVzc2VzIHdpdGggdGhpbmdzXG4gICAgICB0aGlzLmJnR3JvdXAuY3JlYXRlKDAsIDAsIHRoaXMuc2xiZ0JNKTtcbiAgICAgIHRoaXMuYmdHcm91cC52aXNpYmxlID0gZmFsc2U7XG4gICAgfSxcblxuICAgIC8vIFNldCBvbiBmaXJlXG4gICAgc2V0T25GaXJlOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMub25GaXJlID0gdHJ1ZTtcbiAgICAgIHRoaXMuaGVyby5zZXRPbkZpcmUoKTtcbiAgICB9LFxuXG4gICAgLy8gU2V0IG9mZiBmaXJlXG4gICAgcHV0T3V0RmlyZTogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLm9uRmlyZSA9IGZhbHNlO1xuICAgICAgdGhpcy5oZXJvLnB1dE91dEZpcmUoKTtcbiAgICB9XG4gIH0pO1xuXG4gIC8vIEV4cG9ydFxuICBtb2R1bGUuZXhwb3J0cyA9IFBsYXk7XG59KSgpO1xuIl19
