/**
 * determined-dill - The Determined Dill.
 * @version v0.0.1
 * @link https://github.com/zzolo/pickle-jumper#readme
 * @license MIT
 */
(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/* global _:false, $:false, Phaser:false, WebFont:false */

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

    // Start (load fonts first)
    this.fonts = ["Marketing", "OmnesRoman", "OmnesRoman-bold", "OmnesRoman-900"];
    this.fontUrls = ["dist/pickle-jumper.css"];
    this.loadFonts(this.start);
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
      this.highscoreLimit = this.options.highscoreLimit || 10;
      this.getHighscores();

      // Allow for score reset with keyboard
      this.handleReset();

      // Start with menu
      this.game.state.start("menu");

      // Debug
      if (this.options.debug) {
        this.resetHighscores();
        this.getHighscores();
      }
    },

    // Load fonts.  URLS is relative to HTML, not JS
    loadFonts: function(done) {
      done = _.bind(done, this);

      WebFont.load({
        custom: {
          families: this.fonts
        },
        urls: this.fontUrls,
        classes: false,
        active: done
      });
    },

    // Hide overlay parts
    hideOverlay: function(selector) {
      $(this.options.parentEl).find(selector).hide();
    },

    // Show overlay parts
    showOverlay: function(selector, time) {
      if (time) {
        $(this.options.parentEl).find(selector).fadeIn("fast").delay(time).fadeOut("fast");
      }
      else {
        $(this.options.parentEl).find(selector).show();
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
      this.highscores = [];
      window.localStorage.removeItem("highscores");
    },

    // Key combo reset
    handleReset: function() {
      $(window).on("keyup", _.bind(function(e) {
        // Ctrl + J
        if (e.ctrlKey && (e.which === 74)) {
          this.resetHighscores();

          // Show message
          this.showOverlay(".high-reset", 1000);
        }
      }, this));
    }
  });

  // Create app
  $(document).ready(function() {
    var p;
    p = new Pickle({
      el: "#pickle-jumper",
      parentEl: ".game-wrapper",
      highscoreLimit: 4,
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
      var rx;
      var ry;

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

      // Shake when on fire
      if (this.onFire) {
        rx = this.game.rnd.integerInRange(-4, 4);
        ry = this.game.rnd.integerInRange(-2, 2);
        this.position.x += rx;
        this.position.y += ry;
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
    botchyMurder: function() {
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
      this.yourScoreImage = new Phaser.Sprite(this.game, 0, 0, "gameover-sprites", "your-score.png");
      this.yourScoreImage.anchor.setTo(0.5, 0);
      this.yourScoreImage.scale.setTo(((this.game.width * 0.5) - (this.padding * 6)) / this.yourScoreImage.width);
      this.yourScoreImage.reset(this.centerStageX(this.yourScoreImage),
        this.titleImage.height + (this.padding * 8));

      // Score
      this.scoreText = new Phaser.Text(this.game, 0, 0,
        this.score.toLocaleString(), {
          font: "" + (this.game.world.height / 10) + "px OmnesRoman-900",
          fill: "#39b54a",
          align: "center",
        });
      this.scoreText.anchor.setTo(0.5, 0);
      this.scoreText.reset(this.centerStageX(this.scoreText),
        this.titleImage.height + this.yourScoreImage.height + (this.padding * 7));

      // Add groups
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
          font: "" + (this.game.world.height / 15) + "px OmnesRoman-bold",
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
          font: "" + (this.game.world.height / 15) + "px OmnesRoman-bold",
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
          font: "" + (this.game.world.height / 15) + "px OmnesRoman-bold",
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
      this.highscoreLimit = this.game.pickle.highscoreLimit || 3;
      this.highscoreListGroup = this.game.add.group();
      this.game.pickle.sortHighscores();
      var fontSize = this.game.world.height / 25;
      var baseY = this.titleImage.height + this.yourScoreImage.height +
        this.scoreText.height + this.padding * 10;
      var xOffset = -this.padding * 2;

      // Add label
      this.highscoreListLabel = new Phaser.Text(this.game, 0, 0,
        "High Scores", {
          font: "" + (this.game.world.height / 17.5) + "px OmnesRoman-bold",
          fill: "#b8f4bc",
          align: "right",
        });
      this.highscoreListLabel.anchor.setTo(0.5, 0);
      this.highscoreListLabel.reset(this.centerStageX(this.highscoreListLabel), baseY);
      this.highscoreListGroup.add(this.highscoreListLabel);

      // New base height
      baseY = baseY + this.highscoreListLabel.height + this.padding * 0.25;

      // Add high scores
      if (this.game.pickle.highscores.length > 0) {
        _.each(this.game.pickle.highscores.reverse().slice(0, this.highscoreLimit),
          _.bind(function(h, i) {
          // Name
          var name = new Phaser.Text(
            this.game,
            this.game.width / 2 - this.padding + xOffset,
            baseY + ((fontSize + this.padding / 2) * i),
            h.name, {
              font: "" + fontSize + "px OmnesRoman",
              fill: "#b8f4bc",
              align: "right",
            });
          name.anchor.setTo(1, 0);

          // Score
          var score = new Phaser.Text(
            this.game,
            this.game.width / 2 + this.padding + xOffset,
            baseY + ((fontSize + this.padding / 2) * i),
            h.score.toLocaleString(), {
              font: "" + fontSize + "px OmnesRoman",
              fill: "#b8f4bc",
              align: "left",
            });
          score.anchor.setTo(0, 0);

          // Add to groups
          this.highscoreListGroup.add(name);
          this.highscoreListGroup.add(score);
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

      // Shake
      this.updateWorldShake();

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
            hero.botchyMurder();
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

      // Remove any pool items that are off screen
      ["minis", "dills", "bots", "peppers", "beans", "carrots"].forEach(_.bind(function(pool) {
        this[pool].forEachAlive(function(p) {
          // Check if this one is of the screen
          if (p.y > this.camera.y + this.game.height) {
            p.kill();
          }
        }, this);
      }, this));

      // Remove any regular items that are off screen
      ["base"].forEach(_.bind(function(p) {
        if (this[p] && this[p].alive && this[p].y > this.camera.y + this.game.height * 2) {
          this[p].kill();
        }
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
        if (this.chance("platforms") === "carrot") {
          this.placePlatform(carrot, highest, undefined, "carrot");
        }
        else {
          this.placePlatform(bean, highest, undefined, "bean");
        }
      }
    },

    // Shake world effect
    updateWorldShake: function() {
      if (this.shakeWorldCounter > 0) {
        var magnitude = Math.max(this.shakeWorldCounter / 50, 1) + 1;
        var rx = this.game.rnd.integerInRange(-4 * magnitude, 4 * magnitude);
        var ry = this.game.rnd.integerInRange(-2 * magnitude, 2 * magnitude);
        this.game.camera.x += rx;
        this.game.camera.y += ry;
        this.shakeWorldCounter--;

        if (this.shakeWorldCounter <= 0) {
          this.game.camera.x = 0;
          this.game.camera.y = 0;
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

    // Shake world
    shake: function(length) {
      this.shakeWorldCounter = (!length) ? 0 : this.shakeWorldCounter + length;
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
      this.fluffPlatform(platform, platformType);
    },

    // Add possible fluff to platform
    fluffPlatform: function(platform, platformType) {
      var x = platform.x;
      var y = platform.y - platform.height / 2 - 30;
      var itemChance = this.chance(platformType + "Items");

      // Hover.  Don't Add items
      if (this.chance("hover") === "hover") {
        platform.hover = true;
        return;
      }

      // Items
      if (itemChance === "mini") {
        this.addWithPool(this.minis, "Mini", x, y);
      }
      else if (itemChance === "dill") {
        this.addWithPool(this.dills, "Dill", x, y);
      }
      else if (itemChance === "pepper") {
        this.addWithPool(this.peppers, "Pepper", x, y);
      }
      else if (itemChance === "bot") {
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

        // Score text
        this.scoreText = new Phaser.Text(this.game, this.padding, 0,
          this.score.toLocaleString(), {
            font: "" + (this.game.world.height / 30) + "px OmnesRoman-bold",
            fill: "#39b54a",
            align: "left",
          });
        this.scoreText.anchor.setTo(0, 0);
        this.scoreText.setShadow(1, 1, "rgba(0, 0, 0, 0.3)", 2);

        // Fix score to top
        this.scoreGroup.fixedToCamera = true;
        this.scoreGroup.cameraOffset.setTo(this.padding, this.padding);

        // Hack around font-loading issues
        _.delay(_.bind(function() {
          this.scoreGroup.add(this.scoreText);
        }, this), 1000);
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

    // Initial/base difficulty.  Chance is propbablity.  Each set is additive
    // so it does not have to add to 1, but it's easier to think in this
    // way.
    chances: {
      platforms: [
        ["carrot", 0],
        ["bean", 1]
      ],
      hover: [
        ["none", 15],
        ["hover", 1]
      ],
      carrotItems: [
        ["none", 1],
        ["mini", 0],
        ["dill", 0],
        ["pepper", 0],
        ["bot", 0]
      ],
      beanItems: [
        ["none", 10],
        ["mini", 3],
        ["dill", 1],
        ["pepper", 0],
        ["bot", 0]
      ]
    },

    // Levels.  Level id, amount up
    levels: [
      [0, -100],
      [1, -20000],
      [2, -45000],
      [3, -80000],
      [4, -120000],
      [5, -999999]
    ],

    // Current level
    currentLevel: 0,

    // Determine difficulty
    updateDifficulty: function() {
      var chances;

      // Calculate level
      this.currentLevel = _.find(this.levels, _.bind(function(l) {
        return (l[0] === 0 && !this.cameraYMin) || (this.cameraYMin > l[1]);
      }, this));

      this.currentLevel = this.currentLevel ? this.currentLevel[0] : this.levels[this.levels.length - 1][0];

      // Determine if we need to update level
      if (!_.isUndefined(this.previousLevel) && this.previousLevel === this.currentLevel) {
        return;
      }

      // Other difficult settings
      this.platformSpaceY = 110;
      this.platformGapMax = 200;

      // Set initial background
      this.game.stage.backgroundColor = "#b8f4bc";

      // Zero level (initial screen)
      if (this.currentLevel === 0) {
        // Default
        chances = _.extend({}, this.chances);
      }

      // First level
      else if (this.currentLevel === 1) {
        chances = {
          platforms: [
            ["carrot", 1],
            ["bean", 15]
          ],
          hover: [
            ["none", 9],
            ["hover", 1]
          ],
          beanItems: [
            ["none", 15],
            ["mini", 5],
            ["dill", 5],
            ["pepper", 1],
            ["bot", 1]
          ],
          carrotItems: [
            ["none", 15],
            ["mini", 5],
            ["dill", 5],
            ["pepper", 1],
            ["bot", 1]
          ]
        };
      }

      // Second level
      else if (this.currentLevel === 2) {
        this.game.stage.backgroundColor = "#88d1d0";

        chances = {
          platforms: [
            ["carrot", 1],
            ["bean", 9]
          ],
          hover: [
            ["none", 8],
            ["hover", 1]
          ],
          carrotItems: [
            ["none", 8],
            ["mini", 2.5],
            ["dill", 2],
            ["pepper", 1],
            ["bot", 1.5]
          ],
          beanItems: [
            ["none", 8],
            ["mini", 2.5],
            ["dill", 2],
            ["pepper", 1],
            ["bot", 1.5]
          ]
        };
      }

      // Third level
      else if (this.currentLevel === 3) {
        this.game.stage.backgroundColor = "#59acc6";

        chances = {
          platforms: [
            ["carrot", 4],
            ["bean", 6]
          ],
          hover: [
            ["none", 7],
            ["hover", 1]
          ],
          carrotItems: [
            ["none", 6],
            ["mini", 1],
            ["dill", 2],
            ["pepper", 0.5],
            ["bot", 2]
          ],
          beanItems: [
            ["none", 6],
            ["mini", 1],
            ["dill", 2],
            ["pepper", 0.5],
            ["bot", 2]
          ]
        };
      }

      // Fourth level
      else if (this.currentLevel === 4) {
        this.bgGroup.visible = true;

        chances = {
          platforms: [
            ["carrot", 8],
            ["bean", 2]
          ],
          hover: [
            ["none", 7],
            ["hover", 1]
          ],
          carrotItems: [
            ["none", 3],
            ["mini", 1],
            ["dill", 2],
            ["pepper", 0.5],
            ["bot", 3]
          ],
          beanItems: [
            ["none", 3],
            ["mini", 1],
            ["dill", 2],
            ["pepper", 0.5],
            ["bot", 3]
          ]
        };
      }

      // Fourth level
      else {
        this.bgGroup.visible = false;
        this.game.stage.backgroundColor = "#121212";

        chances = {
          platforms: [
            ["carrot", 30],
            ["bean", 1]
          ],
          hover: [
            ["none", 4],
            ["hover", 1]
          ],
          carrotItems: [
            ["none", 0],
            ["mini", 0],
            ["dill", 0],
            ["pepper", 0],
            ["bot", 1]
          ],
          beanItems: [
            ["none", 0],
            ["mini", 0],
            ["dill", 0],
            ["pepper", 0],
            ["bot", 1]
          ]
        };
      }

      // Make chance function
      this.generateChance(chances);

      // Keep track of level to see if it changes
      this.previousLevel = this.currentLevel;
    },

    // Generate chance function
    generateChance: function(chances) {
      // Add up sets
      var sets = {};
      _.each(chances, function(set, si) {
        // Get total
        var total = _.reduce(set, function(total, chance) {
          return total + chance[1];
        }, 0);

        // Create new array with min and max
        var items = [];
        _.reduce(set, function(total, chance) {
          items.push({
            min: total,
            max: total + chance[1],
            val: chance[0]
          });

          return total + chance[1];
        }, 0);

        sets[si] = {
          total: total,
          random: function() {
            return Math.random() * total;
          },

          items: items
        };
      });

      // Make function
      this.chance = function(set) {
        var c = sets[set].random();
        var f = _.find(sets[set].items, function(i) {
          return (c >= i.min && c < i.max);
        });

        return f.val;
      };

      /*
      _.each(_.range(100), _.bind(function() {
        console.log(this.chance("beanItems"));
      }, this));
      */
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy96em9sby9Db2RlL3BlcnNvbmFsL2RldGVybWluZWQtZGlsbC9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL3p6b2xvL0NvZGUvcGVyc29uYWwvZGV0ZXJtaW5lZC1kaWxsL2pzL2Zha2VfODYyMjQ1YTguanMiLCIvVXNlcnMvenpvbG8vQ29kZS9wZXJzb25hbC9kZXRlcm1pbmVkLWRpbGwvanMvcGlja2xlLWp1bXBlci9wcmVmYWItYmVhbi5qcyIsIi9Vc2Vycy96em9sby9Db2RlL3BlcnNvbmFsL2RldGVybWluZWQtZGlsbC9qcy9waWNrbGUtanVtcGVyL3ByZWZhYi1ib3R1bGlzbS5qcyIsIi9Vc2Vycy96em9sby9Db2RlL3BlcnNvbmFsL2RldGVybWluZWQtZGlsbC9qcy9waWNrbGUtanVtcGVyL3ByZWZhYi1jYXJyb3QuanMiLCIvVXNlcnMvenpvbG8vQ29kZS9wZXJzb25hbC9kZXRlcm1pbmVkLWRpbGwvanMvcGlja2xlLWp1bXBlci9wcmVmYWItZGlsbC5qcyIsIi9Vc2Vycy96em9sby9Db2RlL3BlcnNvbmFsL2RldGVybWluZWQtZGlsbC9qcy9waWNrbGUtanVtcGVyL3ByZWZhYi1oZXJvLmpzIiwiL1VzZXJzL3p6b2xvL0NvZGUvcGVyc29uYWwvZGV0ZXJtaW5lZC1kaWxsL2pzL3BpY2tsZS1qdW1wZXIvcHJlZmFiLWphci5qcyIsIi9Vc2Vycy96em9sby9Db2RlL3BlcnNvbmFsL2RldGVybWluZWQtZGlsbC9qcy9waWNrbGUtanVtcGVyL3ByZWZhYi1taW5pLmpzIiwiL1VzZXJzL3p6b2xvL0NvZGUvcGVyc29uYWwvZGV0ZXJtaW5lZC1kaWxsL2pzL3BpY2tsZS1qdW1wZXIvcHJlZmFiLXBlcHBlci5qcyIsIi9Vc2Vycy96em9sby9Db2RlL3BlcnNvbmFsL2RldGVybWluZWQtZGlsbC9qcy9waWNrbGUtanVtcGVyL3N0YXRlLWdhbWVvdmVyLmpzIiwiL1VzZXJzL3p6b2xvL0NvZGUvcGVyc29uYWwvZGV0ZXJtaW5lZC1kaWxsL2pzL3BpY2tsZS1qdW1wZXIvc3RhdGUtbWVudS5qcyIsIi9Vc2Vycy96em9sby9Db2RlL3BlcnNvbmFsL2RldGVybWluZWQtZGlsbC9qcy9waWNrbGUtanVtcGVyL3N0YXRlLXBsYXkuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0V0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qIGdsb2JhbCBfOmZhbHNlLCAkOmZhbHNlLCBQaGFzZXI6ZmFsc2UsIFdlYkZvbnQ6ZmFsc2UgKi9cblxuLyoqXG4gKiBNYWluIEpTIGZvciBQaWNrbGUgSnVtcGVyXG4gKi9cblxuKGZ1bmN0aW9uKCkge1xuICBcInVzZSBzdHJpY3RcIjtcblxuICAvLyBEZXBlbmRlbmNpZXNcbiAgdmFyIHN0YXRlcyA9IHtcbiAgICBHYW1lb3ZlcjogcmVxdWlyZShcIi4vcGlja2xlLWp1bXBlci9zdGF0ZS1nYW1lb3Zlci5qc1wiKSxcbiAgICBQbGF5OiByZXF1aXJlKFwiLi9waWNrbGUtanVtcGVyL3N0YXRlLXBsYXkuanNcIiksXG4gICAgTWVudTogcmVxdWlyZShcIi4vcGlja2xlLWp1bXBlci9zdGF0ZS1tZW51LmpzXCIpLFxuICB9O1xuXG4gIC8vIENvbnN0cnVjdG9yZSBmb3IgUGlja2xlXG4gIHZhciBQaWNrbGUgPSB3aW5kb3cuUGlja2xlID0gZnVuY3Rpb24ob3B0aW9ucykge1xuICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG4gICAgdGhpcy5lbCA9IHRoaXMub3B0aW9ucy5lbDtcbiAgICB0aGlzLiRlbCA9ICQodGhpcy5vcHRpb25zLmVsKTtcbiAgICB0aGlzLiQgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiAkKG9wdGlvbnMuZWwpLmZpbmQ7XG4gICAgfTtcblxuICAgIHRoaXMud2lkdGggPSB0aGlzLiRlbC53aWR0aCgpO1xuICAgIHRoaXMuaGVpZ2h0ID0gJCh3aW5kb3cpLmhlaWdodCgpO1xuXG4gICAgLy8gU3RhcnQgKGxvYWQgZm9udHMgZmlyc3QpXG4gICAgdGhpcy5mb250cyA9IFtcIk1hcmtldGluZ1wiLCBcIk9tbmVzUm9tYW5cIiwgXCJPbW5lc1JvbWFuLWJvbGRcIiwgXCJPbW5lc1JvbWFuLTkwMFwiXTtcbiAgICB0aGlzLmZvbnRVcmxzID0gW1wiZGlzdC9waWNrbGUtanVtcGVyLmNzc1wiXTtcbiAgICB0aGlzLmxvYWRGb250cyh0aGlzLnN0YXJ0KTtcbiAgfTtcblxuICAvLyBBZGQgcHJvcGVydGllc1xuICBfLmV4dGVuZChQaWNrbGUucHJvdG90eXBlLCB7XG4gICAgLy8gU3RhcnQgZXZlcnl0aGluZ1xuICAgIHN0YXJ0OiBmdW5jdGlvbigpIHtcbiAgICAgIC8vIENyZWF0ZSBQaGFzZXIgZ2FtZVxuICAgICAgdGhpcy5nYW1lID0gbmV3IFBoYXNlci5HYW1lKFxuICAgICAgICB0aGlzLndpZHRoLFxuICAgICAgICB0aGlzLmhlaWdodCxcbiAgICAgICAgUGhhc2VyLkFVVE8sXG4gICAgICAgIHRoaXMuZWwucmVwbGFjZShcIiNcIiwgXCJcIikpO1xuXG4gICAgICAvLyBBZGQgcmVmZXJlbmNlIHRvIGdhbWUsIHNpbmNlIG1vc3QgcGFydHMgaGF2ZSB0aGlzIHJlZmVyZW5jZVxuICAgICAgLy8gYWxyZWFkeVxuICAgICAgdGhpcy5nYW1lLnBpY2tsZSA9IHRoaXM7XG5cbiAgICAgIC8vIFJlZ2lzdGVyIHN0YXRlc1xuICAgICAgdGhpcy5nYW1lLnN0YXRlLmFkZChcIm1lbnVcIiwgc3RhdGVzLk1lbnUpO1xuICAgICAgdGhpcy5nYW1lLnN0YXRlLmFkZChcInBsYXlcIiwgc3RhdGVzLlBsYXkpO1xuICAgICAgdGhpcy5nYW1lLnN0YXRlLmFkZChcImdhbWVvdmVyXCIsIHN0YXRlcy5HYW1lb3Zlcik7XG5cbiAgICAgIC8vIEhpZ2hzY29yZVxuICAgICAgdGhpcy5oaWdoc2NvcmVMaW1pdCA9IHRoaXMub3B0aW9ucy5oaWdoc2NvcmVMaW1pdCB8fCAxMDtcbiAgICAgIHRoaXMuZ2V0SGlnaHNjb3JlcygpO1xuXG4gICAgICAvLyBBbGxvdyBmb3Igc2NvcmUgcmVzZXQgd2l0aCBrZXlib2FyZFxuICAgICAgdGhpcy5oYW5kbGVSZXNldCgpO1xuXG4gICAgICAvLyBTdGFydCB3aXRoIG1lbnVcbiAgICAgIHRoaXMuZ2FtZS5zdGF0ZS5zdGFydChcIm1lbnVcIik7XG5cbiAgICAgIC8vIERlYnVnXG4gICAgICBpZiAodGhpcy5vcHRpb25zLmRlYnVnKSB7XG4gICAgICAgIHRoaXMucmVzZXRIaWdoc2NvcmVzKCk7XG4gICAgICAgIHRoaXMuZ2V0SGlnaHNjb3JlcygpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICAvLyBMb2FkIGZvbnRzLiAgVVJMUyBpcyByZWxhdGl2ZSB0byBIVE1MLCBub3QgSlNcbiAgICBsb2FkRm9udHM6IGZ1bmN0aW9uKGRvbmUpIHtcbiAgICAgIGRvbmUgPSBfLmJpbmQoZG9uZSwgdGhpcyk7XG5cbiAgICAgIFdlYkZvbnQubG9hZCh7XG4gICAgICAgIGN1c3RvbToge1xuICAgICAgICAgIGZhbWlsaWVzOiB0aGlzLmZvbnRzXG4gICAgICAgIH0sXG4gICAgICAgIHVybHM6IHRoaXMuZm9udFVybHMsXG4gICAgICAgIGNsYXNzZXM6IGZhbHNlLFxuICAgICAgICBhY3RpdmU6IGRvbmVcbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvLyBIaWRlIG92ZXJsYXkgcGFydHNcbiAgICBoaWRlT3ZlcmxheTogZnVuY3Rpb24oc2VsZWN0b3IpIHtcbiAgICAgICQodGhpcy5vcHRpb25zLnBhcmVudEVsKS5maW5kKHNlbGVjdG9yKS5oaWRlKCk7XG4gICAgfSxcblxuICAgIC8vIFNob3cgb3ZlcmxheSBwYXJ0c1xuICAgIHNob3dPdmVybGF5OiBmdW5jdGlvbihzZWxlY3RvciwgdGltZSkge1xuICAgICAgaWYgKHRpbWUpIHtcbiAgICAgICAgJCh0aGlzLm9wdGlvbnMucGFyZW50RWwpLmZpbmQoc2VsZWN0b3IpLmZhZGVJbihcImZhc3RcIikuZGVsYXkodGltZSkuZmFkZU91dChcImZhc3RcIik7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgJCh0aGlzLm9wdGlvbnMucGFyZW50RWwpLmZpbmQoc2VsZWN0b3IpLnNob3coKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLy8gR2V0IGhpZ2ggc2NvcmVzXG4gICAgZ2V0SGlnaHNjb3JlczogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgcyA9IHdpbmRvdy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbShcImhpZ2hzY29yZXNcIik7XG4gICAgICBzID0gKHMpID8gSlNPTi5wYXJzZShzKSA6IFtdO1xuICAgICAgdGhpcy5oaWdoc2NvcmVzID0gcztcbiAgICAgIHRoaXMuc29ydEhpZ2hzY29yZXMoKTtcbiAgICAgIHJldHVybiB0aGlzLmhpZ2hzY29yZXM7XG4gICAgfSxcblxuICAgIC8vIEdldCBoaWdoZXN0IHNjb3JlXG4gICAgZ2V0SGlnaHNjb3JlOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBfLm1heCh0aGlzLmhpZ2hzY29yZXMsIFwic2NvcmVcIik7XG4gICAgfSxcblxuICAgIC8vIFNldCBzaW5nbGUgaGlnaHNjb3JlXG4gICAgc2V0SGlnaHNjb3JlOiBmdW5jdGlvbihzY29yZSwgbmFtZSkge1xuICAgICAgaWYgKHRoaXMuaXNIaWdoc2NvcmUoc2NvcmUpKSB7XG4gICAgICAgIHRoaXMuc29ydEhpZ2hzY29yZXMoKTtcblxuICAgICAgICAvLyBSZW1vdmUgbG93ZXN0IG9uZSBpZiBuZWVkZWRcbiAgICAgICAgaWYgKHRoaXMuaGlnaHNjb3Jlcy5sZW5ndGggPj0gdGhpcy5oaWdoc2NvcmVMaW1pdCkge1xuICAgICAgICAgIHRoaXMuaGlnaHNjb3Jlcy5zaGlmdCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQWRkIG5ldyBzY29yZVxuICAgICAgICB0aGlzLmhpZ2hzY29yZXMucHVzaCh7XG4gICAgICAgICAgbmFtZTogbmFtZSxcbiAgICAgICAgICBzY29yZTogc2NvcmVcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gU29ydCBhbmQgc2V0XG4gICAgICAgIHRoaXMuc29ydEhpZ2hzY29yZXMoKTtcbiAgICAgICAgdGhpcy5zZXRIaWdoc2NvcmVzKCk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIC8vIFNvcnQgaGlnaHNjb3Jlc1xuICAgIHNvcnRIaWdoc2NvcmVzOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuaGlnaHNjb3JlcyA9IF8uc29ydEJ5KHRoaXMuaGlnaHNjb3JlcywgXCJzY29yZVwiKTtcbiAgICB9LFxuXG4gICAgLy8gSXMgaGlnaHNjb3JlLiAgSXMgdGhlIHNjb3JlIGhpZ2hlciB0aGFuIHRoZSBsb3dlc3RcbiAgICAvLyByZWNvcmRlZCBzY29yZVxuICAgIGlzSGlnaHNjb3JlOiBmdW5jdGlvbihzY29yZSkge1xuICAgICAgdmFyIG1pbiA9IF8ubWluKHRoaXMuaGlnaHNjb3JlcywgXCJzY29yZVwiKS5zY29yZTtcbiAgICAgIHJldHVybiAoc2NvcmUgPiBtaW4gfHwgdGhpcy5oaWdoc2NvcmVzLmxlbmd0aCA8IHRoaXMuaGlnaHNjb3JlTGltaXQpO1xuICAgIH0sXG5cbiAgICAvLyBDaGVjayBpZiBzY29yZSBpcyBoaWdoZXN0IHNjb3JlXG4gICAgaXNIaWdoZXN0U2NvcmU6IGZ1bmN0aW9uKHNjb3JlKSB7XG4gICAgICB2YXIgbWF4ID0gXy5tYXgodGhpcy5oaWdoc2NvcmVzLCBcInNjb3JlXCIpLnNjb3JlIHx8IDA7XG4gICAgICByZXR1cm4gKHNjb3JlID4gbWF4KTtcbiAgICB9LFxuXG4gICAgLy8gU2V0IGhpZ2hzY29yZXNcbiAgICBzZXRIaWdoc2NvcmVzOiBmdW5jdGlvbigpIHtcbiAgICAgIHdpbmRvdy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbShcImhpZ2hzY29yZXNcIiwgSlNPTi5zdHJpbmdpZnkodGhpcy5oaWdoc2NvcmVzKSk7XG4gICAgfSxcblxuICAgIC8vIFJlc2V0IGhpZ2hzY2hvcmVzXG4gICAgcmVzZXRIaWdoc2NvcmVzOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuaGlnaHNjb3JlcyA9IFtdO1xuICAgICAgd2luZG93LmxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKFwiaGlnaHNjb3Jlc1wiKTtcbiAgICB9LFxuXG4gICAgLy8gS2V5IGNvbWJvIHJlc2V0XG4gICAgaGFuZGxlUmVzZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgJCh3aW5kb3cpLm9uKFwia2V5dXBcIiwgXy5iaW5kKGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgLy8gQ3RybCArIEpcbiAgICAgICAgaWYgKGUuY3RybEtleSAmJiAoZS53aGljaCA9PT0gNzQpKSB7XG4gICAgICAgICAgdGhpcy5yZXNldEhpZ2hzY29yZXMoKTtcblxuICAgICAgICAgIC8vIFNob3cgbWVzc2FnZVxuICAgICAgICAgIHRoaXMuc2hvd092ZXJsYXkoXCIuaGlnaC1yZXNldFwiLCAxMDAwKTtcbiAgICAgICAgfVxuICAgICAgfSwgdGhpcykpO1xuICAgIH1cbiAgfSk7XG5cbiAgLy8gQ3JlYXRlIGFwcFxuICAkKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpIHtcbiAgICB2YXIgcDtcbiAgICBwID0gbmV3IFBpY2tsZSh7XG4gICAgICBlbDogXCIjcGlja2xlLWp1bXBlclwiLFxuICAgICAgcGFyZW50RWw6IFwiLmdhbWUtd3JhcHBlclwiLFxuICAgICAgaGlnaHNjb3JlTGltaXQ6IDQsXG4gICAgICBkZWJ1ZzogZmFsc2VcbiAgICB9KTtcbiAgfSk7XG59KSgpO1xuIiwiLyogZ2xvYmFsIF86ZmFsc2UsIFBoYXNlcjpmYWxzZSAqL1xuXG4vKipcbiAqIFByZWZhYiBiZWFuIHBsYXRmb3JtXG4gKi9cblxuKGZ1bmN0aW9uKCkge1xuICBcInVzZSBzdHJpY3RcIjtcblxuICAvLyBDb25zdHJ1Y3RvclxuICB2YXIgQmVhbiA9IGZ1bmN0aW9uKGdhbWUsIHgsIHkpIHtcbiAgICAvLyBDYWxsIGRlZmF1bHQgc3ByaXRlXG4gICAgUGhhc2VyLlNwcml0ZS5jYWxsKHRoaXMsIGdhbWUsIHgsIHksIFwiZ2FtZS1zcHJpdGVzXCIsIFwiZGlsbHliZWFuLnBuZ1wiKTtcblxuICAgIC8vIENvbmZpZ3VyZVxuICAgIHRoaXMuYW5jaG9yLnNldFRvKDAuNSwgMC41KTtcbiAgICB0aGlzLnNjYWxlLnNldFRvKCh0aGlzLmdhbWUud2lkdGggLyA1KSAvIHRoaXMud2lkdGgpO1xuICAgIHRoaXMuaG92ZXIgPSBmYWxzZTtcbiAgICB0aGlzLnNldEhvdmVyU3BlZWQoMTAwKTtcblxuICAgIC8vIFBoeXNpY3NcbiAgICB0aGlzLmdhbWUucGh5c2ljcy5hcmNhZGUuZW5hYmxlQm9keSh0aGlzKTtcbiAgICB0aGlzLmJvZHkuYWxsb3dHcmF2aXR5ID0gZmFsc2U7XG4gICAgdGhpcy5ib2R5LmltbW92YWJsZSA9IHRydWU7XG5cbiAgICAvLyBPbmx5IGFsbG93IGZvciBjb2xsaXNzaW9uIHVwXG4gICAgdGhpcy5ib2R5LmNoZWNrQ29sbGlzaW9uLnVwID0gdHJ1ZTtcbiAgICB0aGlzLmJvZHkuY2hlY2tDb2xsaXNpb24uZG93biA9IGZhbHNlO1xuICAgIHRoaXMuYm9keS5jaGVja0NvbGxpc2lvbi5sZWZ0ID0gZmFsc2U7XG4gICAgdGhpcy5ib2R5LmNoZWNrQ29sbGlzaW9uLnJpZ2h0ID0gZmFsc2U7XG5cbiAgICAvLyBEZXRlcm1pbmUgYW5jaG9yIHggYm91bmRzXG4gICAgdGhpcy5wYWRkaW5nWCA9IDEwO1xuICAgIHRoaXMuZ2V0QW5jaG9yQm91bmRzWCgpO1xuICB9O1xuXG4gIC8vIEV4dGVuZCBmcm9tIFNwcml0ZVxuICBCZWFuLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUGhhc2VyLlNwcml0ZS5wcm90b3R5cGUpO1xuICBCZWFuLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEJlYW47XG5cbiAgLy8gQWRkIG1ldGhvZHNcbiAgXy5leHRlbmQoQmVhbi5wcm90b3R5cGUsIHtcbiAgICB1cGRhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKHRoaXMuaG92ZXIpIHtcbiAgICAgICAgdGhpcy5ib2R5LnZlbG9jaXR5LnggPSB0aGlzLmJvZHkudmVsb2NpdHkueCB8fCB0aGlzLmhvdmVyU3BlZWQ7XG4gICAgICAgIHRoaXMuYm9keS52ZWxvY2l0eS54ID0gKHRoaXMueCA8PSB0aGlzLm1pblgpID8gdGhpcy5ob3ZlclNwZWVkIDpcbiAgICAgICAgICAodGhpcy54ID49IHRoaXMubWF4WCkgPyAtdGhpcy5ob3ZlclNwZWVkIDogdGhpcy5ib2R5LnZlbG9jaXR5Lng7XG4gICAgICB9XG4gICAgfSxcblxuICAgIC8vIFNldCBob3ZlciBzcGVlZC4gIEFkZCBhIGJpdCBvZiB2YXJpYW5jZVxuICAgIHNldEhvdmVyU3BlZWQ6IGZ1bmN0aW9uKHNwZWVkKSB7XG4gICAgICB0aGlzLmhvdmVyU3BlZWQgPSBzcGVlZCArIHRoaXMuZ2FtZS5ybmQuaW50ZWdlckluUmFuZ2UoLTUwLCA1MCk7XG4gICAgfSxcblxuICAgIC8vIEdldCBhbmNob3IgYm91bmRzXG4gICAgZ2V0QW5jaG9yQm91bmRzWDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLm1pblggPSB0aGlzLnBhZGRpbmdYICsgKHRoaXMud2lkdGggLyAyKTtcbiAgICAgIHRoaXMubWF4WCA9IHRoaXMuZ2FtZS53aWR0aCAtICh0aGlzLnBhZGRpbmdYICsgKHRoaXMud2lkdGggLyAyKSk7XG4gICAgICByZXR1cm4gW3RoaXMubWluWCwgdGhpcy5tYXhYXTtcbiAgICB9LFxuXG4gICAgLy8gUmVzZXQgdGhpbmdzXG4gICAgcmVzZXRTZXR0aW5nczogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnJlc2V0KDAsIDApO1xuICAgICAgdGhpcy5ib2R5LnZlbG9jaXR5LnggPSAwO1xuICAgICAgdGhpcy5ob3ZlciA9IGZhbHNlO1xuICAgICAgdGhpcy5nZXRBbmNob3JCb3VuZHNYKCk7XG4gICAgfVxuICB9KTtcblxuICAvLyBFeHBvcnRcbiAgbW9kdWxlLmV4cG9ydHMgPSBCZWFuO1xufSkoKTtcbiIsIi8qIGdsb2JhbCBfOmZhbHNlLCBQaGFzZXI6ZmFsc2UgKi9cblxuLyoqXG4gKiBQcmVmYWIgZm9yIEJvdHVsaXNtLCB0aGUgYmFkIGR1ZGVzXG4gKi9cblxuKGZ1bmN0aW9uKCkge1xuICBcInVzZSBzdHJpY3RcIjtcblxuICAvLyBDb25zdHJ1Y3RvclxuICB2YXIgQm90dWxpc20gPSBmdW5jdGlvbihnYW1lLCB4LCB5KSB7XG4gICAgLy8gQ2FsbCBkZWZhdWx0IHNwcml0ZVxuICAgIFBoYXNlci5TcHJpdGUuY2FsbCh0aGlzLCBnYW1lLCB4LCB5LCBcImdhbWUtc3ByaXRlc1wiLCBcImJvdGNoeS5wbmdcIik7XG5cbiAgICAvLyBTaXplXG4gICAgdGhpcy5hbmNob3Iuc2V0VG8oMC41LCAwLjUpO1xuICAgIHRoaXMuc2NhbGUuc2V0VG8oKHRoaXMuZ2FtZS53aWR0aCAvIDEwKSAvIHRoaXMud2lkdGgpO1xuXG4gICAgLy8gQ29uZmlndXJlXG4gICAgdGhpcy5ob3ZlciA9IHRydWU7XG4gICAgdGhpcy5zZXRIb3ZlclNwZWVkKDEwMCk7XG4gICAgdGhpcy5ob3ZlclJhbmdlID0gMTAwO1xuXG4gICAgLy8gUGh5c2ljc1xuICAgIHRoaXMuZ2FtZS5waHlzaWNzLmFyY2FkZS5lbmFibGVCb2R5KHRoaXMpO1xuICAgIHRoaXMuYm9keS5hbGxvd0dyYXZpdHkgPSBmYWxzZTtcbiAgICB0aGlzLmJvZHkuaW1tb3ZhYmxlID0gdHJ1ZTtcblxuICAgIC8vIE1ha2UgdGhlIGNvbGxpc2lvbiBib2R5IGEgYml0IHNtYWxsZXJcbiAgICB2YXIgYm9keVNjYWxlID0gMC44O1xuICAgIHRoaXMuYm9keS5zZXRTaXplKHRoaXMud2lkdGggKiBib2R5U2NhbGUsIHRoaXMuaGVpZ2h0ICogYm9keVNjYWxlLFxuICAgICAgKHRoaXMud2lkdGggLSAodGhpcy53aWR0aCAqIGJvZHlTY2FsZSkpIC8gMixcbiAgICAgICh0aGlzLmhlaWdodCAtICh0aGlzLmhlaWdodCAqIGJvZHlTY2FsZSkpIC8gMik7XG5cbiAgICAvLyBEZXRlcm1pbmUgYW5jaG9yIHggYm91bmRzXG4gICAgdGhpcy5wYWRkaW5nWCA9IDEwO1xuICAgIHRoaXMucmVzZXRQbGFjZW1lbnQoeCwgeSk7XG4gIH07XG5cbiAgLy8gRXh0ZW5kIGZyb20gU3ByaXRlXG4gIEJvdHVsaXNtLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUGhhc2VyLlNwcml0ZS5wcm90b3R5cGUpO1xuICBCb3R1bGlzbS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBCb3R1bGlzbTtcblxuICAvLyBBZGQgbWV0aG9kc1xuICBfLmV4dGVuZChCb3R1bGlzbS5wcm90b3R5cGUsIHtcbiAgICB1cGRhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgLy8gRG8gaG92ZXJcbiAgICAgIGlmICh0aGlzLmhvdmVyKSB7XG4gICAgICAgIHRoaXMuYm9keS52ZWxvY2l0eS54ID0gdGhpcy5ib2R5LnZlbG9jaXR5LnggfHwgdGhpcy5ob3ZlclNwZWVkO1xuICAgICAgICB0aGlzLmJvZHkudmVsb2NpdHkueCA9ICh0aGlzLnggPD0gdGhpcy5taW5YKSA/IHRoaXMuaG92ZXJTcGVlZCA6XG4gICAgICAgICAgKHRoaXMueCA+PSB0aGlzLm1heFgpID8gLXRoaXMuaG92ZXJTcGVlZCA6IHRoaXMuYm9keS52ZWxvY2l0eS54O1xuICAgICAgfVxuICAgIH0sXG5cbiAgICAvLyBTZXQgaG92ZXIgc3BlZWQuICBBZGQgYSBiaXQgb2YgdmFyaWFuY2VcbiAgICBzZXRIb3ZlclNwZWVkOiBmdW5jdGlvbihzcGVlZCkge1xuICAgICAgdGhpcy5ob3ZlclNwZWVkID0gc3BlZWQgKyB0aGlzLmdhbWUucm5kLmludGVnZXJJblJhbmdlKC0yNSwgMjUpO1xuICAgIH0sXG5cbiAgICAvLyBHZXQgYW5jaG9yIGJvdW5kcy4gIFRoaXMgaXMgcmVsYXRpdmUgdG8gd2hlcmUgdGhlIHBsYXRmb3JtIGlzXG4gICAgZ2V0QW5jaG9yQm91bmRzWDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLm1pblggPSBNYXRoLm1heCh0aGlzLnggLSB0aGlzLmhvdmVyUmFuZ2UsIHRoaXMucGFkZGluZ1ggKyAodGhpcy53aWR0aCAvIDIpKTtcbiAgICAgIHRoaXMubWF4WCA9IE1hdGgubWluKHRoaXMueCArIHRoaXMuaG92ZXJSYW5nZSwgdGhpcy5nYW1lLndpZHRoIC0gKHRoaXMucGFkZGluZ1ggKyAodGhpcy53aWR0aCAvIDIpKSk7XG4gICAgICByZXR1cm4gW3RoaXMubWluWCwgdGhpcy5tYXhYXTtcbiAgICB9LFxuXG4gICAgLy8gUmVzZXQgdGhpbmdzXG4gICAgcmVzZXRQbGFjZW1lbnQ6IGZ1bmN0aW9uKHgsIHkpIHtcbiAgICAgIHRoaXMucmVzZXQoeCwgeSk7XG4gICAgICB0aGlzLmJvZHkudmVsb2NpdHkueCA9IDA7XG4gICAgICB0aGlzLmdldEFuY2hvckJvdW5kc1goKTtcbiAgICB9LFxuXG4gICAgLy8gUmVzZXQgaW1hZ2VcbiAgICByZXNldEltYWdlOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuaGVpZ2h0ID0gdGhpcy5vcmlnaW5hbEhlaWdodDtcbiAgICAgIHRoaXMud2lkdGggPSB0aGlzLm9yaWdpbmFsV2lkdGg7XG4gICAgICB0aGlzLmFscGhhID0gMTtcbiAgICB9LFxuXG4gICAgLy8gTXVyZGVyZWQgKG5vdCBqdXN0IGtpbGwpXG4gICAgbXVyZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgIC8vIEdldCBvcmlnaW5hbCBoZWlnaHRcbiAgICAgIHRoaXMub3JpZ2luYWxIZWlnaHQgPSB0aGlzLmhlaWdodDtcbiAgICAgIHRoaXMub3JpZ2luYWxXaWR0aCA9IHRoaXMud2lkdGg7XG5cbiAgICAgIHZhciB0d2VlbiA9IHRoaXMuZ2FtZS5hZGQudHdlZW4odGhpcykudG8oe1xuICAgICAgICBoZWlnaHQ6IDAsXG4gICAgICAgIHdpZHRoOiAwLFxuICAgICAgICBhbHBoYTogMFxuICAgICAgfSwgMjAwLCBQaGFzZXIuRWFzaW5nLkxpbmVhci5Ob25lLCB0cnVlKTtcblxuICAgICAgdHdlZW4ub25Db21wbGV0ZS5hZGQoXy5iaW5kKGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLnJlc2V0SW1hZ2UoKTtcbiAgICAgICAgdGhpcy5raWxsKCk7XG4gICAgICB9LCB0aGlzKSk7XG4gICAgfVxuICB9KTtcblxuICAvLyBFeHBvcnRcbiAgbW9kdWxlLmV4cG9ydHMgPSBCb3R1bGlzbTtcbn0pKCk7XG4iLCIvKiBnbG9iYWwgXzpmYWxzZSwgUGhhc2VyOmZhbHNlICovXG5cbi8qKlxuICogUHJlZmFiIHBsYXRmb3JtXG4gKi9cblxuKGZ1bmN0aW9uKCkge1xuICBcInVzZSBzdHJpY3RcIjtcblxuICAvLyBDb25zdHJ1Y3RvclxuICB2YXIgQ2Fycm90ID0gZnVuY3Rpb24oZ2FtZSwgeCwgeSkge1xuICAgIC8vIENhbGwgZGVmYXVsdCBzcHJpdGVcbiAgICBQaGFzZXIuU3ByaXRlLmNhbGwodGhpcywgZ2FtZSwgeCwgeSwgXCJjYXJyb3Qtc3ByaXRlc1wiLCBcImNhcnJvdC1zbmFwLTAxLnBuZ1wiKTtcblxuICAgIC8vIENvbmZpZ3VyZVxuICAgIHRoaXMuYW5jaG9yLnNldFRvKDAuNSwgMC41KTtcbiAgICB0aGlzLnNjYWxlLnNldFRvKCh0aGlzLmdhbWUud2lkdGggLyA1KSAvIHRoaXMud2lkdGgpO1xuICAgIHRoaXMuaG92ZXIgPSBmYWxzZTtcbiAgICB0aGlzLnNldEhvdmVyU3BlZWQoMTAwKTtcblxuICAgIC8vIFBoeXNpY3NcbiAgICB0aGlzLmdhbWUucGh5c2ljcy5hcmNhZGUuZW5hYmxlQm9keSh0aGlzKTtcbiAgICB0aGlzLmJvZHkuYWxsb3dHcmF2aXR5ID0gZmFsc2U7XG4gICAgdGhpcy5ib2R5LmltbW92YWJsZSA9IHRydWU7XG5cbiAgICAvLyBPbmx5IGFsbG93IGZvciBjb2xsaXNzaW9uIHVwXG4gICAgdGhpcy5ib2R5LmNoZWNrQ29sbGlzaW9uLnVwID0gdHJ1ZTtcbiAgICB0aGlzLmJvZHkuY2hlY2tDb2xsaXNpb24uZG93biA9IGZhbHNlO1xuICAgIHRoaXMuYm9keS5jaGVja0NvbGxpc2lvbi5sZWZ0ID0gZmFsc2U7XG4gICAgdGhpcy5ib2R5LmNoZWNrQ29sbGlzaW9uLnJpZ2h0ID0gZmFsc2U7XG5cbiAgICAvLyBEZXRlcm1pbmUgYW5jaG9yIHggYm91bmRzXG4gICAgdGhpcy5wYWRkaW5nWCA9IDEwO1xuICAgIHRoaXMuZ2V0QW5jaG9yQm91bmRzWCgpO1xuXG4gICAgLy8gU2V0dXAgYW5pbWF0aW9uc1xuICAgIHZhciBzbmFwRnJhbWVzID0gUGhhc2VyLkFuaW1hdGlvbi5nZW5lcmF0ZUZyYW1lTmFtZXMoXCJjYXJyb3Qtc25hcC1cIiwgMSwgNSwgXCIucG5nXCIsIDIpO1xuICAgIHRoaXMuc25hcEFuaW1hdGlvbiA9IHRoaXMuYW5pbWF0aW9ucy5hZGQoXCJzbmFwXCIsIHNuYXBGcmFtZXMpO1xuICAgIHRoaXMuc25hcEFuaW1hdGlvbi5vbkNvbXBsZXRlLmFkZCh0aGlzLnNuYXBwZWQsIHRoaXMpO1xuICB9O1xuXG4gIC8vIEV4dGVuZCBmcm9tIFNwcml0ZVxuICBDYXJyb3QucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQaGFzZXIuU3ByaXRlLnByb3RvdHlwZSk7XG4gIENhcnJvdC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBDYXJyb3Q7XG5cbiAgLy8gQWRkIG1ldGhvZHNcbiAgXy5leHRlbmQoQ2Fycm90LnByb3RvdHlwZSwge1xuICAgIHVwZGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICBpZiAodGhpcy5ob3Zlcikge1xuICAgICAgICB0aGlzLmJvZHkudmVsb2NpdHkueCA9IHRoaXMuYm9keS52ZWxvY2l0eS54IHx8IHRoaXMuaG92ZXJTcGVlZDtcbiAgICAgICAgdGhpcy5ib2R5LnZlbG9jaXR5LnggPSAodGhpcy54IDw9IHRoaXMubWluWCkgPyB0aGlzLmhvdmVyU3BlZWQgOlxuICAgICAgICAgICh0aGlzLnggPj0gdGhpcy5tYXhYKSA/IC10aGlzLmhvdmVyU3BlZWQgOiB0aGlzLmJvZHkudmVsb2NpdHkueDtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLy8gU2V0IGhvdmVyIHNwZWVkLiAgQWRkIGEgYml0IG9mIHZhcmlhbmNlXG4gICAgc2V0SG92ZXJTcGVlZDogZnVuY3Rpb24oc3BlZWQpIHtcbiAgICAgIHRoaXMuaG92ZXJTcGVlZCA9IHNwZWVkICsgdGhpcy5nYW1lLnJuZC5pbnRlZ2VySW5SYW5nZSgtNTAsIDUwKTtcbiAgICB9LFxuXG4gICAgLy8gR2V0IGFuY2hvciBib3VuZHNcbiAgICBnZXRBbmNob3JCb3VuZHNYOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMubWluWCA9IHRoaXMucGFkZGluZ1ggKyAodGhpcy53aWR0aCAvIDIpO1xuICAgICAgdGhpcy5tYXhYID0gdGhpcy5nYW1lLndpZHRoIC0gKHRoaXMucGFkZGluZ1ggKyAodGhpcy53aWR0aCAvIDIpKTtcbiAgICAgIHJldHVybiBbdGhpcy5taW5YLCB0aGlzLm1heFhdO1xuICAgIH0sXG5cbiAgICAvLyBSZXNldCB0aGluZ3NcbiAgICByZXNldFNldHRpbmdzOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMucmVzZXRJbWFnZSgpO1xuICAgICAgdGhpcy5yZXNldCgwLCAwKTtcbiAgICAgIHRoaXMuYm9keS52ZWxvY2l0eS54ID0gMDtcbiAgICAgIHRoaXMuaG92ZXIgPSBmYWxzZTtcbiAgICAgIHRoaXMuZ2V0QW5jaG9yQm91bmRzWCgpO1xuICAgIH0sXG5cbiAgICAvLyBSZXNldCBpbWFnZVxuICAgIHJlc2V0SW1hZ2U6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5hbHBoYSA9IDE7XG4gICAgICB0aGlzLmxvYWRUZXh0dXJlKFwiY2Fycm90LXNwcml0ZXNcIiwgXCJjYXJyb3Qtc25hcC0wMS5wbmdcIik7XG4gICAgfSxcblxuICAgIC8vIFNuYXAgY2Fycm90XG4gICAgc25hcDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLmFuaW1hdGlvbnMucGxheShcInNuYXBcIiwgMTUsIGZhbHNlLCBmYWxzZSk7XG4gICAgfSxcblxuICAgIC8vIFNuYXBwZWRcbiAgICBzbmFwcGVkOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciB0d2VlbiA9IHRoaXMuZ2FtZS5hZGQudHdlZW4odGhpcykudG8oe1xuICAgICAgICBhbHBoYTogMFxuICAgICAgfSwgMjAwLCBQaGFzZXIuRWFzaW5nLkxpbmVhci5Ob25lLCB0cnVlKTtcbiAgICAgIHR3ZWVuLm9uQ29tcGxldGUuYWRkKF8uYmluZChmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5yZXNldEltYWdlKCk7XG4gICAgICAgIHRoaXMua2lsbCgpO1xuICAgICAgfSwgdGhpcykpO1xuICAgIH1cbiAgfSk7XG5cbiAgLy8gRXhwb3J0XG4gIG1vZHVsZS5leHBvcnRzID0gQ2Fycm90O1xufSkoKTtcbiIsIi8qIGdsb2JhbCBfOmZhbHNlLCBQaGFzZXI6ZmFsc2UgKi9cblxuLyoqXG4gKiBQcmVmYWIgKG9iamVjdHMpIERpbGwgZm9yIGJvb3N0aW5nXG4gKi9cblxuKGZ1bmN0aW9uKCkge1xuICBcInVzZSBzdHJpY3RcIjtcblxuICAvLyBDb25zdHJ1Y3RvclxuICB2YXIgRGlsbCA9IGZ1bmN0aW9uKGdhbWUsIHgsIHkpIHtcbiAgICAvLyBDYWxsIGRlZmF1bHQgc3ByaXRlXG4gICAgUGhhc2VyLlNwcml0ZS5jYWxsKHRoaXMsIGdhbWUsIHgsIHksIFwiZ2FtZS1zcHJpdGVzXCIsIFwiZGlsbC5wbmdcIik7XG5cbiAgICAvLyBTaXplXG4gICAgdGhpcy5hbmNob3Iuc2V0VG8oMC41LCAwLjUpO1xuICAgIHRoaXMuc2NhbGUuc2V0VG8oKHRoaXMuZ2FtZS53aWR0aCAvIDkpIC8gdGhpcy53aWR0aCk7XG5cbiAgICAvLyBQaHlzaWNzXG4gICAgdGhpcy5nYW1lLnBoeXNpY3MuYXJjYWRlLmVuYWJsZUJvZHkodGhpcyk7XG4gICAgdGhpcy5ib2R5LmFsbG93R3Jhdml0eSA9IGZhbHNlO1xuICAgIHRoaXMuYm9keS5pbW1vdmFibGUgPSB0cnVlO1xuICB9O1xuXG4gIC8vIEV4dGVuZCBmcm9tIFNwcml0ZVxuICBEaWxsLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUGhhc2VyLlNwcml0ZS5wcm90b3R5cGUpO1xuICBEaWxsLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IERpbGw7XG5cbiAgLy8gQWRkIG1ldGhvZHNcbiAgXy5leHRlbmQoRGlsbC5wcm90b3R5cGUsIHtcbiAgICB1cGRhdGU6IGZ1bmN0aW9uKCkge1xuXG4gICAgfVxuICB9KTtcblxuICAvLyBFeHBvcnRcbiAgbW9kdWxlLmV4cG9ydHMgPSBEaWxsO1xufSkoKTtcbiIsIi8qIGdsb2JhbCBfOmZhbHNlLCBQaGFzZXI6ZmFsc2UgKi9cblxuLyoqXG4gKiBQcmVmYWIgSGVyby9jaGFyYWN0ZXJcbiAqL1xuXG4oZnVuY3Rpb24oKSB7XG4gIFwidXNlIHN0cmljdFwiO1xuXG4gIC8vIENvbnN0cnVjdG9yXG4gIHZhciBIZXJvID0gZnVuY3Rpb24oZ2FtZSwgeCwgeSkge1xuICAgIC8vIENhbGwgZGVmYXVsdCBzcHJpdGVcbiAgICBQaGFzZXIuU3ByaXRlLmNhbGwodGhpcywgZ2FtZSwgeCwgeSwgXCJwaWNrbGUtc3ByaXRlc1wiLCBcInBpY2tsZS1qdW1wLTAyLnBuZ1wiKTtcblxuICAgIC8vIENvbmZpZ3VyZVxuICAgIHRoaXMuYW5jaG9yLnNldFRvKDAuNSk7XG4gICAgdGhpcy5vcmlnaW5hbFNjYWxlID0gKHRoaXMuZ2FtZS53aWR0aCAvIDIyKSAvIHRoaXMud2lkdGg7XG4gICAgdGhpcy5zY2FsZS5zZXRUbyh0aGlzLm9yaWdpbmFsU2NhbGUpO1xuICAgIHRoaXMuZ2FtZS5waHlzaWNzLmFyY2FkZS5lbmFibGVCb2R5KHRoaXMpO1xuICAgIHRoaXMuaXNEZWFkID0gZmFsc2U7XG5cbiAgICAvLyBUcmFjayB3aGVyZSB0aGUgaGVybyBzdGFydGVkIGFuZCBob3cgbXVjaCB0aGUgZGlzdGFuY2VcbiAgICAvLyBoYXMgY2hhbmdlZCBmcm9tIHRoYXQgcG9pbnRcbiAgICB0aGlzLnlPcmlnID0gdGhpcy55O1xuICAgIHRoaXMueUNoYW5nZSA9IDA7XG5cbiAgICAvLyBBbmltYXRpb25zXG4gICAgdmFyIHVwRnJhbWVzID0gUGhhc2VyLkFuaW1hdGlvbi5nZW5lcmF0ZUZyYW1lTmFtZXMoXCJwaWNrbGUtanVtcC1cIiwgMSwgNCwgXCIucG5nXCIsIDIpO1xuICAgIHZhciBkb3duRnJhbWVzID0gUGhhc2VyLkFuaW1hdGlvbi5nZW5lcmF0ZUZyYW1lTmFtZXMoXCJwaWNrbGUtanVtcC1cIiwgNCwgMSwgXCIucG5nXCIsIDIpO1xuICAgIHRoaXMuanVtcFVwID0gdGhpcy5hbmltYXRpb25zLmFkZChcImp1bXAtdXBcIiwgdXBGcmFtZXMpO1xuICAgIHRoaXMuSnVtcERvd24gPSB0aGlzLmFuaW1hdGlvbnMuYWRkKFwianVtcC1kb3duXCIsIGRvd25GcmFtZXMpO1xuICAgIHRoaXMuanVtcCA9IHRoaXMuYW5pbWF0aW9ucy5hZGQoXCJqdW1wXCIsIHVwRnJhbWVzLmNvbmNhdChkb3duRnJhbWVzKSk7XG4gIH07XG5cbiAgLy8gRXh0ZW5kIGZyb20gU3ByaXRlXG4gIEhlcm8ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQaGFzZXIuU3ByaXRlLnByb3RvdHlwZSk7XG4gIEhlcm8ucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gSGVybztcblxuICAvLyBBZGQgbWV0aG9kc1xuICBfLmV4dGVuZChIZXJvLnByb3RvdHlwZSwge1xuICAgIHVwZGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgcng7XG4gICAgICB2YXIgcnk7XG5cbiAgICAgIC8vIFRyYWNrIHRoZSBtYXhpbXVtIGFtb3VudCB0aGF0IHRoZSBoZXJvIGhhcyB0cmF2ZWxsZWRcbiAgICAgIHRoaXMueUNoYW5nZSA9IE1hdGgubWF4KHRoaXMueUNoYW5nZSwgTWF0aC5hYnModGhpcy55IC0gdGhpcy55T3JpZykpO1xuXG4gICAgICAvLyBXcmFwIGFyb3VuZCBlZGdlcyBsZWZ0L3RpZ2h0IGVkZ2VzXG4gICAgICB0aGlzLmdhbWUud29ybGQud3JhcCh0aGlzLCB0aGlzLndpZHRoIC8gMiwgZmFsc2UsIHRydWUsIGZhbHNlKTtcblxuICAgICAgLy8gV2hlbiBoZWFkaW5nIGRvd24sIGFuaW1hdGUgdG8gZG93blxuICAgICAgaWYgKHRoaXMuYm9keS52ZWxvY2l0eS55ID4gMCAmJiB0aGlzLmdvaW5nVXApIHtcbiAgICAgICAgdGhpcy5vbkZpcmUgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5nb2luZ1VwID0gZmFsc2U7XG4gICAgICAgIHRoaXMuZG9KdW1wRG93bigpO1xuICAgICAgfVxuXG4gICAgICAvLyBFbHNlIHdoZW4gaGVhZGluZyB1cCwgbm90ZVxuICAgICAgZWxzZSBpZiAodGhpcy5ib2R5LnZlbG9jaXR5LnkgPCAwICYmICF0aGlzLmdvaW5nVXApIHtcbiAgICAgICAgdGhpcy5nb2luZ1VwID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5kb0p1bXBVcCgpO1xuICAgICAgfVxuXG4gICAgICAvLyBTaGFrZSB3aGVuIG9uIGZpcmVcbiAgICAgIGlmICh0aGlzLm9uRmlyZSkge1xuICAgICAgICByeCA9IHRoaXMuZ2FtZS5ybmQuaW50ZWdlckluUmFuZ2UoLTQsIDQpO1xuICAgICAgICByeSA9IHRoaXMuZ2FtZS5ybmQuaW50ZWdlckluUmFuZ2UoLTIsIDIpO1xuICAgICAgICB0aGlzLnBvc2l0aW9uLnggKz0gcng7XG4gICAgICAgIHRoaXMucG9zaXRpb24ueSArPSByeTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLy8gUmVzZXQgcGxhY2VtZW50IGN1c3RvbVxuICAgIHJlc2V0UGxhY2VtZW50OiBmdW5jdGlvbih4LCB5KSB7XG4gICAgICB0aGlzLnJlc2V0KHgsIHkpO1xuICAgICAgdGhpcy55T3JpZyA9IHRoaXMueTtcbiAgICAgIHRoaXMueUNoYW5nZSA9IDA7XG4gICAgfSxcblxuICAgIC8vIEp1bXAgdXBcbiAgICBkb0p1bXBVcDogZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoIXRoaXMub25GaXJlICYmICF0aGlzLmlzRGVhZCkge1xuICAgICAgICB0aGlzLmFuaW1hdGlvbnMucGxheShcImp1bXAtdXBcIiwgMTUsIGZhbHNlKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLy8gSnVtcCBkb3duXG4gICAgZG9KdW1wRG93bjogZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoIXRoaXMub25GaXJlICYmICF0aGlzLmlzRGVhZCkge1xuICAgICAgICB0aGlzLmFuaW1hdGlvbnMucGxheShcImp1bXAtZG93blwiLCAxNSwgZmFsc2UpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICAvLyBPbiBmaXJlXG4gICAgc2V0T25GaXJlOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMub25GaXJlID0gdHJ1ZTtcbiAgICAgIHRoaXMubG9hZFRleHR1cmUoXCJwaWNrbGUtc3ByaXRlc1wiLCBcInBpY2tsZS1yb2NrZXQucG5nXCIpO1xuICAgICAgdGhpcy5zY2FsZS5zZXRUbyh0aGlzLm9yaWdpbmFsU2NhbGUgKiAxLjUpO1xuICAgIH0sXG5cbiAgICAvLyBPZmYgZmlyZVxuICAgIHB1dE91dEZpcmU6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zY2FsZS5zZXRUbyh0aGlzLm9yaWdpbmFsU2NhbGUpO1xuICAgICAgdGhpcy5vbkZpcmUgPSBmYWxzZTtcbiAgICB9LFxuXG4gICAgLy8gTXVyZGVyIHdpdGggYm90Y2h5XG4gICAgYm90Y2h5TXVyZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuaXNEZWFkID0gdHJ1ZTtcbiAgICAgIHRoaXMubG9hZFRleHR1cmUoXCJwaWNrbGUtc3ByaXRlc1wiLCBcInBpY2tsZS1ib3RjaHkucG5nXCIpO1xuXG4gICAgICB2YXIgdHdlZW4gPSB0aGlzLmdhbWUuYWRkLnR3ZWVuKHRoaXMpLnRvKHtcbiAgICAgICAgYW5nbGU6IDE3NVxuICAgICAgfSwgNTAwLCBQaGFzZXIuRWFzaW5nLkxpbmVhci5Ob25lLCB0cnVlKTtcblxuICAgICAgdHdlZW4ub25Db21wbGV0ZS5hZGQoXy5iaW5kKGZ1bmN0aW9uKCkge1xuICAgICAgICAvLyBEbyBzb21ldGhpbmdcbiAgICAgIH0sIHRoaXMpKTtcbiAgICB9XG4gIH0pO1xuXG4gIC8vIEV4cG9ydFxuICBtb2R1bGUuZXhwb3J0cyA9IEhlcm87XG59KSgpO1xuIiwiLyogZ2xvYmFsIF86ZmFsc2UsIFBoYXNlcjpmYWxzZSAqL1xuXG4vKipcbiAqIFByZWZhYiBqYXIgcGxhdGZvcm1cbiAqL1xuXG4oZnVuY3Rpb24oKSB7XG4gIFwidXNlIHN0cmljdFwiO1xuXG4gIC8vIENvbnN0cnVjdG9yXG4gIHZhciBKYXIgPSBmdW5jdGlvbihnYW1lLCB4LCB5KSB7XG4gICAgLy8gQ2FsbCBkZWZhdWx0IHNwcml0ZVxuICAgIFBoYXNlci5TcHJpdGUuY2FsbCh0aGlzLCBnYW1lLCB4LCB5LCBcImdhbWUtc3ByaXRlc1wiLCBcImphci5wbmdcIik7XG5cbiAgICAvLyBDb25maWd1cmVcbiAgICB0aGlzLmFuY2hvci5zZXRUbygwLjUsIDAuNSk7XG4gICAgdGhpcy5zY2FsZS5zZXRUbygodGhpcy5nYW1lLndpZHRoIC8gMikgLyB0aGlzLndpZHRoKTtcblxuICAgIC8vIFBoeXNpY3NcbiAgICB0aGlzLmdhbWUucGh5c2ljcy5hcmNhZGUuZW5hYmxlQm9keSh0aGlzKTtcbiAgICB0aGlzLmJvZHkuYWxsb3dHcmF2aXR5ID0gZmFsc2U7XG4gICAgdGhpcy5ib2R5LmltbW92YWJsZSA9IHRydWU7XG4gIH07XG5cbiAgLy8gRXh0ZW5kIGZyb20gU3ByaXRlXG4gIEphci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFBoYXNlci5TcHJpdGUucHJvdG90eXBlKTtcbiAgSmFyLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEphcjtcblxuICAvLyBBZGQgbWV0aG9kc1xuICBfLmV4dGVuZChKYXIucHJvdG90eXBlLCB7XG4gICAgdXBkYXRlOiBmdW5jdGlvbigpIHtcbiAgICB9XG4gIH0pO1xuXG4gIC8vIEV4cG9ydFxuICBtb2R1bGUuZXhwb3J0cyA9IEphcjtcbn0pKCk7XG4iLCIvKiBnbG9iYWwgXzpmYWxzZSwgUGhhc2VyOmZhbHNlICovXG5cbi8qKlxuICogUHJlZmFiIG1pbmkgcGlja2xlIChraW5kIG9mIGxpa2UgYSBjb2luLCBqdXN0IHBvaW50cylcbiAqL1xuXG4oZnVuY3Rpb24oKSB7XG4gIFwidXNlIHN0cmljdFwiO1xuXG4gIC8vIENvbnN0cnVjdG9yXG4gIHZhciBNaW5pID0gZnVuY3Rpb24oZ2FtZSwgeCwgeSkge1xuICAgIC8vIENhbGwgZGVmYXVsdCBzcHJpdGVcbiAgICBQaGFzZXIuU3ByaXRlLmNhbGwodGhpcywgZ2FtZSwgeCwgeSwgXCJnYW1lLXNwcml0ZXNcIiwgXCJtYWdpY2RpbGwucG5nXCIpO1xuXG4gICAgLy8gQ29uZmlndXJlXG4gICAgdGhpcy5hbmNob3Iuc2V0VG8oMC41LCAwLjUpO1xuICAgIHRoaXMuc2NhbGUuc2V0VG8oKHRoaXMuZ2FtZS53aWR0aCAvIDIwKSAvIHRoaXMud2lkdGgpO1xuXG4gICAgLy8gUGh5c2ljc1xuICAgIHRoaXMuZ2FtZS5waHlzaWNzLmFyY2FkZS5lbmFibGVCb2R5KHRoaXMpO1xuICAgIHRoaXMuYm9keS5hbGxvd0dyYXZpdHkgPSBmYWxzZTtcbiAgICB0aGlzLmJvZHkuaW1tb3ZhYmxlID0gdHJ1ZTtcbiAgfTtcblxuICAvLyBFeHRlbmQgZnJvbSBTcHJpdGVcbiAgTWluaS5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFBoYXNlci5TcHJpdGUucHJvdG90eXBlKTtcbiAgTWluaS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBNaW5pO1xuXG4gIC8vIEFkZCBtZXRob2RzXG4gIF8uZXh0ZW5kKE1pbmkucHJvdG90eXBlLCB7XG4gICAgdXBkYXRlOiBmdW5jdGlvbigpIHtcblxuICAgIH1cbiAgfSk7XG5cbiAgLy8gRXhwb3J0XG4gIG1vZHVsZS5leHBvcnRzID0gTWluaTtcbn0pKCk7XG4iLCIvKiBnbG9iYWwgXzpmYWxzZSwgUGhhc2VyOmZhbHNlICovXG5cbi8qKlxuICogUHJlZmFiIChvYmplY3RzKSBib29zdCBmb3IgcGVwcGVyXG4gKi9cblxuKGZ1bmN0aW9uKCkge1xuICBcInVzZSBzdHJpY3RcIjtcblxuICAvLyBDb25zdHJ1Y3RvciBmb3IgQm9vc3RcbiAgdmFyIFBlcHBlciA9IGZ1bmN0aW9uKGdhbWUsIHgsIHkpIHtcbiAgICAvLyBDYWxsIGRlZmF1bHQgc3ByaXRlXG4gICAgUGhhc2VyLlNwcml0ZS5jYWxsKHRoaXMsIGdhbWUsIHgsIHksIFwiZ2FtZS1zcHJpdGVzXCIsIFwiZ2hvc3QtcGVwcGVyLnBuZ1wiKTtcblxuICAgIC8vIFNpemVcbiAgICB0aGlzLmFuY2hvci5zZXRUbygwLjUsIDAuNSk7XG4gICAgdGhpcy5zY2FsZS5zZXRUbygodGhpcy5nYW1lLndpZHRoIC8gMTgpIC8gdGhpcy53aWR0aCk7XG5cbiAgICAvLyBQaHlzaWNzXG4gICAgdGhpcy5nYW1lLnBoeXNpY3MuYXJjYWRlLmVuYWJsZUJvZHkodGhpcyk7XG4gICAgdGhpcy5ib2R5LmFsbG93R3Jhdml0eSA9IGZhbHNlO1xuICAgIHRoaXMuYm9keS5pbW1vdmFibGUgPSB0cnVlO1xuICB9O1xuXG4gIC8vIEV4dGVuZCBmcm9tIFNwcml0ZVxuICBQZXBwZXIucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQaGFzZXIuU3ByaXRlLnByb3RvdHlwZSk7XG4gIFBlcHBlci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBQZXBwZXI7XG5cbiAgLy8gQWRkIG1ldGhvZHNcbiAgXy5leHRlbmQoUGVwcGVyLnByb3RvdHlwZSwge1xuICAgIHVwZGF0ZTogZnVuY3Rpb24oKSB7XG5cbiAgICB9XG4gIH0pO1xuXG4gIC8vIEV4cG9ydFxuICBtb2R1bGUuZXhwb3J0cyA9IFBlcHBlcjtcbn0pKCk7XG4iLCIvKiBnbG9iYWwgXzpmYWxzZSwgUGhhc2VyOmZhbHNlICovXG5cbi8qKlxuICogR2FtZW92ZXIgc3RhdGVcbiAqL1xuXG4oZnVuY3Rpb24oKSB7XG4gIFwidXNlIHN0cmljdFwiO1xuXG4gIC8vIENvbnN0cnVjdG9yXG4gIHZhciBHYW1lb3ZlciA9IGZ1bmN0aW9uKCkge1xuICAgIFBoYXNlci5TdGF0ZS5jYWxsKHRoaXMpO1xuICB9O1xuXG4gIC8vIEV4dGVuZCBmcm9tIFN0YXRlXG4gIEdhbWVvdmVyLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUGhhc2VyLlN0YXRlLnByb3RvdHlwZSk7XG4gIEdhbWVvdmVyLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEdhbWVvdmVyO1xuXG4gIC8vIEFkZCBtZXRob2RzXG4gIF8uZXh0ZW5kKEdhbWVvdmVyLnByb3RvdHlwZSwgUGhhc2VyLlN0YXRlLnByb3RvdHlwZSwge1xuICAgIC8vIFByZWxvYWRcbiAgICBwcmVsb2FkOiBmdW5jdGlvbigpIHtcbiAgICAgIC8vIExvYWQgdXAgZ2FtZSBpbWFnZXNcbiAgICAgIHRoaXMuZ2FtZS5sb2FkLmF0bGFzKFwiZ2FtZW92ZXItc3ByaXRlc1wiLCBcImFzc2V0cy9nYW1lb3Zlci1zcHJpdGVzLnBuZ1wiLCBcImFzc2V0cy9nYW1lb3Zlci1zcHJpdGVzLmpzb25cIik7XG4gICAgfSxcblxuICAgIC8vIENyZWF0ZVxuICAgIGNyZWF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAvLyBTZXQgYmFja2dyb3VuZFxuICAgICAgdGhpcy5nYW1lLnN0YWdlLmJhY2tncm91bmRDb2xvciA9IFwiIzhjYzYzZlwiO1xuXG4gICAgICAvLyBNYWtlIHBhZGRpbmcgZGVwZW5kZW50IG9uIHdpZHRoXG4gICAgICB0aGlzLnBhZGRpbmcgPSB0aGlzLmdhbWUud2lkdGggLyA1MDtcblxuICAgICAgLy8gUGxhY2UgdGl0bGVcbiAgICAgIHRoaXMudGl0bGVJbWFnZSA9IHRoaXMuZ2FtZS5hZGQuc3ByaXRlKDAsIDAsIFwiZ2FtZW92ZXItc3ByaXRlc1wiLCBcImdhbWVvdmVyLnBuZ1wiKTtcbiAgICAgIHRoaXMudGl0bGVJbWFnZS5hbmNob3Iuc2V0VG8oMC41LCAwKTtcbiAgICAgIHRoaXMudGl0bGVJbWFnZS5zY2FsZS5zZXRUbygodGhpcy5nYW1lLndpZHRoIC0gKHRoaXMucGFkZGluZyAqIDE2KSkgLyB0aGlzLnRpdGxlSW1hZ2Uud2lkdGgpO1xuICAgICAgdGhpcy50aXRsZUltYWdlLnJlc2V0KHRoaXMuY2VudGVyU3RhZ2VYKHRoaXMudGl0bGVJbWFnZSksIHRoaXMucGFkZGluZyAqIDIpO1xuICAgICAgdGhpcy5nYW1lLmFkZC5leGlzdGluZyh0aGlzLnRpdGxlSW1hZ2UpO1xuXG4gICAgICAvLyBIaWdoc2NvcmUgbGlzdC4gIENhbid0IHNlZW0gdG8gZmluZCBhIHdheSB0byBwYXNzIHRoZSBzY29yZVxuICAgICAgLy8gdmlhIGEgc3RhdGUgY2hhbmdlLlxuICAgICAgdGhpcy5zY29yZSA9IHRoaXMuZ2FtZS5waWNrbGUuc2NvcmU7XG5cbiAgICAgIC8vIFNob3cgc2NvcmVcbiAgICAgIHRoaXMuc2hvd1Njb3JlKCk7XG5cbiAgICAgIC8vIFNob3cgaW5wdXQgaWYgbmV3IGhpZ2hzY29yZSwgb3RoZXJ3aXNlIHNob3cgbGlzdFxuICAgICAgaWYgKHRoaXMuZ2FtZS5waWNrbGUuaXNIaWdoc2NvcmUodGhpcy5zY29yZSkpIHtcbiAgICAgICAgdGhpcy5oaWdoc2NvcmVJbnB1dCgpO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHRoaXMuaGlnaHNjb3JlTGlzdCgpO1xuICAgICAgfVxuXG4gICAgICAvLyBQbGFjZSByZS1wbGF5XG4gICAgICB0aGlzLnJlcGxheUltYWdlID0gdGhpcy5nYW1lLmFkZC5zcHJpdGUodGhpcy5nYW1lLndpZHRoIC0gdGhpcy5wYWRkaW5nICogMixcbiAgICAgICAgdGhpcy5nYW1lLmhlaWdodCAtIHRoaXMucGFkZGluZyAqIDIsIFwiZ2FtZW92ZXItc3ByaXRlc1wiLCBcInRpdGxlLXBsYXkucG5nXCIpO1xuICAgICAgdGhpcy5yZXBsYXlJbWFnZS5hbmNob3Iuc2V0VG8oMSwgMSk7XG4gICAgICB0aGlzLnJlcGxheUltYWdlLnNjYWxlLnNldFRvKCh0aGlzLmdhbWUud2lkdGggKiAwLjI1KSAvIHRoaXMucmVwbGF5SW1hZ2Uud2lkdGgpO1xuICAgICAgdGhpcy5nYW1lLmFkZC5leGlzdGluZyh0aGlzLnJlcGxheUltYWdlKTtcblxuICAgICAgLy8gQWRkIGhvdmVyIGZvciBtb3VzZVxuICAgICAgdGhpcy5yZXBsYXlJbWFnZS5pbnB1dEVuYWJsZWQgPSB0cnVlO1xuICAgICAgdGhpcy5yZXBsYXlJbWFnZS5ldmVudHMub25JbnB1dE92ZXIuYWRkKGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLnJlcGxheUltYWdlLm9yaWdpbmFsVGludCA9IHRoaXMucmVwbGF5SW1hZ2UudGludDtcbiAgICAgICAgdGhpcy5yZXBsYXlJbWFnZS50aW50ID0gMC41ICogMHhGRkZGRkY7XG4gICAgICB9LCB0aGlzKTtcblxuICAgICAgdGhpcy5yZXBsYXlJbWFnZS5ldmVudHMub25JbnB1dE91dC5hZGQoZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMucmVwbGF5SW1hZ2UudGludCA9IHRoaXMucmVwbGF5SW1hZ2Uub3JpZ2luYWxUaW50O1xuICAgICAgfSwgdGhpcyk7XG5cbiAgICAgIC8vIEFkZCBpbnRlcmFjdGlvbnMgZm9yIHN0YXJ0aW5nXG4gICAgICB0aGlzLnJlcGxheUltYWdlLmV2ZW50cy5vbklucHV0RG93bi5hZGQodGhpcy5yZXBsYXksIHRoaXMpO1xuXG4gICAgICAvLyBJbnB1dFxuICAgICAgdGhpcy5sZWZ0QnV0dG9uID0gdGhpcy5nYW1lLmlucHV0LmtleWJvYXJkLmFkZEtleShQaGFzZXIuS2V5Ym9hcmQuTEVGVCk7XG4gICAgICB0aGlzLnJpZ2h0QnV0dG9uID0gdGhpcy5nYW1lLmlucHV0LmtleWJvYXJkLmFkZEtleShQaGFzZXIuS2V5Ym9hcmQuUklHSFQpO1xuICAgICAgdGhpcy51cEJ1dHRvbiA9IHRoaXMuZ2FtZS5pbnB1dC5rZXlib2FyZC5hZGRLZXkoUGhhc2VyLktleWJvYXJkLlVQKTtcbiAgICAgIHRoaXMuZG93bkJ1dHRvbiA9IHRoaXMuZ2FtZS5pbnB1dC5rZXlib2FyZC5hZGRLZXkoUGhhc2VyLktleWJvYXJkLkRPV04pO1xuICAgICAgdGhpcy5hY3Rpb25CdXR0b24gPSB0aGlzLmdhbWUuaW5wdXQua2V5Ym9hcmQuYWRkS2V5KFBoYXNlci5LZXlib2FyZC5TUEFDRUJBUik7XG5cbiAgICAgIHRoaXMubGVmdEJ1dHRvbi5vbkRvd24uYWRkKGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAodGhpcy5oSW5wdXQpIHtcbiAgICAgICAgICB0aGlzLm1vdmVDdXJzb3IoLTEpO1xuICAgICAgICB9XG4gICAgICB9LCB0aGlzKTtcblxuICAgICAgdGhpcy5yaWdodEJ1dHRvbi5vbkRvd24uYWRkKGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAodGhpcy5oSW5wdXQpIHtcbiAgICAgICAgICB0aGlzLm1vdmVDdXJzb3IoMSk7XG4gICAgICAgIH1cbiAgICAgIH0sIHRoaXMpO1xuXG4gICAgICB0aGlzLnVwQnV0dG9uLm9uRG93bi5hZGQoZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICh0aGlzLmhJbnB1dCkge1xuICAgICAgICAgIHRoaXMubW92ZUxldHRlcigxKTtcbiAgICAgICAgfVxuICAgICAgfSwgdGhpcyk7XG5cbiAgICAgIHRoaXMuZG93bkJ1dHRvbi5vbkRvd24uYWRkKGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAodGhpcy5oSW5wdXQpIHtcbiAgICAgICAgICB0aGlzLm1vdmVMZXR0ZXIoLTEpO1xuICAgICAgICB9XG4gICAgICB9LCB0aGlzKTtcblxuICAgICAgdGhpcy5hY3Rpb25CdXR0b24ub25Eb3duLmFkZChmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHNhdmVkO1xuXG4gICAgICAgIGlmICh0aGlzLmhJbnB1dCkge1xuICAgICAgICAgIHNhdmVkID0gdGhpcy5zYXZlSGlnaHNjb3JlKCk7XG4gICAgICAgICAgaWYgKHNhdmVkKSB7XG4gICAgICAgICAgICB0aGlzLmhpZ2hzY29yZUxpc3QoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgdGhpcy5yZXBsYXkoKTtcbiAgICAgICAgfVxuICAgICAgfSwgdGhpcyk7XG4gICAgfSxcblxuICAgIC8vIFVwZGF0ZVxuICAgIHVwZGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgfSxcblxuICAgIC8vIFNodXRkb3duLCBjbGVhbiB1cCBvbiBzdGF0ZSBjaGFuZ2VcbiAgICBzaHV0ZG93bjogZnVuY3Rpb24oKSB7XG4gICAgICBbXCJ0aXRsZVRleHRcIiwgXCJyZXBsYXlUZXh0XCJdLmZvckVhY2goXy5iaW5kKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgaWYgKHRoaXNbaXRlbV0gJiYgdGhpc1tpdGVtXS5kZXN0cm95KSB7XG4gICAgICAgICAgdGhpc1tpdGVtXS5kZXN0cm95KCk7XG4gICAgICAgICAgdGhpc1tpdGVtXSA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgIH0sIHRoaXMpKTtcbiAgICB9LFxuXG4gICAgLy8gSGFuZGxlIHJlcGxheVxuICAgIHJlcGxheTogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLmdhbWUuc3RhdGUuc3RhcnQoXCJtZW51XCIpO1xuICAgIH0sXG5cbiAgICAvLyBTaG93IGhpZ2hzY29yZVxuICAgIHNob3dTY29yZTogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnNjb3JlR3JvdXAgPSB0aGlzLmdhbWUuYWRkLmdyb3VwKCk7XG5cbiAgICAgIC8vIFBsYWNlIGxhYmVsXG4gICAgICB0aGlzLnlvdXJTY29yZUltYWdlID0gbmV3IFBoYXNlci5TcHJpdGUodGhpcy5nYW1lLCAwLCAwLCBcImdhbWVvdmVyLXNwcml0ZXNcIiwgXCJ5b3VyLXNjb3JlLnBuZ1wiKTtcbiAgICAgIHRoaXMueW91clNjb3JlSW1hZ2UuYW5jaG9yLnNldFRvKDAuNSwgMCk7XG4gICAgICB0aGlzLnlvdXJTY29yZUltYWdlLnNjYWxlLnNldFRvKCgodGhpcy5nYW1lLndpZHRoICogMC41KSAtICh0aGlzLnBhZGRpbmcgKiA2KSkgLyB0aGlzLnlvdXJTY29yZUltYWdlLndpZHRoKTtcbiAgICAgIHRoaXMueW91clNjb3JlSW1hZ2UucmVzZXQodGhpcy5jZW50ZXJTdGFnZVgodGhpcy55b3VyU2NvcmVJbWFnZSksXG4gICAgICAgIHRoaXMudGl0bGVJbWFnZS5oZWlnaHQgKyAodGhpcy5wYWRkaW5nICogOCkpO1xuXG4gICAgICAvLyBTY29yZVxuICAgICAgdGhpcy5zY29yZVRleHQgPSBuZXcgUGhhc2VyLlRleHQodGhpcy5nYW1lLCAwLCAwLFxuICAgICAgICB0aGlzLnNjb3JlLnRvTG9jYWxlU3RyaW5nKCksIHtcbiAgICAgICAgICBmb250OiBcIlwiICsgKHRoaXMuZ2FtZS53b3JsZC5oZWlnaHQgLyAxMCkgKyBcInB4IE9tbmVzUm9tYW4tOTAwXCIsXG4gICAgICAgICAgZmlsbDogXCIjMzliNTRhXCIsXG4gICAgICAgICAgYWxpZ246IFwiY2VudGVyXCIsXG4gICAgICAgIH0pO1xuICAgICAgdGhpcy5zY29yZVRleHQuYW5jaG9yLnNldFRvKDAuNSwgMCk7XG4gICAgICB0aGlzLnNjb3JlVGV4dC5yZXNldCh0aGlzLmNlbnRlclN0YWdlWCh0aGlzLnNjb3JlVGV4dCksXG4gICAgICAgIHRoaXMudGl0bGVJbWFnZS5oZWlnaHQgKyB0aGlzLnlvdXJTY29yZUltYWdlLmhlaWdodCArICh0aGlzLnBhZGRpbmcgKiA3KSk7XG5cbiAgICAgIC8vIEFkZCBncm91cHNcbiAgICAgIF8uZGVsYXkoXy5iaW5kKGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLnNjb3JlR3JvdXAuYWRkKHRoaXMueW91clNjb3JlSW1hZ2UpO1xuICAgICAgICB0aGlzLnNjb3JlR3JvdXAuYWRkKHRoaXMuc2NvcmVUZXh0KTtcbiAgICAgIH0sIHRoaXMpLCAxMDAwKTtcbiAgICB9LFxuXG4gICAgLy8gTWFrZSBoaWdoZXN0IHNjb3JlIGlucHV0XG4gICAgaGlnaHNjb3JlSW5wdXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5oSW5wdXQgPSB0cnVlO1xuICAgICAgdGhpcy5oSW5wdXRJbmRleCA9IDA7XG4gICAgICB0aGlzLmhJbnB1dHMgPSB0aGlzLmdhbWUuYWRkLmdyb3VwKCk7XG4gICAgICB2YXIgeSA9IHRoaXMuZ2FtZS53b3JsZC5oZWlnaHQgKiAwLjc7XG5cbiAgICAgIC8vIEZpcnN0IGlucHV0XG4gICAgICB2YXIgb25lID0gbmV3IFBoYXNlci5UZXh0KFxuICAgICAgICB0aGlzLmdhbWUsXG4gICAgICAgIHRoaXMuZ2FtZS53b3JsZC53aWR0aCAqIDAuMzMzMzMsXG4gICAgICAgIHksXG4gICAgICAgIFwiQVwiLCB7XG4gICAgICAgICAgZm9udDogXCJcIiArICh0aGlzLmdhbWUud29ybGQuaGVpZ2h0IC8gMTUpICsgXCJweCBPbW5lc1JvbWFuLWJvbGRcIixcbiAgICAgICAgICBmaWxsOiBcIiNGRkZGRkZcIixcbiAgICAgICAgICBhbGlnbjogXCJjZW50ZXJcIixcbiAgICAgICAgfSk7XG4gICAgICBvbmUuYW5jaG9yLnNldCgwLjUpO1xuICAgICAgdGhpcy5oSW5wdXRzLmFkZChvbmUpO1xuXG4gICAgICAvLyBTZWNvbmQgaW5wdXRcbiAgICAgIHZhciBzZWNvbmQgPSBuZXcgUGhhc2VyLlRleHQoXG4gICAgICAgIHRoaXMuZ2FtZSxcbiAgICAgICAgdGhpcy5nYW1lLndvcmxkLndpZHRoICogMC41LFxuICAgICAgICB5LFxuICAgICAgICBcIkFcIiwge1xuICAgICAgICAgIGZvbnQ6IFwiXCIgKyAodGhpcy5nYW1lLndvcmxkLmhlaWdodCAvIDE1KSArIFwicHggT21uZXNSb21hbi1ib2xkXCIsXG4gICAgICAgICAgZmlsbDogXCIjRkZGRkZGXCIsXG4gICAgICAgICAgYWxpZ246IFwiY2VudGVyXCIsXG4gICAgICAgIH0pO1xuICAgICAgc2Vjb25kLmFuY2hvci5zZXQoMC41KTtcbiAgICAgIHRoaXMuaElucHV0cy5hZGQoc2Vjb25kKTtcblxuICAgICAgLy8gU2Vjb25kIGlucHV0XG4gICAgICB2YXIgdGhpcmQgPSBuZXcgUGhhc2VyLlRleHQoXG4gICAgICAgIHRoaXMuZ2FtZSxcbiAgICAgICAgdGhpcy5nYW1lLndvcmxkLndpZHRoICogMC42NjY2NixcbiAgICAgICAgeSxcbiAgICAgICAgXCJBXCIsIHtcbiAgICAgICAgICBmb250OiBcIlwiICsgKHRoaXMuZ2FtZS53b3JsZC5oZWlnaHQgLyAxNSkgKyBcInB4IE9tbmVzUm9tYW4tYm9sZFwiLFxuICAgICAgICAgIGZpbGw6IFwiI0ZGRkZGRlwiLFxuICAgICAgICAgIGFsaWduOiBcImNlbnRlclwiLFxuICAgICAgICB9KTtcbiAgICAgIHRoaXJkLmFuY2hvci5zZXQoMC41KTtcbiAgICAgIHRoaXMuaElucHV0cy5hZGQodGhpcmQpO1xuXG4gICAgICAvLyBDdXJzb3JcbiAgICAgIHRoaXMuaEN1cnNvciA9IHRoaXMuZ2FtZS5hZGQudGV4dChcbiAgICAgICAgb25lLngsXG4gICAgICAgIG9uZS55IC0gKHRoaXMuZ2FtZS53b3JsZC5oZWlnaHQgLyAyMCksXG4gICAgICAgIFwiX1wiLCB7XG4gICAgICAgICAgZm9udDogXCJib2xkIFwiICsgKHRoaXMuZ2FtZS53b3JsZC5oZWlnaHQgLyA1KSArIFwicHggQXJpYWxcIixcbiAgICAgICAgICBmaWxsOiBcIiNGRkZGRkZcIixcbiAgICAgICAgICBhbGlnbjogXCJjZW50ZXJcIixcbiAgICAgICAgfSk7XG4gICAgICB0aGlzLmhDdXJzb3IuYW5jaG9yLnNldCgwLjUpO1xuXG4gICAgICAvLyBIYW5kbGUgaW5pdGFsIGN1cnNvclxuICAgICAgdGhpcy5tb3ZlQ3Vyc29yKDApO1xuICAgIH0sXG5cbiAgICAvLyBNb3ZlIGN1cnNvclxuICAgIG1vdmVDdXJzb3I6IGZ1bmN0aW9uKGFtb3VudCkge1xuICAgICAgdmFyIG5ld0luZGV4ID0gdGhpcy5oSW5wdXRJbmRleCArIGFtb3VudDtcbiAgICAgIHRoaXMuaElucHV0SW5kZXggPSAobmV3SW5kZXggPCAwKSA/IHRoaXMuaElucHV0cy5sZW5ndGggLSAxIDpcbiAgICAgICAgKG5ld0luZGV4ID49IHRoaXMuaElucHV0cy5sZW5ndGgpID8gMCA6IG5ld0luZGV4O1xuICAgICAgdmFyIGkgPSB0aGlzLmhJbnB1dHMuZ2V0Q2hpbGRBdCh0aGlzLmhJbnB1dEluZGV4KTtcblxuICAgICAgLy8gTW92ZSBjdXJzb3JcbiAgICAgIHRoaXMuaEN1cnNvci54ID0gaS54O1xuICAgICAgdGhpcy5oSW5wdXRzLmZvckVhY2goZnVuY3Rpb24oaW5wdXQpIHtcbiAgICAgICAgaW5wdXQuZmlsbCA9IFwiI0ZGRkZGRlwiO1xuICAgICAgfSk7XG5cbiAgICAgIGkuZmlsbCA9IFwiI0ZGRERCQlwiO1xuXG4gICAgICAvLyBUT0RPOiBIaWdobGlnaHQgaW5wdXQuXG4gICAgfSxcblxuICAgIC8vIE1vdmUgbGV0dGVyXG4gICAgbW92ZUxldHRlcjogZnVuY3Rpb24oYW1vdW50KSB7XG4gICAgICB2YXIgaSA9IHRoaXMuaElucHV0cy5nZXRDaGlsZEF0KHRoaXMuaElucHV0SW5kZXgpO1xuICAgICAgdmFyIHQgPSBpLnRleHQ7XG4gICAgICB2YXIgbiA9ICh0ID09PSBcIkFcIiAmJiBhbW91bnQgPT09IC0xKSA/IFwiWlwiIDpcbiAgICAgICAgKHQgPT09IFwiWlwiICYmIGFtb3VudCA9PT0gMSkgPyBcIkFcIiA6XG4gICAgICAgIFN0cmluZy5mcm9tQ2hhckNvZGUodC5jaGFyQ29kZUF0KDApICsgYW1vdW50KTtcblxuICAgICAgaS50ZXh0ID0gbjtcbiAgICB9LFxuXG4gICAgLy8gU2F2ZSBoaWdoc2NvcmVcbiAgICBzYXZlSGlnaHNjb3JlOiBmdW5jdGlvbigpIHtcbiAgICAgIC8vIEdldCBuYW1lXG4gICAgICB2YXIgbmFtZSA9IFwiXCI7XG4gICAgICB0aGlzLmhJbnB1dHMuZm9yRWFjaChmdW5jdGlvbihpbnB1dCkge1xuICAgICAgICBuYW1lID0gbmFtZSArIGlucHV0LnRleHQ7XG4gICAgICB9KTtcblxuICAgICAgLy8gRG9uJ3QgYWxsb3cgQUFBXG4gICAgICBpZiAobmFtZSA9PT0gXCJBQUFcIikge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIC8vIFNhdmUgaGlnaHNjb3JlXG4gICAgICB0aGlzLmdhbWUucGlja2xlLnNldEhpZ2hzY29yZSh0aGlzLnNjb3JlLCBuYW1lKTtcblxuICAgICAgLy8gUmVtb3ZlIGlucHV0XG4gICAgICB0aGlzLmhJbnB1dCA9IGZhbHNlO1xuICAgICAgdGhpcy5oSW5wdXRzLmRlc3Ryb3koKTtcbiAgICAgIHRoaXMuaEN1cnNvci5kZXN0cm95KCk7XG5cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0sXG5cbiAgICAvLyBIaWdoc2NvcmUgbGlzdFxuICAgIGhpZ2hzY29yZUxpc3Q6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5oaWdoc2NvcmVMaW1pdCA9IHRoaXMuZ2FtZS5waWNrbGUuaGlnaHNjb3JlTGltaXQgfHwgMztcbiAgICAgIHRoaXMuaGlnaHNjb3JlTGlzdEdyb3VwID0gdGhpcy5nYW1lLmFkZC5ncm91cCgpO1xuICAgICAgdGhpcy5nYW1lLnBpY2tsZS5zb3J0SGlnaHNjb3JlcygpO1xuICAgICAgdmFyIGZvbnRTaXplID0gdGhpcy5nYW1lLndvcmxkLmhlaWdodCAvIDI1O1xuICAgICAgdmFyIGJhc2VZID0gdGhpcy50aXRsZUltYWdlLmhlaWdodCArIHRoaXMueW91clNjb3JlSW1hZ2UuaGVpZ2h0ICtcbiAgICAgICAgdGhpcy5zY29yZVRleHQuaGVpZ2h0ICsgdGhpcy5wYWRkaW5nICogMTA7XG4gICAgICB2YXIgeE9mZnNldCA9IC10aGlzLnBhZGRpbmcgKiAyO1xuXG4gICAgICAvLyBBZGQgbGFiZWxcbiAgICAgIHRoaXMuaGlnaHNjb3JlTGlzdExhYmVsID0gbmV3IFBoYXNlci5UZXh0KHRoaXMuZ2FtZSwgMCwgMCxcbiAgICAgICAgXCJIaWdoIFNjb3Jlc1wiLCB7XG4gICAgICAgICAgZm9udDogXCJcIiArICh0aGlzLmdhbWUud29ybGQuaGVpZ2h0IC8gMTcuNSkgKyBcInB4IE9tbmVzUm9tYW4tYm9sZFwiLFxuICAgICAgICAgIGZpbGw6IFwiI2I4ZjRiY1wiLFxuICAgICAgICAgIGFsaWduOiBcInJpZ2h0XCIsXG4gICAgICAgIH0pO1xuICAgICAgdGhpcy5oaWdoc2NvcmVMaXN0TGFiZWwuYW5jaG9yLnNldFRvKDAuNSwgMCk7XG4gICAgICB0aGlzLmhpZ2hzY29yZUxpc3RMYWJlbC5yZXNldCh0aGlzLmNlbnRlclN0YWdlWCh0aGlzLmhpZ2hzY29yZUxpc3RMYWJlbCksIGJhc2VZKTtcbiAgICAgIHRoaXMuaGlnaHNjb3JlTGlzdEdyb3VwLmFkZCh0aGlzLmhpZ2hzY29yZUxpc3RMYWJlbCk7XG5cbiAgICAgIC8vIE5ldyBiYXNlIGhlaWdodFxuICAgICAgYmFzZVkgPSBiYXNlWSArIHRoaXMuaGlnaHNjb3JlTGlzdExhYmVsLmhlaWdodCArIHRoaXMucGFkZGluZyAqIDAuMjU7XG5cbiAgICAgIC8vIEFkZCBoaWdoIHNjb3Jlc1xuICAgICAgaWYgKHRoaXMuZ2FtZS5waWNrbGUuaGlnaHNjb3Jlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgIF8uZWFjaCh0aGlzLmdhbWUucGlja2xlLmhpZ2hzY29yZXMucmV2ZXJzZSgpLnNsaWNlKDAsIHRoaXMuaGlnaHNjb3JlTGltaXQpLFxuICAgICAgICAgIF8uYmluZChmdW5jdGlvbihoLCBpKSB7XG4gICAgICAgICAgLy8gTmFtZVxuICAgICAgICAgIHZhciBuYW1lID0gbmV3IFBoYXNlci5UZXh0KFxuICAgICAgICAgICAgdGhpcy5nYW1lLFxuICAgICAgICAgICAgdGhpcy5nYW1lLndpZHRoIC8gMiAtIHRoaXMucGFkZGluZyArIHhPZmZzZXQsXG4gICAgICAgICAgICBiYXNlWSArICgoZm9udFNpemUgKyB0aGlzLnBhZGRpbmcgLyAyKSAqIGkpLFxuICAgICAgICAgICAgaC5uYW1lLCB7XG4gICAgICAgICAgICAgIGZvbnQ6IFwiXCIgKyBmb250U2l6ZSArIFwicHggT21uZXNSb21hblwiLFxuICAgICAgICAgICAgICBmaWxsOiBcIiNiOGY0YmNcIixcbiAgICAgICAgICAgICAgYWxpZ246IFwicmlnaHRcIixcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIG5hbWUuYW5jaG9yLnNldFRvKDEsIDApO1xuXG4gICAgICAgICAgLy8gU2NvcmVcbiAgICAgICAgICB2YXIgc2NvcmUgPSBuZXcgUGhhc2VyLlRleHQoXG4gICAgICAgICAgICB0aGlzLmdhbWUsXG4gICAgICAgICAgICB0aGlzLmdhbWUud2lkdGggLyAyICsgdGhpcy5wYWRkaW5nICsgeE9mZnNldCxcbiAgICAgICAgICAgIGJhc2VZICsgKChmb250U2l6ZSArIHRoaXMucGFkZGluZyAvIDIpICogaSksXG4gICAgICAgICAgICBoLnNjb3JlLnRvTG9jYWxlU3RyaW5nKCksIHtcbiAgICAgICAgICAgICAgZm9udDogXCJcIiArIGZvbnRTaXplICsgXCJweCBPbW5lc1JvbWFuXCIsXG4gICAgICAgICAgICAgIGZpbGw6IFwiI2I4ZjRiY1wiLFxuICAgICAgICAgICAgICBhbGlnbjogXCJsZWZ0XCIsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICBzY29yZS5hbmNob3Iuc2V0VG8oMCwgMCk7XG5cbiAgICAgICAgICAvLyBBZGQgdG8gZ3JvdXBzXG4gICAgICAgICAgdGhpcy5oaWdoc2NvcmVMaXN0R3JvdXAuYWRkKG5hbWUpO1xuICAgICAgICAgIHRoaXMuaGlnaHNjb3JlTGlzdEdyb3VwLmFkZChzY29yZSk7XG4gICAgICAgIH0sIHRoaXMpKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLy8gQ2VudGVyIHggb24gc3RhZ2VcbiAgICBjZW50ZXJTdGFnZVg6IGZ1bmN0aW9uKG9iaikge1xuICAgICAgcmV0dXJuICgodGhpcy5nYW1lLndpZHRoIC0gb2JqLndpZHRoKSAvIDIpICsgKG9iai53aWR0aCAvIDIpO1xuICAgIH0sXG5cbiAgICAvLyBDZW50ZXIgeCBvbiBzdGFnZVxuICAgIGNlbnRlclN0YWdlWTogZnVuY3Rpb24ob2JqKSB7XG4gICAgICByZXR1cm4gKCh0aGlzLmdhbWUuaGVpZ2h0IC0gb2JqLmhlaWdodCkgLyAyKSArIChvYmouaGVpZ2h0IC8gMik7XG4gICAgfVxuICB9KTtcblxuICAvLyBFeHBvcnRcbiAgbW9kdWxlLmV4cG9ydHMgPSBHYW1lb3Zlcjtcbn0pKCk7XG4iLCIvKiBnbG9iYWwgXzpmYWxzZSwgUGhhc2VyOmZhbHNlICovXG5cbi8qKlxuICogTWVudSBzdGF0ZVxuICovXG5cbihmdW5jdGlvbigpIHtcbiAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgLy8gQ29uc3RydWN0b3JcbiAgdmFyIE1lbnUgPSBmdW5jdGlvbigpIHtcbiAgICBQaGFzZXIuU3RhdGUuY2FsbCh0aGlzKTtcbiAgfTtcblxuICAvLyBFeHRlbmQgZnJvbSBTdGF0ZVxuICBNZW51LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUGhhc2VyLlN0YXRlLnByb3RvdHlwZSk7XG4gIE1lbnUucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gTWVudTtcblxuICAvLyBBZGQgbWV0aG9kc1xuICBfLmV4dGVuZChNZW51LnByb3RvdHlwZSwgUGhhc2VyLlN0YXRlLnByb3RvdHlwZSwge1xuICAgIC8vIFByZWxvYWRcbiAgICBwcmVsb2FkOiBmdW5jdGlvbigpIHtcbiAgICAgIC8vIExvYWQgdXAgZ2FtZSBpbWFnZXNcbiAgICAgIHRoaXMuZ2FtZS5sb2FkLmF0bGFzKFwidGl0bGUtc3ByaXRlc1wiLCBcImFzc2V0cy90aXRsZS1zcHJpdGVzLnBuZ1wiLCBcImFzc2V0cy90aXRsZS1zcHJpdGVzLmpzb25cIik7XG4gICAgfSxcblxuICAgIC8vIENyZWF0ZVxuICAgIGNyZWF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAvLyBTZXQgYmFja2dyb3VuZFxuICAgICAgdGhpcy5nYW1lLnN0YWdlLmJhY2tncm91bmRDb2xvciA9IFwiI2I4ZjRiY1wiO1xuXG4gICAgICAvLyBNYWtlIHBhZGRpbmcgZGVwZW5kZW50IG9uIHdpZHRoXG4gICAgICB0aGlzLnBhZGRpbmcgPSB0aGlzLmdhbWUud2lkdGggLyA1MDtcblxuICAgICAgLy8gUGxhY2UgdGl0bGVcbiAgICAgIHRoaXMudGl0bGVJbWFnZSA9IHRoaXMuZ2FtZS5hZGQuc3ByaXRlKDAsIDAsIFwidGl0bGUtc3ByaXRlc1wiLCBcInRpdGxlLnBuZ1wiKTtcbiAgICAgIHRoaXMudGl0bGVJbWFnZS5hbmNob3Iuc2V0VG8oMC41LCAwLjUpO1xuICAgICAgdGhpcy50aXRsZUltYWdlLnNjYWxlLnNldFRvKCh0aGlzLmdhbWUud2lkdGggLSAodGhpcy5wYWRkaW5nICogNCkpIC8gdGhpcy50aXRsZUltYWdlLndpZHRoKTtcbiAgICAgIHRoaXMudGl0bGVJbWFnZS5yZXNldCh0aGlzLmNlbnRlclN0YWdlWCh0aGlzLnRpdGxlSW1hZ2UpLFxuICAgICAgICB0aGlzLmNlbnRlclN0YWdlWSh0aGlzLnRpdGxlSW1hZ2UpIC0gdGhpcy5wYWRkaW5nICogNCk7XG4gICAgICB0aGlzLmdhbWUuYWRkLmV4aXN0aW5nKHRoaXMudGl0bGVJbWFnZSk7XG5cbiAgICAgIC8vIFBsYWNlIHBsYXlcbiAgICAgIHRoaXMucGxheUltYWdlID0gdGhpcy5nYW1lLmFkZC5zcHJpdGUoMCwgMCwgXCJ0aXRsZS1zcHJpdGVzXCIsIFwidGl0bGUtcGxheS5wbmdcIik7XG4gICAgICB0aGlzLnBsYXlJbWFnZS5hbmNob3Iuc2V0VG8oMC40LCAxKTtcbiAgICAgIHRoaXMucGxheUltYWdlLnNjYWxlLnNldFRvKCh0aGlzLmdhbWUud2lkdGggKiAwLjUpIC8gdGhpcy50aXRsZUltYWdlLndpZHRoKTtcbiAgICAgIHRoaXMucGxheUltYWdlLnJlc2V0KHRoaXMuY2VudGVyU3RhZ2VYKHRoaXMucGxheUltYWdlKSwgdGhpcy5nYW1lLmhlaWdodCAtIHRoaXMucGFkZGluZyAqIDIpO1xuICAgICAgdGhpcy5nYW1lLmFkZC5leGlzdGluZyh0aGlzLnBsYXlJbWFnZSk7XG5cbiAgICAgIC8vIEFkZCBob3ZlciBmb3IgbW91c2VcbiAgICAgIHRoaXMucGxheUltYWdlLmlucHV0RW5hYmxlZCA9IHRydWU7XG4gICAgICB0aGlzLnBsYXlJbWFnZS5ldmVudHMub25JbnB1dE92ZXIuYWRkKGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLnBsYXlJbWFnZS5vcmlnaW5hbFRpbnQgPSB0aGlzLnBsYXlJbWFnZS50aW50O1xuICAgICAgICB0aGlzLnBsYXlJbWFnZS50aW50ID0gMC41ICogMHhGRkZGRkY7XG4gICAgICB9LCB0aGlzKTtcblxuICAgICAgdGhpcy5wbGF5SW1hZ2UuZXZlbnRzLm9uSW5wdXRPdXQuYWRkKGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLnBsYXlJbWFnZS50aW50ID0gdGhpcy5wbGF5SW1hZ2Uub3JpZ2luYWxUaW50O1xuICAgICAgfSwgdGhpcyk7XG5cbiAgICAgIC8vIEFkZCBtb3VzZSBpbnRlcmFjdGlvblxuICAgICAgdGhpcy5wbGF5SW1hZ2UuZXZlbnRzLm9uSW5wdXREb3duLmFkZCh0aGlzLmdvLCB0aGlzKTtcblxuICAgICAgLy8gQWRkIGtleWJvYXJkIGludGVyYWN0aW9uXG4gICAgICB0aGlzLmFjdGlvbkJ1dHRvbiA9IHRoaXMuZ2FtZS5pbnB1dC5rZXlib2FyZC5hZGRLZXkoUGhhc2VyLktleWJvYXJkLlNQQUNFQkFSKTtcbiAgICAgIHRoaXMuYWN0aW9uQnV0dG9uLm9uRG93bi5hZGQoZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuZ28oKTtcbiAgICAgIH0sIHRoaXMpO1xuXG4gICAgICAvLyBTaG93IGFueSBvdmVybGF5c1xuICAgICAgdGhpcy5nYW1lLnBpY2tsZS5zaG93T3ZlcmxheShcIi5zdGF0ZS1tZW51XCIpO1xuICAgIH0sXG5cbiAgICAvLyBTdGFydCBwbGF5aW5nXG4gICAgZ286IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5nYW1lLnBpY2tsZS5oaWRlT3ZlcmxheShcIi5zdGF0ZS1tZW51XCIpO1xuICAgICAgdGhpcy5nYW1lLnN0YXRlLnN0YXJ0KFwicGxheVwiKTtcbiAgICB9LFxuXG4gICAgLy8gVXBkYXRlXG4gICAgdXBkYXRlOiBmdW5jdGlvbigpIHtcbiAgICB9LFxuXG4gICAgLy8gQ2VudGVyIHggb24gc3RhZ2VcbiAgICBjZW50ZXJTdGFnZVg6IGZ1bmN0aW9uKG9iaikge1xuICAgICAgcmV0dXJuICgodGhpcy5nYW1lLndpZHRoIC0gb2JqLndpZHRoKSAvIDIpICsgKG9iai53aWR0aCAvIDIpO1xuICAgIH0sXG5cbiAgICAvLyBDZW50ZXIgeCBvbiBzdGFnZVxuICAgIGNlbnRlclN0YWdlWTogZnVuY3Rpb24ob2JqKSB7XG4gICAgICByZXR1cm4gKCh0aGlzLmdhbWUuaGVpZ2h0IC0gb2JqLmhlaWdodCkgLyAyKSArIChvYmouaGVpZ2h0IC8gMik7XG4gICAgfVxuICB9KTtcblxuICAvLyBFeHBvcnRcbiAgbW9kdWxlLmV4cG9ydHMgPSBNZW51O1xufSkoKTtcbiIsIi8qIGdsb2JhbCBfOmZhbHNlLCBQaGFzZXI6ZmFsc2UgKi9cblxuLyoqXG4gKiBQbGF5IHN0YXRlXG4gKi9cblxuKGZ1bmN0aW9uKCkge1xuICBcInVzZSBzdHJpY3RcIjtcblxuICAvLyBEZXBlbmRlbmNpZXNcbiAgdmFyIHByZWZhYnMgPSB7XG4gICAgRGlsbDogcmVxdWlyZShcIi4vcHJlZmFiLWRpbGwuanNcIiksXG4gICAgUGVwcGVyOiByZXF1aXJlKFwiLi9wcmVmYWItcGVwcGVyLmpzXCIpLFxuICAgIEJvdHVsaXNtOiByZXF1aXJlKFwiLi9wcmVmYWItYm90dWxpc20uanNcIiksXG4gICAgTWluaTogcmVxdWlyZShcIi4vcHJlZmFiLW1pbmkuanNcIiksXG4gICAgSGVybzogcmVxdWlyZShcIi4vcHJlZmFiLWhlcm8uanNcIiksXG4gICAgQmVhbjogcmVxdWlyZShcIi4vcHJlZmFiLWJlYW4uanNcIiksXG4gICAgQ2Fycm90OiByZXF1aXJlKFwiLi9wcmVmYWItY2Fycm90LmpzXCIpLFxuICAgIEphcjogcmVxdWlyZShcIi4vcHJlZmFiLWphci5qc1wiKVxuICB9O1xuXG4gIC8vIENvbnN0cnVjdG9yXG4gIHZhciBQbGF5ID0gZnVuY3Rpb24oKSB7XG4gICAgUGhhc2VyLlN0YXRlLmNhbGwodGhpcyk7XG4gIH07XG5cbiAgLy8gRXh0ZW5kIGZyb20gU3RhdGVcbiAgUGxheS5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFBoYXNlci5TdGF0ZS5wcm90b3R5cGUpO1xuICBQbGF5LnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFBsYXk7XG5cbiAgLy8gQWRkIG1ldGhvZHNcbiAgXy5leHRlbmQoUGxheS5wcm90b3R5cGUsIFBoYXNlci5TdGF0ZS5wcm90b3R5cGUsIHtcbiAgICAvLyBQcmVsb2FkXG4gICAgcHJlbG9hZDogZnVuY3Rpb24oKSB7XG4gICAgICAvLyBMb2FkIHVwIGdhbWUgaW1hZ2VzXG4gICAgICB0aGlzLmdhbWUubG9hZC5hdGxhcyhcImdhbWUtc3ByaXRlc1wiLCBcImFzc2V0cy9nYW1lLXNwcml0ZXMucG5nXCIsIFwiYXNzZXRzL2dhbWUtc3ByaXRlcy5qc29uXCIpO1xuICAgICAgdGhpcy5nYW1lLmxvYWQuYXRsYXMoXCJwaWNrbGUtc3ByaXRlc1wiLCBcImFzc2V0cy9waWNrbGUtc3ByaXRlcy5wbmdcIiwgXCJhc3NldHMvcGlja2xlLXNwcml0ZXMuanNvblwiKTtcbiAgICAgIHRoaXMuZ2FtZS5sb2FkLmF0bGFzKFwiY2Fycm90LXNwcml0ZXNcIiwgXCJhc3NldHMvY2Fycm90LXNwcml0ZXMucG5nXCIsIFwiYXNzZXRzL2NhcnJvdC1zcHJpdGVzLmpzb25cIik7XG4gICAgfSxcblxuICAgIC8vIENyZWF0ZVxuICAgIGNyZWF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAvLyBTZXQgaW5pdGlhbCBkaWZmaWN1bHR5IGFuZCBsZXZlbCBzZXR0aW5nc1xuICAgICAgdGhpcy5jcmVhdGVTdXBlckxldmVsQkcoKTtcbiAgICAgIHRoaXMudXBkYXRlRGlmZmljdWx0eSgpO1xuXG4gICAgICAvLyBTY29yaW5nXG4gICAgICB0aGlzLnNjb3JlTWluaSA9IDEwMDtcbiAgICAgIHRoaXMuc2NvcmVEaWxsID0gNTAwO1xuICAgICAgdGhpcy5zY29yZVBlcHBlciA9IDc1MDtcbiAgICAgIHRoaXMuc2NvcmVCb3QgPSAxMDAwO1xuXG4gICAgICAvLyBTcGFjaW5nXG4gICAgICB0aGlzLnBhZGRpbmcgPSAxMDtcblxuICAgICAgLy8gRGV0ZXJtaW5lIHdoZXJlIGZpcnN0IHBsYXRmb3JtIGFuZCBoZXJvIHdpbGwgYmUuXG4gICAgICB0aGlzLnN0YXJ0WSA9IHRoaXMuZ2FtZS5oZWlnaHQgLSA1O1xuXG4gICAgICAvLyBJbml0aWFsaXplIHRyYWNraW5nIHZhcmlhYmxlc1xuICAgICAgdGhpcy5yZXNldFZpZXdUcmFja2luZygpO1xuXG4gICAgICAvLyBTY2FsaW5nXG4gICAgICB0aGlzLmdhbWUuc2NhbGUuc2NhbGVNb2RlID0gUGhhc2VyLlNjYWxlTWFuYWdlci5TSE9XX0FMTDtcbiAgICAgIHRoaXMuZ2FtZS5zY2FsZS5tYXhXaWR0aCA9IHRoaXMuZ2FtZS53aWR0aDtcbiAgICAgIHRoaXMuZ2FtZS5zY2FsZS5tYXhIZWlnaHQgPSB0aGlzLmdhbWUuaGVpZ2h0O1xuICAgICAgdGhpcy5nYW1lLnNjYWxlLnBhZ2VBbGlnbkhvcml6b250YWxseSA9IHRydWU7XG4gICAgICB0aGlzLmdhbWUuc2NhbGUucGFnZUFsaWduVmVydGljYWxseSA9IHRydWU7XG5cbiAgICAgIC8vIFBoeXNpY3NcbiAgICAgIHRoaXMuZ2FtZS5waHlzaWNzLnN0YXJ0U3lzdGVtKFBoYXNlci5QaHlzaWNzLkFSQ0FERSk7XG4gICAgICB0aGlzLmdhbWUucGh5c2ljcy5hcmNhZGUuZ3Jhdml0eS55ID0gMTAwMDtcblxuICAgICAgLy8gQ29udGFpbmVyc1xuICAgICAgdGhpcy5iZWFucyA9IHRoaXMuZ2FtZS5hZGQuZ3JvdXAoKTtcbiAgICAgIHRoaXMuY2Fycm90cyA9IHRoaXMuZ2FtZS5hZGQuZ3JvdXAoKTtcbiAgICAgIHRoaXMubWluaXMgPSB0aGlzLmdhbWUuYWRkLmdyb3VwKCk7XG4gICAgICB0aGlzLmRpbGxzID0gdGhpcy5nYW1lLmFkZC5ncm91cCgpO1xuICAgICAgdGhpcy5wZXBwZXJzID0gdGhpcy5nYW1lLmFkZC5ncm91cCgpO1xuICAgICAgdGhpcy5ib3RzID0gdGhpcy5nYW1lLmFkZC5ncm91cCgpO1xuXG4gICAgICAvLyBQbGF0Zm9ybXNcbiAgICAgIHRoaXMuYWRkUGxhdGZvcm1zKCk7XG5cbiAgICAgIC8vIEFkZCBoZXJvIGhlcmUgc28gaXMgYWx3YXlzIG9uIHRvcC5cbiAgICAgIHRoaXMuaGVybyA9IG5ldyBwcmVmYWJzLkhlcm8odGhpcy5nYW1lLCAwLCAwKTtcbiAgICAgIHRoaXMuaGVyby5yZXNldFBsYWNlbWVudCh0aGlzLmdhbWUud2lkdGggKiAwLjUsIHRoaXMuc3RhcnRZIC0gdGhpcy5oZXJvLmhlaWdodCAtIDUwKTtcbiAgICAgIHRoaXMuZ2FtZS5hZGQuZXhpc3RpbmcodGhpcy5oZXJvKTtcblxuICAgICAgLy8gSW5pdGlhbGl6ZSBzY29yZVxuICAgICAgdGhpcy5yZXNldFNjb3JlKCk7XG4gICAgICB0aGlzLnVwZGF0ZVNjb3JlKCk7XG5cbiAgICAgIC8vIEN1cnNvcnMsIGlucHV0XG4gICAgICB0aGlzLmN1cnNvcnMgPSB0aGlzLmdhbWUuaW5wdXQua2V5Ym9hcmQuY3JlYXRlQ3Vyc29yS2V5cygpO1xuICAgICAgdGhpcy5hY3Rpb25CdXR0b24gPSB0aGlzLmdhbWUuaW5wdXQua2V5Ym9hcmQuYWRkS2V5KFBoYXNlci5LZXlib2FyZC5TUEFDRUJBUik7XG4gICAgfSxcblxuICAgIC8vIFVwZGF0ZVxuICAgIHVwZGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAvLyBUaGlzIGlzIHdoZXJlIHRoZSBtYWluIG1hZ2ljIGhhcHBlbnNcbiAgICAgIC8vIHRoZSB5IG9mZnNldCBhbmQgdGhlIGhlaWdodCBvZiB0aGUgd29ybGQgYXJlIGFkanVzdGVkXG4gICAgICAvLyB0byBtYXRjaCB0aGUgaGlnaGVzdCBwb2ludCB0aGUgaGVybyBoYXMgcmVhY2hlZFxuICAgICAgdGhpcy53b3JsZC5zZXRCb3VuZHMoMCwgLXRoaXMuaGVyby55Q2hhbmdlLCB0aGlzLmdhbWUud29ybGQud2lkdGgsXG4gICAgICAgIHRoaXMuZ2FtZS5oZWlnaHQgKyB0aGlzLmhlcm8ueUNoYW5nZSk7XG5cbiAgICAgIC8vIFRoZSBidWlsdCBpbiBjYW1lcmEgZm9sbG93IG1ldGhvZHMgd29uJ3Qgd29yayBmb3Igb3VyIG5lZWRzXG4gICAgICAvLyB0aGlzIGlzIGEgY3VzdG9tIGZvbGxvdyBzdHlsZSB0aGF0IHdpbGwgbm90IGV2ZXIgbW92ZSBkb3duLCBpdCBvbmx5IG1vdmVzIHVwXG4gICAgICB0aGlzLmNhbWVyYVlNaW4gPSBNYXRoLm1pbih0aGlzLmNhbWVyYVlNaW4sIHRoaXMuaGVyby55IC0gdGhpcy5nYW1lLmhlaWdodCAvIDIpO1xuICAgICAgdGhpcy5jYW1lcmEueSA9IHRoaXMuY2FtZXJhWU1pbjtcblxuICAgICAgLy8gSWYgaGVybyBmYWxscyBiZWxvdyBjYW1lcmFcbiAgICAgIGlmICh0aGlzLmhlcm8ueSA+IHRoaXMuY2FtZXJhWU1pbiArIHRoaXMuZ2FtZS5oZWlnaHQgKyAyMDApIHtcbiAgICAgICAgdGhpcy5nYW1lT3ZlcigpO1xuICAgICAgfVxuXG4gICAgICAvLyBJZiBoZXJvIGlzIGdvaW5nIGRvd24sIHRoZW4gbm8gbG9uZ2VyIG9uIGZpcmVcbiAgICAgIGlmICh0aGlzLmhlcm8uYm9keS52ZWxvY2l0eS55ID4gMCkge1xuICAgICAgICB0aGlzLnB1dE91dEZpcmUoKTtcbiAgICAgIH1cblxuICAgICAgLy8gTW92ZSBoZXJvXG4gICAgICB0aGlzLmhlcm8uYm9keS52ZWxvY2l0eS54ID1cbiAgICAgICAgKHRoaXMuY3Vyc29ycy5sZWZ0LmlzRG93bikgPyAtKHRoaXMuZ2FtZS5waHlzaWNzLmFyY2FkZS5ncmF2aXR5LnkgLyA1KSA6XG4gICAgICAgICh0aGlzLmN1cnNvcnMucmlnaHQuaXNEb3duKSA/ICh0aGlzLmdhbWUucGh5c2ljcy5hcmNhZGUuZ3Jhdml0eS55IC8gNSkgOiAwO1xuXG4gICAgICAvLyBDb2xsaXNpb25zXG4gICAgICB0aGlzLnVwZGF0ZUNvbGxpc2lvbnMoKTtcblxuICAgICAgLy8gSXRlbXMgKHBsYXRmb3JtcyBhbmQgaXRlbXMpXG4gICAgICB0aGlzLnVwZGF0ZUl0ZW1zKCk7XG5cbiAgICAgIC8vIFVwZGF0ZSBzY29yZVxuICAgICAgdGhpcy51cGRhdGVTY29yZSgpO1xuXG4gICAgICAvLyBVcGRhdGUgZGlmZmljdWx0XG4gICAgICB0aGlzLnVwZGF0ZURpZmZpY3VsdHkoKTtcblxuICAgICAgLy8gU2hha2VcbiAgICAgIHRoaXMudXBkYXRlV29ybGRTaGFrZSgpO1xuXG4gICAgICAvLyBEZWJ1Z1xuICAgICAgaWYgKHRoaXMuZ2FtZS5waWNrbGUub3B0aW9ucy5kZWJ1Zykge1xuICAgICAgICB0aGlzLmdhbWUuZGVidWcuYm9keSh0aGlzLmhlcm8pO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICAvLyBIYW5kbGUgY29sbGlzaW9uc1xuICAgIHVwZGF0ZUNvbGxpc2lvbnM6IGZ1bmN0aW9uKCkge1xuICAgICAgLy8gV2hlbiBkZWFkLCBubyBjb2xsaXNpb25zLCBqdXN0IGZhbGwgdG8gZGVhdGguXG4gICAgICBpZiAodGhpcy5oZXJvLmlzRGVhZCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIFBsYXRmb3JtIGNvbGxpc2lvbnNcbiAgICAgIHRoaXMuZ2FtZS5waHlzaWNzLmFyY2FkZS5jb2xsaWRlKHRoaXMuaGVybywgdGhpcy5iZWFucywgdGhpcy51cGRhdGVIZXJvUGxhdGZvcm0sIG51bGwsIHRoaXMpO1xuICAgICAgdGhpcy5nYW1lLnBoeXNpY3MuYXJjYWRlLmNvbGxpZGUodGhpcy5oZXJvLCB0aGlzLmNhcnJvdHMsIHRoaXMudXBkYXRlSGVyb1BsYXRmb3JtLCBudWxsLCB0aGlzKTtcbiAgICAgIHRoaXMuZ2FtZS5waHlzaWNzLmFyY2FkZS5jb2xsaWRlKHRoaXMuaGVybywgdGhpcy5iYXNlLCB0aGlzLnVwZGF0ZUhlcm9QbGF0Zm9ybSwgbnVsbCwgdGhpcyk7XG5cbiAgICAgIC8vIE1pbmkgY29sbGlzaW9uc1xuICAgICAgdGhpcy5nYW1lLnBoeXNpY3MuYXJjYWRlLm92ZXJsYXAodGhpcy5oZXJvLCB0aGlzLm1pbmlzLCBmdW5jdGlvbihoZXJvLCBtaW5pKSB7XG4gICAgICAgIG1pbmkua2lsbCgpO1xuICAgICAgICB0aGlzLnVwZGF0ZVNjb3JlKHRoaXMuc2NvcmVNaW5pKTtcbiAgICAgIH0sIG51bGwsIHRoaXMpO1xuXG4gICAgICAvLyBEaWxsIGNvbGxpc2lvbnMuICBEb24ndCBkbyBhbnl0aGluZyBpZiBvbiBmaXJlXG4gICAgICBpZiAoIXRoaXMub25GaXJlKSB7XG4gICAgICAgIHRoaXMuZ2FtZS5waHlzaWNzLmFyY2FkZS5vdmVybGFwKHRoaXMuaGVybywgdGhpcy5kaWxscywgZnVuY3Rpb24oaGVybywgZGlsbCkge1xuICAgICAgICAgIGRpbGwua2lsbCgpO1xuICAgICAgICAgIHRoaXMudXBkYXRlU2NvcmUodGhpcy5zY29yZURpbGwpO1xuICAgICAgICAgIGhlcm8uYm9keS52ZWxvY2l0eS55ID0gdGhpcy5nYW1lLnBoeXNpY3MuYXJjYWRlLmdyYXZpdHkueSAqIC0xICogMS41O1xuICAgICAgICB9LCBudWxsLCB0aGlzKTtcbiAgICAgIH1cblxuICAgICAgLy8gUGVwcGVyIGNvbGxpc2lvbnNcbiAgICAgIHRoaXMuZ2FtZS5waHlzaWNzLmFyY2FkZS5vdmVybGFwKHRoaXMuaGVybywgdGhpcy5wZXBwZXJzLCBmdW5jdGlvbihoZXJvLCBwZXBwZXIpIHtcbiAgICAgICAgcGVwcGVyLmtpbGwoKTtcbiAgICAgICAgdGhpcy51cGRhdGVTY29yZSh0aGlzLnNjb3JlUGVwcGVyKTtcbiAgICAgICAgdGhpcy5zZXRPbkZpcmUoKTtcbiAgICAgICAgaGVyby5ib2R5LnZlbG9jaXR5LnkgPSB0aGlzLmdhbWUucGh5c2ljcy5hcmNhZGUuZ3Jhdml0eS55ICogLTEgKiAzO1xuICAgICAgfSwgbnVsbCwgdGhpcyk7XG5cbiAgICAgIC8vIEJvdHVsaXNtIGNvbGxpc2lvbnMuICBJZiBoZXJvIGp1bXBzIG9uIHRvcCwgdGhlbiBraWxsLCBvdGhlcndpc2UgZGllLCBhbmRcbiAgICAgIC8vIGlnbm9yZSBpZiBvbiBmaXJlLlxuICAgICAgaWYgKCF0aGlzLm9uRmlyZSkge1xuICAgICAgICB0aGlzLmdhbWUucGh5c2ljcy5hcmNhZGUuY29sbGlkZSh0aGlzLmhlcm8sIHRoaXMuYm90cywgZnVuY3Rpb24oaGVybywgYm90KSB7XG4gICAgICAgICAgaWYgKGhlcm8uYm9keS50b3VjaGluZy5kb3duKSB7XG4gICAgICAgICAgICBib3QubXVyZGVyKCk7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZVNjb3JlKHRoaXMuc2NvcmVCb3QpO1xuICAgICAgICAgICAgaGVyby5ib2R5LnZlbG9jaXR5LnkgPSB0aGlzLmdhbWUucGh5c2ljcy5hcmNhZGUuZ3Jhdml0eS55ICogLTEgKiAwLjU7XG4gICAgICAgICAgfVxuICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgaGVyby5ib3RjaHlNdXJkZXIoKTtcbiAgICAgICAgICAgIGJvdC5tdXJkZXIoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0sIG51bGwsIHRoaXMpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICAvLyBQbGF0Zm9ybSBjb2xsaXNpb25cbiAgICB1cGRhdGVIZXJvUGxhdGZvcm06IGZ1bmN0aW9uKGhlcm8sIGl0ZW0pIHtcbiAgICAgIC8vIE1ha2Ugc3VyZSBubyBsb25nZXIgb24gZmlyZVxuICAgICAgdGhpcy5wdXRPdXRGaXJlKCk7XG5cbiAgICAgIC8vIEp1bXBcbiAgICAgIGhlcm8uYm9keS52ZWxvY2l0eS55ID0gdGhpcy5nYW1lLnBoeXNpY3MuYXJjYWRlLmdyYXZpdHkueSAqIC0xICogMC43O1xuXG4gICAgICAvLyBJZiBjYXJyb3QsIHNuYXBcbiAgICAgIGlmIChpdGVtIGluc3RhbmNlb2YgcHJlZmFicy5DYXJyb3QpIHtcbiAgICAgICAgaXRlbS5zbmFwKCk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIC8vIEhhbmRsZSBpdGVtc1xuICAgIHVwZGF0ZUl0ZW1zOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBoaWdoZXN0O1xuICAgICAgdmFyIGJlYW47XG4gICAgICB2YXIgY2Fycm90O1xuXG4gICAgICAvLyBSZW1vdmUgYW55IHBvb2wgaXRlbXMgdGhhdCBhcmUgb2ZmIHNjcmVlblxuICAgICAgW1wibWluaXNcIiwgXCJkaWxsc1wiLCBcImJvdHNcIiwgXCJwZXBwZXJzXCIsIFwiYmVhbnNcIiwgXCJjYXJyb3RzXCJdLmZvckVhY2goXy5iaW5kKGZ1bmN0aW9uKHBvb2wpIHtcbiAgICAgICAgdGhpc1twb29sXS5mb3JFYWNoQWxpdmUoZnVuY3Rpb24ocCkge1xuICAgICAgICAgIC8vIENoZWNrIGlmIHRoaXMgb25lIGlzIG9mIHRoZSBzY3JlZW5cbiAgICAgICAgICBpZiAocC55ID4gdGhpcy5jYW1lcmEueSArIHRoaXMuZ2FtZS5oZWlnaHQpIHtcbiAgICAgICAgICAgIHAua2lsbCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSwgdGhpcyk7XG4gICAgICB9LCB0aGlzKSk7XG5cbiAgICAgIC8vIFJlbW92ZSBhbnkgcmVndWxhciBpdGVtcyB0aGF0IGFyZSBvZmYgc2NyZWVuXG4gICAgICBbXCJiYXNlXCJdLmZvckVhY2goXy5iaW5kKGZ1bmN0aW9uKHApIHtcbiAgICAgICAgaWYgKHRoaXNbcF0gJiYgdGhpc1twXS5hbGl2ZSAmJiB0aGlzW3BdLnkgPiB0aGlzLmNhbWVyYS55ICsgdGhpcy5nYW1lLmhlaWdodCAqIDIpIHtcbiAgICAgICAgICB0aGlzW3BdLmtpbGwoKTtcbiAgICAgICAgfVxuICAgICAgfSwgdGhpcykpO1xuXG4gICAgICAvLyBEZXRlcm1pbmUgd2hlcmUgdGhlIGxhc3QgcGxhdGZvcm0gaXNcbiAgICAgIFtcImJlYW5zXCIsIFwiY2Fycm90c1wiXS5mb3JFYWNoKF8uYmluZChmdW5jdGlvbihncm91cCkge1xuICAgICAgICB0aGlzW2dyb3VwXS5mb3JFYWNoQWxpdmUoZnVuY3Rpb24ocCkge1xuICAgICAgICAgIGlmIChwLnkgPCB0aGlzLnBsYXRmb3JtWU1pbikge1xuICAgICAgICAgICAgdGhpcy5wbGF0Zm9ybVlNaW4gPSBwLnk7XG4gICAgICAgICAgICBoaWdoZXN0ID0gcDtcbiAgICAgICAgICB9XG4gICAgICAgIH0sIHRoaXMpO1xuICAgICAgfSwgdGhpcykpO1xuXG4gICAgICAvLyBBZGQgbmV3IHBsYXRmb3JtIGlmIG5lZWRlZFxuICAgICAgY2Fycm90ID0gdGhpcy5jYXJyb3RzLmdldEZpcnN0RGVhZCgpO1xuICAgICAgYmVhbiA9IHRoaXMuYmVhbnMuZ2V0Rmlyc3REZWFkKCk7XG4gICAgICBpZiAoY2Fycm90ICYmIGJlYW4pIHtcbiAgICAgICAgaWYgKHRoaXMuY2hhbmNlKFwicGxhdGZvcm1zXCIpID09PSBcImNhcnJvdFwiKSB7XG4gICAgICAgICAgdGhpcy5wbGFjZVBsYXRmb3JtKGNhcnJvdCwgaGlnaGVzdCwgdW5kZWZpbmVkLCBcImNhcnJvdFwiKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICB0aGlzLnBsYWNlUGxhdGZvcm0oYmVhbiwgaGlnaGVzdCwgdW5kZWZpbmVkLCBcImJlYW5cIik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLy8gU2hha2Ugd29ybGQgZWZmZWN0XG4gICAgdXBkYXRlV29ybGRTaGFrZTogZnVuY3Rpb24oKSB7XG4gICAgICBpZiAodGhpcy5zaGFrZVdvcmxkQ291bnRlciA+IDApIHtcbiAgICAgICAgdmFyIG1hZ25pdHVkZSA9IE1hdGgubWF4KHRoaXMuc2hha2VXb3JsZENvdW50ZXIgLyA1MCwgMSkgKyAxO1xuICAgICAgICB2YXIgcnggPSB0aGlzLmdhbWUucm5kLmludGVnZXJJblJhbmdlKC00ICogbWFnbml0dWRlLCA0ICogbWFnbml0dWRlKTtcbiAgICAgICAgdmFyIHJ5ID0gdGhpcy5nYW1lLnJuZC5pbnRlZ2VySW5SYW5nZSgtMiAqIG1hZ25pdHVkZSwgMiAqIG1hZ25pdHVkZSk7XG4gICAgICAgIHRoaXMuZ2FtZS5jYW1lcmEueCArPSByeDtcbiAgICAgICAgdGhpcy5nYW1lLmNhbWVyYS55ICs9IHJ5O1xuICAgICAgICB0aGlzLnNoYWtlV29ybGRDb3VudGVyLS07XG5cbiAgICAgICAgaWYgKHRoaXMuc2hha2VXb3JsZENvdW50ZXIgPD0gMCkge1xuICAgICAgICAgIHRoaXMuZ2FtZS5jYW1lcmEueCA9IDA7XG4gICAgICAgICAgdGhpcy5nYW1lLmNhbWVyYS55ID0gMDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG5cbiAgICAvLyBTaHV0ZG93blxuICAgIHNodXRkb3duOiBmdW5jdGlvbigpIHtcbiAgICAgIC8vIFJlc2V0IGV2ZXJ5dGhpbmcsIG9yIHRoZSB3b3JsZCB3aWxsIGJlIG1lc3NlZCB1cFxuICAgICAgdGhpcy53b3JsZC5zZXRCb3VuZHMoMCwgMCwgdGhpcy5nYW1lLndpZHRoLCB0aGlzLmdhbWUuaGVpZ2h0KTtcbiAgICAgIHRoaXMuY3Vyc29yID0gbnVsbDtcbiAgICAgIHRoaXMucmVzZXRWaWV3VHJhY2tpbmcoKTtcbiAgICAgIHRoaXMucmVzZXRTY29yZSgpO1xuXG4gICAgICBbXCJoZXJvXCIsIFwiYmVhbnNcIiwgXCJtaW5pc1wiLCBcImRpbGxzXCIsIFwicGVwcGVyc1wiLFxuICAgICAgICBcImNhcnJvdHNcIiwgXCJzY29yZUdyb3VwXCJdLmZvckVhY2goXy5iaW5kKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgaWYgKHRoaXNbaXRlbV0pIHtcbiAgICAgICAgICB0aGlzW2l0ZW1dLmRlc3Ryb3koKTtcbiAgICAgICAgICB0aGlzW2l0ZW1dID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgfSwgdGhpcykpO1xuICAgIH0sXG5cbiAgICAvLyBHYW1lIG92ZXJcbiAgICBnYW1lT3ZlcjogZnVuY3Rpb24oKSB7XG4gICAgICAvLyBDYW4ndCBzZWVtIHRvIGZpbmQgYSB3YXkgdG8gcGFzcyB0aGUgc2NvcmVcbiAgICAgIC8vIHZpYSBhIHN0YXRlIGNoYW5nZS5cbiAgICAgIHRoaXMuZ2FtZS5waWNrbGUuc2NvcmUgPSB0aGlzLnNjb3JlO1xuICAgICAgdGhpcy5nYW1lLnN0YXRlLnN0YXJ0KFwiZ2FtZW92ZXJcIik7XG4gICAgfSxcblxuICAgIC8vIFNoYWtlIHdvcmxkXG4gICAgc2hha2U6IGZ1bmN0aW9uKGxlbmd0aCkge1xuICAgICAgdGhpcy5zaGFrZVdvcmxkQ291bnRlciA9ICghbGVuZ3RoKSA/IDAgOiB0aGlzLnNoYWtlV29ybGRDb3VudGVyICsgbGVuZ3RoO1xuICAgIH0sXG5cbiAgICAvLyBBZGQgcGxhdGZvcm0gcG9vbCBhbmQgY3JlYXRlIGluaXRpYWwgb25lXG4gICAgYWRkUGxhdGZvcm1zOiBmdW5jdGlvbigpIHtcbiAgICAgIC8vIEFkZCBiYXNlIHBsYXRmb3JtIChqYXIpLlxuICAgICAgdGhpcy5iYXNlID0gbmV3IHByZWZhYnMuSmFyKHRoaXMuZ2FtZSwgdGhpcy5nYW1lLndpZHRoICogMC41LCB0aGlzLnN0YXJ0WSwgdGhpcy5nYW1lLndpZHRoICogMik7XG4gICAgICB0aGlzLmdhbWUuYWRkLmV4aXN0aW5nKHRoaXMuYmFzZSk7XG5cbiAgICAgIC8vIEFkZCBzb21lIGJhc2UgY2Fycm90cyAoYnV0IGhhdmUgdGhlbSBvZmYgc2NyZWVuKVxuICAgICAgXy5lYWNoKF8ucmFuZ2UoMTApLCBfLmJpbmQoZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBwID0gbmV3IHByZWZhYnMuQ2Fycm90KHRoaXMuZ2FtZSwgLTk5OSwgdGhpcy5nYW1lLmhlaWdodCAqIDIpO1xuICAgICAgICB0aGlzLmNhcnJvdHMuYWRkKHApO1xuICAgICAgfSwgdGhpcykpO1xuXG4gICAgICAvLyBBZGQgc29tZSBiYXNlIGJlYW5zXG4gICAgICB2YXIgcHJldmlvdXM7XG4gICAgICBfLmVhY2goXy5yYW5nZSgyMCksIF8uYmluZChmdW5jdGlvbihpKSB7XG4gICAgICAgIHZhciBwID0gbmV3IHByZWZhYnMuQmVhbih0aGlzLmdhbWUsIDAsIDApO1xuICAgICAgICB0aGlzLnBsYWNlUGxhdGZvcm0ocCwgcHJldmlvdXMsIHRoaXMud29ybGQuaGVpZ2h0IC0gdGhpcy5wbGF0Zm9ybVNwYWNlWSAtIHRoaXMucGxhdGZvcm1TcGFjZVkgKiBpKTtcbiAgICAgICAgdGhpcy5iZWFucy5hZGQocCk7XG4gICAgICAgIHByZXZpb3VzID0gcDtcbiAgICAgIH0sIHRoaXMpKTtcbiAgICB9LFxuXG4gICAgLy8gUGxhY2UgcGxhdGZvcm1cbiAgICBwbGFjZVBsYXRmb3JtOiBmdW5jdGlvbihwbGF0Zm9ybSwgcHJldmlvdXNQbGF0Zm9ybSwgb3ZlcnJpZGVZLCBwbGF0Zm9ybVR5cGUpIHtcbiAgICAgIHBsYXRmb3JtLnJlc2V0U2V0dGluZ3MoKTtcbiAgICAgIHBsYXRmb3JtVHlwZSA9IChwbGF0Zm9ybVR5cGUgPT09IHVuZGVmaW5lZCkgPyBcImJlYW5cIiA6IHBsYXRmb3JtVHlwZTtcbiAgICAgIHZhciB5ID0gb3ZlcnJpZGVZIHx8IHRoaXMucGxhdGZvcm1ZTWluIC0gdGhpcy5wbGF0Zm9ybVNwYWNlWTtcbiAgICAgIHZhciBtaW5YID0gcGxhdGZvcm0ubWluWDtcbiAgICAgIHZhciBtYXhYID0gcGxhdGZvcm0ubWF4WDtcblxuICAgICAgLy8gRGV0ZXJtaW5lIHggYmFzZWQgb24gcHJldmlvdXNQbGF0Zm9ybVxuICAgICAgdmFyIHggPSB0aGlzLnJuZC5pbnRlZ2VySW5SYW5nZShtaW5YLCBtYXhYKTtcbiAgICAgIGlmIChwcmV2aW91c1BsYXRmb3JtKSB7XG4gICAgICAgIHggPSB0aGlzLnJuZC5pbnRlZ2VySW5SYW5nZShwcmV2aW91c1BsYXRmb3JtLnggLSB0aGlzLnBsYXRmb3JtR2FwTWF4LCBwcmV2aW91c1BsYXRmb3JtLnggKyB0aGlzLnBsYXRmb3JtR2FwTWF4KTtcblxuICAgICAgICAvLyBTb21lIGxvZ2ljIHRvIHRyeSB0byB3cmFwXG4gICAgICAgIHggPSAoeCA8IDApID8gTWF0aC5taW4obWF4WCwgdGhpcy53b3JsZC53aWR0aCArIHgpIDogTWF0aC5tYXgoeCwgbWluWCk7XG4gICAgICAgIHggPSAoeCA+IHRoaXMud29ybGQud2lkdGgpID8gTWF0aC5tYXgobWluWCwgeCAtIHRoaXMud29ybGQud2lkdGgpIDogTWF0aC5taW4oeCwgbWF4WCk7XG4gICAgICB9XG5cbiAgICAgIC8vIFBsYWNlXG4gICAgICBwbGF0Zm9ybS5yZXNldCh4LCB5KTtcblxuICAgICAgLy8gQWRkIHNvbWUgZmx1ZmZcbiAgICAgIHRoaXMuZmx1ZmZQbGF0Zm9ybShwbGF0Zm9ybSwgcGxhdGZvcm1UeXBlKTtcbiAgICB9LFxuXG4gICAgLy8gQWRkIHBvc3NpYmxlIGZsdWZmIHRvIHBsYXRmb3JtXG4gICAgZmx1ZmZQbGF0Zm9ybTogZnVuY3Rpb24ocGxhdGZvcm0sIHBsYXRmb3JtVHlwZSkge1xuICAgICAgdmFyIHggPSBwbGF0Zm9ybS54O1xuICAgICAgdmFyIHkgPSBwbGF0Zm9ybS55IC0gcGxhdGZvcm0uaGVpZ2h0IC8gMiAtIDMwO1xuICAgICAgdmFyIGl0ZW1DaGFuY2UgPSB0aGlzLmNoYW5jZShwbGF0Zm9ybVR5cGUgKyBcIkl0ZW1zXCIpO1xuXG4gICAgICAvLyBIb3Zlci4gIERvbid0IEFkZCBpdGVtc1xuICAgICAgaWYgKHRoaXMuY2hhbmNlKFwiaG92ZXJcIikgPT09IFwiaG92ZXJcIikge1xuICAgICAgICBwbGF0Zm9ybS5ob3ZlciA9IHRydWU7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gSXRlbXNcbiAgICAgIGlmIChpdGVtQ2hhbmNlID09PSBcIm1pbmlcIikge1xuICAgICAgICB0aGlzLmFkZFdpdGhQb29sKHRoaXMubWluaXMsIFwiTWluaVwiLCB4LCB5KTtcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKGl0ZW1DaGFuY2UgPT09IFwiZGlsbFwiKSB7XG4gICAgICAgIHRoaXMuYWRkV2l0aFBvb2wodGhpcy5kaWxscywgXCJEaWxsXCIsIHgsIHkpO1xuICAgICAgfVxuICAgICAgZWxzZSBpZiAoaXRlbUNoYW5jZSA9PT0gXCJwZXBwZXJcIikge1xuICAgICAgICB0aGlzLmFkZFdpdGhQb29sKHRoaXMucGVwcGVycywgXCJQZXBwZXJcIiwgeCwgeSk7XG4gICAgICB9XG4gICAgICBlbHNlIGlmIChpdGVtQ2hhbmNlID09PSBcImJvdFwiKSB7XG4gICAgICAgIHRoaXMuYWRkV2l0aFBvb2wodGhpcy5ib3RzLCBcIkJvdHVsaXNtXCIsIHgsIHkpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICAvLyBHZW5lcmljIGFkZCB3aXRoIHBvb2xpbmcgZnVuY3Rpb25hbGxpdHlcbiAgICBhZGRXaXRoUG9vbDogZnVuY3Rpb24ocG9vbCwgcHJlZmFiLCB4LCB5KSB7XG4gICAgICB2YXIgbyA9IHBvb2wuZ2V0Rmlyc3REZWFkKCk7XG4gICAgICBvID0gbyB8fCBuZXcgcHJlZmFic1twcmVmYWJdKHRoaXMuZ2FtZSwgeCwgeSk7XG5cbiAgICAgIC8vIFVzZSBjdXN0b20gcmVzZXQgaWYgYXZhaWxhYmxlXG4gICAgICBpZiAoby5yZXNldFBsYWNlbWVudCkge1xuICAgICAgICBvLnJlc2V0UGxhY2VtZW50KHgsIHkpO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIG8ucmVzZXQoeCwgeSk7XG4gICAgICB9XG5cbiAgICAgIHBvb2wuYWRkKG8pO1xuICAgIH0sXG5cbiAgICAvLyBVcGRhdGUgc2NvcmUuICBTY29yZSBpcyB0aGUgc2NvcmUgd2l0aG91dCBob3cgZmFyIHRoZXkgaGF2ZSBnb25lIHVwLlxuICAgIHVwZGF0ZVNjb3JlOiBmdW5jdGlvbihhZGRpdGlvbikge1xuICAgICAgYWRkaXRpb24gPSBhZGRpdGlvbiB8fCAwO1xuICAgICAgdGhpcy5zY29yZVVwID0gKC10aGlzLmNhbWVyYVlNaW4gPj0gOTk5OTk5OSkgPyAwIDpcbiAgICAgICAgTWF0aC5taW4oTWF0aC5tYXgoMCwgLXRoaXMuY2FtZXJhWU1pbiksIDk5OTk5OTkgLSAxKTtcbiAgICAgIHRoaXMuc2NvcmVDb2xsZWN0ID0gKHRoaXMuc2NvcmVDb2xsZWN0IHx8IDApICsgYWRkaXRpb247XG4gICAgICB0aGlzLnNjb3JlID0gTWF0aC5yb3VuZCh0aGlzLnNjb3JlVXAgKyB0aGlzLnNjb3JlQ29sbGVjdCk7XG5cbiAgICAgIC8vIFNjb3JlIHRleHRcbiAgICAgIGlmICghdGhpcy5zY29yZUdyb3VwKSB7XG4gICAgICAgIHRoaXMuc2NvcmVHcm91cCA9IHRoaXMuZ2FtZS5hZGQuZ3JvdXAoKTtcblxuICAgICAgICAvLyBTY29yZSB0ZXh0XG4gICAgICAgIHRoaXMuc2NvcmVUZXh0ID0gbmV3IFBoYXNlci5UZXh0KHRoaXMuZ2FtZSwgdGhpcy5wYWRkaW5nLCAwLFxuICAgICAgICAgIHRoaXMuc2NvcmUudG9Mb2NhbGVTdHJpbmcoKSwge1xuICAgICAgICAgICAgZm9udDogXCJcIiArICh0aGlzLmdhbWUud29ybGQuaGVpZ2h0IC8gMzApICsgXCJweCBPbW5lc1JvbWFuLWJvbGRcIixcbiAgICAgICAgICAgIGZpbGw6IFwiIzM5YjU0YVwiLFxuICAgICAgICAgICAgYWxpZ246IFwibGVmdFwiLFxuICAgICAgICAgIH0pO1xuICAgICAgICB0aGlzLnNjb3JlVGV4dC5hbmNob3Iuc2V0VG8oMCwgMCk7XG4gICAgICAgIHRoaXMuc2NvcmVUZXh0LnNldFNoYWRvdygxLCAxLCBcInJnYmEoMCwgMCwgMCwgMC4zKVwiLCAyKTtcblxuICAgICAgICAvLyBGaXggc2NvcmUgdG8gdG9wXG4gICAgICAgIHRoaXMuc2NvcmVHcm91cC5maXhlZFRvQ2FtZXJhID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5zY29yZUdyb3VwLmNhbWVyYU9mZnNldC5zZXRUbyh0aGlzLnBhZGRpbmcsIHRoaXMucGFkZGluZyk7XG5cbiAgICAgICAgLy8gSGFjayBhcm91bmQgZm9udC1sb2FkaW5nIGlzc3Vlc1xuICAgICAgICBfLmRlbGF5KF8uYmluZChmdW5jdGlvbigpIHtcbiAgICAgICAgICB0aGlzLnNjb3JlR3JvdXAuYWRkKHRoaXMuc2NvcmVUZXh0KTtcbiAgICAgICAgfSwgdGhpcyksIDEwMDApO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHRoaXMuc2NvcmVUZXh0LnRleHQgPSB0aGlzLnNjb3JlLnRvTG9jYWxlU3RyaW5nKCk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIC8vIFJlc2V0IHNjb3JlXG4gICAgcmVzZXRTY29yZTogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnNjb3JlVXAgPSAwO1xuICAgICAgdGhpcy5zY29yZUNvbGxlY3QgPSAwO1xuICAgICAgdGhpcy5zY29yZSA9IDA7XG4gICAgfSxcblxuICAgIC8vIFJlc2V0IHZpZXcgdHJhY2tpbmdcbiAgICByZXNldFZpZXdUcmFja2luZzogZnVuY3Rpb24oKSB7XG4gICAgICAvLyBDYW1lcmEgYW5kIHBsYXRmb3JtIHRyYWNraW5nIHZhcnNcbiAgICAgIHRoaXMuY2FtZXJhWU1pbiA9IDk5OTk5OTk7XG4gICAgICB0aGlzLnBsYXRmb3JtWU1pbiA9IDk5OTk5OTk7XG4gICAgfSxcblxuICAgIC8vIEdlbmVyYWwgdG91Y2hpbmdcbiAgICBpc1RvdWNoaW5nOiBmdW5jdGlvbihib2R5KSB7XG4gICAgICBpZiAoYm9keSAmJiBib2R5LnRvdWNoKSB7XG4gICAgICAgIHJldHVybiAoYm9keS50b3VjaGluZy51cCB8fCBib2R5LnRvdWNoaW5nLmRvd24gfHxcbiAgICAgICAgICBib2R5LnRvdWNoaW5nLmxlZnQgfHwgYm9keS50b3VjaGluZy5yaWdodCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9LFxuXG4gICAgLy8gSW5pdGlhbC9iYXNlIGRpZmZpY3VsdHkuICBDaGFuY2UgaXMgcHJvcGJhYmxpdHkuICBFYWNoIHNldCBpcyBhZGRpdGl2ZVxuICAgIC8vIHNvIGl0IGRvZXMgbm90IGhhdmUgdG8gYWRkIHRvIDEsIGJ1dCBpdCdzIGVhc2llciB0byB0aGluayBpbiB0aGlzXG4gICAgLy8gd2F5LlxuICAgIGNoYW5jZXM6IHtcbiAgICAgIHBsYXRmb3JtczogW1xuICAgICAgICBbXCJjYXJyb3RcIiwgMF0sXG4gICAgICAgIFtcImJlYW5cIiwgMV1cbiAgICAgIF0sXG4gICAgICBob3ZlcjogW1xuICAgICAgICBbXCJub25lXCIsIDE1XSxcbiAgICAgICAgW1wiaG92ZXJcIiwgMV1cbiAgICAgIF0sXG4gICAgICBjYXJyb3RJdGVtczogW1xuICAgICAgICBbXCJub25lXCIsIDFdLFxuICAgICAgICBbXCJtaW5pXCIsIDBdLFxuICAgICAgICBbXCJkaWxsXCIsIDBdLFxuICAgICAgICBbXCJwZXBwZXJcIiwgMF0sXG4gICAgICAgIFtcImJvdFwiLCAwXVxuICAgICAgXSxcbiAgICAgIGJlYW5JdGVtczogW1xuICAgICAgICBbXCJub25lXCIsIDEwXSxcbiAgICAgICAgW1wibWluaVwiLCAzXSxcbiAgICAgICAgW1wiZGlsbFwiLCAxXSxcbiAgICAgICAgW1wicGVwcGVyXCIsIDBdLFxuICAgICAgICBbXCJib3RcIiwgMF1cbiAgICAgIF1cbiAgICB9LFxuXG4gICAgLy8gTGV2ZWxzLiAgTGV2ZWwgaWQsIGFtb3VudCB1cFxuICAgIGxldmVsczogW1xuICAgICAgWzAsIC0xMDBdLFxuICAgICAgWzEsIC0yMDAwMF0sXG4gICAgICBbMiwgLTQ1MDAwXSxcbiAgICAgIFszLCAtODAwMDBdLFxuICAgICAgWzQsIC0xMjAwMDBdLFxuICAgICAgWzUsIC05OTk5OTldXG4gICAgXSxcblxuICAgIC8vIEN1cnJlbnQgbGV2ZWxcbiAgICBjdXJyZW50TGV2ZWw6IDAsXG5cbiAgICAvLyBEZXRlcm1pbmUgZGlmZmljdWx0eVxuICAgIHVwZGF0ZURpZmZpY3VsdHk6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGNoYW5jZXM7XG5cbiAgICAgIC8vIENhbGN1bGF0ZSBsZXZlbFxuICAgICAgdGhpcy5jdXJyZW50TGV2ZWwgPSBfLmZpbmQodGhpcy5sZXZlbHMsIF8uYmluZChmdW5jdGlvbihsKSB7XG4gICAgICAgIHJldHVybiAobFswXSA9PT0gMCAmJiAhdGhpcy5jYW1lcmFZTWluKSB8fCAodGhpcy5jYW1lcmFZTWluID4gbFsxXSk7XG4gICAgICB9LCB0aGlzKSk7XG5cbiAgICAgIHRoaXMuY3VycmVudExldmVsID0gdGhpcy5jdXJyZW50TGV2ZWwgPyB0aGlzLmN1cnJlbnRMZXZlbFswXSA6IHRoaXMubGV2ZWxzW3RoaXMubGV2ZWxzLmxlbmd0aCAtIDFdWzBdO1xuXG4gICAgICAvLyBEZXRlcm1pbmUgaWYgd2UgbmVlZCB0byB1cGRhdGUgbGV2ZWxcbiAgICAgIGlmICghXy5pc1VuZGVmaW5lZCh0aGlzLnByZXZpb3VzTGV2ZWwpICYmIHRoaXMucHJldmlvdXNMZXZlbCA9PT0gdGhpcy5jdXJyZW50TGV2ZWwpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBPdGhlciBkaWZmaWN1bHQgc2V0dGluZ3NcbiAgICAgIHRoaXMucGxhdGZvcm1TcGFjZVkgPSAxMTA7XG4gICAgICB0aGlzLnBsYXRmb3JtR2FwTWF4ID0gMjAwO1xuXG4gICAgICAvLyBTZXQgaW5pdGlhbCBiYWNrZ3JvdW5kXG4gICAgICB0aGlzLmdhbWUuc3RhZ2UuYmFja2dyb3VuZENvbG9yID0gXCIjYjhmNGJjXCI7XG5cbiAgICAgIC8vIFplcm8gbGV2ZWwgKGluaXRpYWwgc2NyZWVuKVxuICAgICAgaWYgKHRoaXMuY3VycmVudExldmVsID09PSAwKSB7XG4gICAgICAgIC8vIERlZmF1bHRcbiAgICAgICAgY2hhbmNlcyA9IF8uZXh0ZW5kKHt9LCB0aGlzLmNoYW5jZXMpO1xuICAgICAgfVxuXG4gICAgICAvLyBGaXJzdCBsZXZlbFxuICAgICAgZWxzZSBpZiAodGhpcy5jdXJyZW50TGV2ZWwgPT09IDEpIHtcbiAgICAgICAgY2hhbmNlcyA9IHtcbiAgICAgICAgICBwbGF0Zm9ybXM6IFtcbiAgICAgICAgICAgIFtcImNhcnJvdFwiLCAxXSxcbiAgICAgICAgICAgIFtcImJlYW5cIiwgMTVdXG4gICAgICAgICAgXSxcbiAgICAgICAgICBob3ZlcjogW1xuICAgICAgICAgICAgW1wibm9uZVwiLCA5XSxcbiAgICAgICAgICAgIFtcImhvdmVyXCIsIDFdXG4gICAgICAgICAgXSxcbiAgICAgICAgICBiZWFuSXRlbXM6IFtcbiAgICAgICAgICAgIFtcIm5vbmVcIiwgMTVdLFxuICAgICAgICAgICAgW1wibWluaVwiLCA1XSxcbiAgICAgICAgICAgIFtcImRpbGxcIiwgNV0sXG4gICAgICAgICAgICBbXCJwZXBwZXJcIiwgMV0sXG4gICAgICAgICAgICBbXCJib3RcIiwgMV1cbiAgICAgICAgICBdLFxuICAgICAgICAgIGNhcnJvdEl0ZW1zOiBbXG4gICAgICAgICAgICBbXCJub25lXCIsIDE1XSxcbiAgICAgICAgICAgIFtcIm1pbmlcIiwgNV0sXG4gICAgICAgICAgICBbXCJkaWxsXCIsIDVdLFxuICAgICAgICAgICAgW1wicGVwcGVyXCIsIDFdLFxuICAgICAgICAgICAgW1wiYm90XCIsIDFdXG4gICAgICAgICAgXVxuICAgICAgICB9O1xuICAgICAgfVxuXG4gICAgICAvLyBTZWNvbmQgbGV2ZWxcbiAgICAgIGVsc2UgaWYgKHRoaXMuY3VycmVudExldmVsID09PSAyKSB7XG4gICAgICAgIHRoaXMuZ2FtZS5zdGFnZS5iYWNrZ3JvdW5kQ29sb3IgPSBcIiM4OGQxZDBcIjtcblxuICAgICAgICBjaGFuY2VzID0ge1xuICAgICAgICAgIHBsYXRmb3JtczogW1xuICAgICAgICAgICAgW1wiY2Fycm90XCIsIDFdLFxuICAgICAgICAgICAgW1wiYmVhblwiLCA5XVxuICAgICAgICAgIF0sXG4gICAgICAgICAgaG92ZXI6IFtcbiAgICAgICAgICAgIFtcIm5vbmVcIiwgOF0sXG4gICAgICAgICAgICBbXCJob3ZlclwiLCAxXVxuICAgICAgICAgIF0sXG4gICAgICAgICAgY2Fycm90SXRlbXM6IFtcbiAgICAgICAgICAgIFtcIm5vbmVcIiwgOF0sXG4gICAgICAgICAgICBbXCJtaW5pXCIsIDIuNV0sXG4gICAgICAgICAgICBbXCJkaWxsXCIsIDJdLFxuICAgICAgICAgICAgW1wicGVwcGVyXCIsIDFdLFxuICAgICAgICAgICAgW1wiYm90XCIsIDEuNV1cbiAgICAgICAgICBdLFxuICAgICAgICAgIGJlYW5JdGVtczogW1xuICAgICAgICAgICAgW1wibm9uZVwiLCA4XSxcbiAgICAgICAgICAgIFtcIm1pbmlcIiwgMi41XSxcbiAgICAgICAgICAgIFtcImRpbGxcIiwgMl0sXG4gICAgICAgICAgICBbXCJwZXBwZXJcIiwgMV0sXG4gICAgICAgICAgICBbXCJib3RcIiwgMS41XVxuICAgICAgICAgIF1cbiAgICAgICAgfTtcbiAgICAgIH1cblxuICAgICAgLy8gVGhpcmQgbGV2ZWxcbiAgICAgIGVsc2UgaWYgKHRoaXMuY3VycmVudExldmVsID09PSAzKSB7XG4gICAgICAgIHRoaXMuZ2FtZS5zdGFnZS5iYWNrZ3JvdW5kQ29sb3IgPSBcIiM1OWFjYzZcIjtcblxuICAgICAgICBjaGFuY2VzID0ge1xuICAgICAgICAgIHBsYXRmb3JtczogW1xuICAgICAgICAgICAgW1wiY2Fycm90XCIsIDRdLFxuICAgICAgICAgICAgW1wiYmVhblwiLCA2XVxuICAgICAgICAgIF0sXG4gICAgICAgICAgaG92ZXI6IFtcbiAgICAgICAgICAgIFtcIm5vbmVcIiwgN10sXG4gICAgICAgICAgICBbXCJob3ZlclwiLCAxXVxuICAgICAgICAgIF0sXG4gICAgICAgICAgY2Fycm90SXRlbXM6IFtcbiAgICAgICAgICAgIFtcIm5vbmVcIiwgNl0sXG4gICAgICAgICAgICBbXCJtaW5pXCIsIDFdLFxuICAgICAgICAgICAgW1wiZGlsbFwiLCAyXSxcbiAgICAgICAgICAgIFtcInBlcHBlclwiLCAwLjVdLFxuICAgICAgICAgICAgW1wiYm90XCIsIDJdXG4gICAgICAgICAgXSxcbiAgICAgICAgICBiZWFuSXRlbXM6IFtcbiAgICAgICAgICAgIFtcIm5vbmVcIiwgNl0sXG4gICAgICAgICAgICBbXCJtaW5pXCIsIDFdLFxuICAgICAgICAgICAgW1wiZGlsbFwiLCAyXSxcbiAgICAgICAgICAgIFtcInBlcHBlclwiLCAwLjVdLFxuICAgICAgICAgICAgW1wiYm90XCIsIDJdXG4gICAgICAgICAgXVxuICAgICAgICB9O1xuICAgICAgfVxuXG4gICAgICAvLyBGb3VydGggbGV2ZWxcbiAgICAgIGVsc2UgaWYgKHRoaXMuY3VycmVudExldmVsID09PSA0KSB7XG4gICAgICAgIHRoaXMuYmdHcm91cC52aXNpYmxlID0gdHJ1ZTtcblxuICAgICAgICBjaGFuY2VzID0ge1xuICAgICAgICAgIHBsYXRmb3JtczogW1xuICAgICAgICAgICAgW1wiY2Fycm90XCIsIDhdLFxuICAgICAgICAgICAgW1wiYmVhblwiLCAyXVxuICAgICAgICAgIF0sXG4gICAgICAgICAgaG92ZXI6IFtcbiAgICAgICAgICAgIFtcIm5vbmVcIiwgN10sXG4gICAgICAgICAgICBbXCJob3ZlclwiLCAxXVxuICAgICAgICAgIF0sXG4gICAgICAgICAgY2Fycm90SXRlbXM6IFtcbiAgICAgICAgICAgIFtcIm5vbmVcIiwgM10sXG4gICAgICAgICAgICBbXCJtaW5pXCIsIDFdLFxuICAgICAgICAgICAgW1wiZGlsbFwiLCAyXSxcbiAgICAgICAgICAgIFtcInBlcHBlclwiLCAwLjVdLFxuICAgICAgICAgICAgW1wiYm90XCIsIDNdXG4gICAgICAgICAgXSxcbiAgICAgICAgICBiZWFuSXRlbXM6IFtcbiAgICAgICAgICAgIFtcIm5vbmVcIiwgM10sXG4gICAgICAgICAgICBbXCJtaW5pXCIsIDFdLFxuICAgICAgICAgICAgW1wiZGlsbFwiLCAyXSxcbiAgICAgICAgICAgIFtcInBlcHBlclwiLCAwLjVdLFxuICAgICAgICAgICAgW1wiYm90XCIsIDNdXG4gICAgICAgICAgXVxuICAgICAgICB9O1xuICAgICAgfVxuXG4gICAgICAvLyBGb3VydGggbGV2ZWxcbiAgICAgIGVsc2Uge1xuICAgICAgICB0aGlzLmJnR3JvdXAudmlzaWJsZSA9IGZhbHNlO1xuICAgICAgICB0aGlzLmdhbWUuc3RhZ2UuYmFja2dyb3VuZENvbG9yID0gXCIjMTIxMjEyXCI7XG5cbiAgICAgICAgY2hhbmNlcyA9IHtcbiAgICAgICAgICBwbGF0Zm9ybXM6IFtcbiAgICAgICAgICAgIFtcImNhcnJvdFwiLCAzMF0sXG4gICAgICAgICAgICBbXCJiZWFuXCIsIDFdXG4gICAgICAgICAgXSxcbiAgICAgICAgICBob3ZlcjogW1xuICAgICAgICAgICAgW1wibm9uZVwiLCA0XSxcbiAgICAgICAgICAgIFtcImhvdmVyXCIsIDFdXG4gICAgICAgICAgXSxcbiAgICAgICAgICBjYXJyb3RJdGVtczogW1xuICAgICAgICAgICAgW1wibm9uZVwiLCAwXSxcbiAgICAgICAgICAgIFtcIm1pbmlcIiwgMF0sXG4gICAgICAgICAgICBbXCJkaWxsXCIsIDBdLFxuICAgICAgICAgICAgW1wicGVwcGVyXCIsIDBdLFxuICAgICAgICAgICAgW1wiYm90XCIsIDFdXG4gICAgICAgICAgXSxcbiAgICAgICAgICBiZWFuSXRlbXM6IFtcbiAgICAgICAgICAgIFtcIm5vbmVcIiwgMF0sXG4gICAgICAgICAgICBbXCJtaW5pXCIsIDBdLFxuICAgICAgICAgICAgW1wiZGlsbFwiLCAwXSxcbiAgICAgICAgICAgIFtcInBlcHBlclwiLCAwXSxcbiAgICAgICAgICAgIFtcImJvdFwiLCAxXVxuICAgICAgICAgIF1cbiAgICAgICAgfTtcbiAgICAgIH1cblxuICAgICAgLy8gTWFrZSBjaGFuY2UgZnVuY3Rpb25cbiAgICAgIHRoaXMuZ2VuZXJhdGVDaGFuY2UoY2hhbmNlcyk7XG5cbiAgICAgIC8vIEtlZXAgdHJhY2sgb2YgbGV2ZWwgdG8gc2VlIGlmIGl0IGNoYW5nZXNcbiAgICAgIHRoaXMucHJldmlvdXNMZXZlbCA9IHRoaXMuY3VycmVudExldmVsO1xuICAgIH0sXG5cbiAgICAvLyBHZW5lcmF0ZSBjaGFuY2UgZnVuY3Rpb25cbiAgICBnZW5lcmF0ZUNoYW5jZTogZnVuY3Rpb24oY2hhbmNlcykge1xuICAgICAgLy8gQWRkIHVwIHNldHNcbiAgICAgIHZhciBzZXRzID0ge307XG4gICAgICBfLmVhY2goY2hhbmNlcywgZnVuY3Rpb24oc2V0LCBzaSkge1xuICAgICAgICAvLyBHZXQgdG90YWxcbiAgICAgICAgdmFyIHRvdGFsID0gXy5yZWR1Y2Uoc2V0LCBmdW5jdGlvbih0b3RhbCwgY2hhbmNlKSB7XG4gICAgICAgICAgcmV0dXJuIHRvdGFsICsgY2hhbmNlWzFdO1xuICAgICAgICB9LCAwKTtcblxuICAgICAgICAvLyBDcmVhdGUgbmV3IGFycmF5IHdpdGggbWluIGFuZCBtYXhcbiAgICAgICAgdmFyIGl0ZW1zID0gW107XG4gICAgICAgIF8ucmVkdWNlKHNldCwgZnVuY3Rpb24odG90YWwsIGNoYW5jZSkge1xuICAgICAgICAgIGl0ZW1zLnB1c2goe1xuICAgICAgICAgICAgbWluOiB0b3RhbCxcbiAgICAgICAgICAgIG1heDogdG90YWwgKyBjaGFuY2VbMV0sXG4gICAgICAgICAgICB2YWw6IGNoYW5jZVswXVxuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgcmV0dXJuIHRvdGFsICsgY2hhbmNlWzFdO1xuICAgICAgICB9LCAwKTtcblxuICAgICAgICBzZXRzW3NpXSA9IHtcbiAgICAgICAgICB0b3RhbDogdG90YWwsXG4gICAgICAgICAgcmFuZG9tOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBNYXRoLnJhbmRvbSgpICogdG90YWw7XG4gICAgICAgICAgfSxcblxuICAgICAgICAgIGl0ZW1zOiBpdGVtc1xuICAgICAgICB9O1xuICAgICAgfSk7XG5cbiAgICAgIC8vIE1ha2UgZnVuY3Rpb25cbiAgICAgIHRoaXMuY2hhbmNlID0gZnVuY3Rpb24oc2V0KSB7XG4gICAgICAgIHZhciBjID0gc2V0c1tzZXRdLnJhbmRvbSgpO1xuICAgICAgICB2YXIgZiA9IF8uZmluZChzZXRzW3NldF0uaXRlbXMsIGZ1bmN0aW9uKGkpIHtcbiAgICAgICAgICByZXR1cm4gKGMgPj0gaS5taW4gJiYgYyA8IGkubWF4KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIGYudmFsO1xuICAgICAgfTtcblxuICAgICAgLypcbiAgICAgIF8uZWFjaChfLnJhbmdlKDEwMCksIF8uYmluZChmdW5jdGlvbigpIHtcbiAgICAgICAgY29uc29sZS5sb2codGhpcy5jaGFuY2UoXCJiZWFuSXRlbXNcIikpO1xuICAgICAgfSwgdGhpcykpO1xuICAgICAgKi9cbiAgICB9LFxuXG4gICAgLy8gQ3JlYXRlIHN1cGVyIGxldmVsIGdyYWRpZW50XG4gICAgY3JlYXRlU3VwZXJMZXZlbEJHOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2xiZ0JNID0gdGhpcy5nYW1lLm1ha2UuYml0bWFwRGF0YSh0aGlzLmdhbWUud2lkdGgsIHRoaXMuZ2FtZS5oZWlnaHQpO1xuXG4gICAgICAvLyBDcmVhdGUgZ3JhZGllbnRcbiAgICAgIHZhciBncmFkaWVudCA9IHRoaXMuc2xiZ0JNLmNvbnRleHQuY3JlYXRlTGluZWFyR3JhZGllbnQoXG4gICAgICAgIDAsIHRoaXMuZ2FtZS5oZWlnaHQgLyAyLCB0aGlzLmdhbWUud2lkdGgsIHRoaXMuZ2FtZS5oZWlnaHQgLyAyKTtcbiAgICAgIGdyYWRpZW50LmFkZENvbG9yU3RvcCgwLCBcIiM0RjNGOUFcIik7XG4gICAgICBncmFkaWVudC5hZGRDb2xvclN0b3AoMSwgXCIjRTcwQjhEXCIpO1xuXG4gICAgICAvLyBBZGQgdG8gYml0bWFwXG4gICAgICB0aGlzLnNsYmdCTS5jb250ZXh0LmZpbGxTdHlsZSA9IGdyYWRpZW50O1xuICAgICAgdGhpcy5zbGJnQk0uY29udGV4dC5maWxsUmVjdCgwLCAwLCB0aGlzLmdhbWUud2lkdGgsIHRoaXMuZ2FtZS5oZWlnaHQpO1xuXG4gICAgICAvLyBDcmVhdGUgYmFja2dyb3VuZCBncm91cCBzbyB0aGF0IHdlIGNhbiBwdXQgdGhpcyB0aGVyZSBsYXRlclxuICAgICAgdGhpcy5iZ0dyb3VwID0gdGhpcy5nYW1lLmFkZC5ncm91cCgpO1xuICAgICAgdGhpcy5iZ0dyb3VwLmZpeGVkVG9DYW1lcmEgPSB0cnVlO1xuXG4gICAgICAvLyBBZGQgY3JhenkgYmFja2dyb3VuZCBhbmQgdGhlbiBoaWRlIHNpbmNlIGFkZGluZyBpbiBtaWRkbGVcbiAgICAgIC8vIHJlYWxseSBtZXNzZXMgd2l0aCB0aGluZ3NcbiAgICAgIHRoaXMuYmdHcm91cC5jcmVhdGUoMCwgMCwgdGhpcy5zbGJnQk0pO1xuICAgICAgdGhpcy5iZ0dyb3VwLnZpc2libGUgPSBmYWxzZTtcbiAgICB9LFxuXG4gICAgLy8gU2V0IG9uIGZpcmVcbiAgICBzZXRPbkZpcmU6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5vbkZpcmUgPSB0cnVlO1xuICAgICAgdGhpcy5oZXJvLnNldE9uRmlyZSgpO1xuICAgIH0sXG5cbiAgICAvLyBTZXQgb2ZmIGZpcmVcbiAgICBwdXRPdXRGaXJlOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMub25GaXJlID0gZmFsc2U7XG4gICAgICB0aGlzLmhlcm8ucHV0T3V0RmlyZSgpO1xuICAgIH1cbiAgfSk7XG5cbiAgLy8gRXhwb3J0XG4gIG1vZHVsZS5leHBvcnRzID0gUGxheTtcbn0pKCk7XG4iXX0=
