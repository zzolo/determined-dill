/**
 * pickle-jumper - Pickle Jumper!
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
        if (Math.random() < this.carrotChance) {
          this.placePlatform(carrot, highest);
        }
        else {
          this.placePlatform(bean, highest);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy96em9sby9Db2RlL3BlcnNvbmFsL3BpY2tsZS1qdW1wZXIvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIi9Vc2Vycy96em9sby9Db2RlL3BlcnNvbmFsL3BpY2tsZS1qdW1wZXIvanMvZmFrZV84NGUzMDhhMS5qcyIsIi9Vc2Vycy96em9sby9Db2RlL3BlcnNvbmFsL3BpY2tsZS1qdW1wZXIvanMvcGlja2xlLWp1bXBlci9wcmVmYWItYmVhbi5qcyIsIi9Vc2Vycy96em9sby9Db2RlL3BlcnNvbmFsL3BpY2tsZS1qdW1wZXIvanMvcGlja2xlLWp1bXBlci9wcmVmYWItYm90dWxpc20uanMiLCIvVXNlcnMvenpvbG8vQ29kZS9wZXJzb25hbC9waWNrbGUtanVtcGVyL2pzL3BpY2tsZS1qdW1wZXIvcHJlZmFiLWNhcnJvdC5qcyIsIi9Vc2Vycy96em9sby9Db2RlL3BlcnNvbmFsL3BpY2tsZS1qdW1wZXIvanMvcGlja2xlLWp1bXBlci9wcmVmYWItZGlsbC5qcyIsIi9Vc2Vycy96em9sby9Db2RlL3BlcnNvbmFsL3BpY2tsZS1qdW1wZXIvanMvcGlja2xlLWp1bXBlci9wcmVmYWItaGVyby5qcyIsIi9Vc2Vycy96em9sby9Db2RlL3BlcnNvbmFsL3BpY2tsZS1qdW1wZXIvanMvcGlja2xlLWp1bXBlci9wcmVmYWItamFyLmpzIiwiL1VzZXJzL3p6b2xvL0NvZGUvcGVyc29uYWwvcGlja2xlLWp1bXBlci9qcy9waWNrbGUtanVtcGVyL3ByZWZhYi1taW5pLmpzIiwiL1VzZXJzL3p6b2xvL0NvZGUvcGVyc29uYWwvcGlja2xlLWp1bXBlci9qcy9waWNrbGUtanVtcGVyL3ByZWZhYi1wZXBwZXIuanMiLCIvVXNlcnMvenpvbG8vQ29kZS9wZXJzb25hbC9waWNrbGUtanVtcGVyL2pzL3BpY2tsZS1qdW1wZXIvc3RhdGUtZ2FtZW92ZXIuanMiLCIvVXNlcnMvenpvbG8vQ29kZS9wZXJzb25hbC9waWNrbGUtanVtcGVyL2pzL3BpY2tsZS1qdW1wZXIvc3RhdGUtbWVudS5qcyIsIi9Vc2Vycy96em9sby9Db2RlL3BlcnNvbmFsL3BpY2tsZS1qdW1wZXIvanMvcGlja2xlLWp1bXBlci9zdGF0ZS1wbGF5LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5TEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdFdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyogZ2xvYmFsIF86ZmFsc2UsICQ6ZmFsc2UsIFBoYXNlcjpmYWxzZSwgV2ViRm9udDpmYWxzZSAqL1xuXG4vKipcbiAqIE1haW4gSlMgZm9yIFBpY2tsZSBKdW1wZXJcbiAqL1xuXG4oZnVuY3Rpb24oKSB7XG4gIFwidXNlIHN0cmljdFwiO1xuXG4gIC8vIERlcGVuZGVuY2llc1xuICB2YXIgc3RhdGVzID0ge1xuICAgIEdhbWVvdmVyOiByZXF1aXJlKFwiLi9waWNrbGUtanVtcGVyL3N0YXRlLWdhbWVvdmVyLmpzXCIpLFxuICAgIFBsYXk6IHJlcXVpcmUoXCIuL3BpY2tsZS1qdW1wZXIvc3RhdGUtcGxheS5qc1wiKSxcbiAgICBNZW51OiByZXF1aXJlKFwiLi9waWNrbGUtanVtcGVyL3N0YXRlLW1lbnUuanNcIiksXG4gIH07XG5cbiAgLy8gQ29uc3RydWN0b3JlIGZvciBQaWNrbGVcbiAgdmFyIFBpY2tsZSA9IHdpbmRvdy5QaWNrbGUgPSBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcbiAgICB0aGlzLmVsID0gdGhpcy5vcHRpb25zLmVsO1xuICAgIHRoaXMuJGVsID0gJCh0aGlzLm9wdGlvbnMuZWwpO1xuICAgIHRoaXMuJCA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuICQob3B0aW9ucy5lbCkuZmluZDtcbiAgICB9O1xuXG4gICAgdGhpcy53aWR0aCA9IHRoaXMuJGVsLndpZHRoKCk7XG4gICAgdGhpcy5oZWlnaHQgPSAkKHdpbmRvdykuaGVpZ2h0KCk7XG5cbiAgICAvLyBTdGFydCAobG9hZCBmb250cyBmaXJzdClcbiAgICB0aGlzLmZvbnRzID0gW1wiTWFya2V0aW5nXCIsIFwiT21uZXNSb21hblwiLCBcIk9tbmVzUm9tYW4tYm9sZFwiLCBcIk9tbmVzUm9tYW4tOTAwXCJdO1xuICAgIHRoaXMuZm9udFVybHMgPSBbXCJkaXN0L3BpY2tsZS1qdW1wZXIuY3NzXCJdO1xuICAgIHRoaXMubG9hZEZvbnRzKHRoaXMuc3RhcnQpO1xuICB9O1xuXG4gIC8vIEFkZCBwcm9wZXJ0aWVzXG4gIF8uZXh0ZW5kKFBpY2tsZS5wcm90b3R5cGUsIHtcbiAgICAvLyBTdGFydCBldmVyeXRoaW5nXG4gICAgc3RhcnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgLy8gQ3JlYXRlIFBoYXNlciBnYW1lXG4gICAgICB0aGlzLmdhbWUgPSBuZXcgUGhhc2VyLkdhbWUoXG4gICAgICAgIHRoaXMud2lkdGgsXG4gICAgICAgIHRoaXMuaGVpZ2h0LFxuICAgICAgICBQaGFzZXIuQVVUTyxcbiAgICAgICAgdGhpcy5lbC5yZXBsYWNlKFwiI1wiLCBcIlwiKSk7XG5cbiAgICAgIC8vIEFkZCByZWZlcmVuY2UgdG8gZ2FtZSwgc2luY2UgbW9zdCBwYXJ0cyBoYXZlIHRoaXMgcmVmZXJlbmNlXG4gICAgICAvLyBhbHJlYWR5XG4gICAgICB0aGlzLmdhbWUucGlja2xlID0gdGhpcztcblxuICAgICAgLy8gUmVnaXN0ZXIgc3RhdGVzXG4gICAgICB0aGlzLmdhbWUuc3RhdGUuYWRkKFwibWVudVwiLCBzdGF0ZXMuTWVudSk7XG4gICAgICB0aGlzLmdhbWUuc3RhdGUuYWRkKFwicGxheVwiLCBzdGF0ZXMuUGxheSk7XG4gICAgICB0aGlzLmdhbWUuc3RhdGUuYWRkKFwiZ2FtZW92ZXJcIiwgc3RhdGVzLkdhbWVvdmVyKTtcblxuICAgICAgLy8gSGlnaHNjb3JlXG4gICAgICB0aGlzLmhpZ2hzY29yZUxpbWl0ID0gdGhpcy5vcHRpb25zLmhpZ2hzY29yZUxpbWl0IHx8IDEwO1xuICAgICAgdGhpcy5nZXRIaWdoc2NvcmVzKCk7XG5cbiAgICAgIC8vIEFsbG93IGZvciBzY29yZSByZXNldCB3aXRoIGtleWJvYXJkXG4gICAgICB0aGlzLmhhbmRsZVJlc2V0KCk7XG5cbiAgICAgIC8vIFN0YXJ0IHdpdGggbWVudVxuICAgICAgdGhpcy5nYW1lLnN0YXRlLnN0YXJ0KFwibWVudVwiKTtcblxuICAgICAgLy8gRGVidWdcbiAgICAgIGlmICh0aGlzLm9wdGlvbnMuZGVidWcpIHtcbiAgICAgICAgdGhpcy5yZXNldEhpZ2hzY29yZXMoKTtcbiAgICAgICAgdGhpcy5nZXRIaWdoc2NvcmVzKCk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIC8vIExvYWQgZm9udHMuICBVUkxTIGlzIHJlbGF0aXZlIHRvIEhUTUwsIG5vdCBKU1xuICAgIGxvYWRGb250czogZnVuY3Rpb24oZG9uZSkge1xuICAgICAgZG9uZSA9IF8uYmluZChkb25lLCB0aGlzKTtcblxuICAgICAgV2ViRm9udC5sb2FkKHtcbiAgICAgICAgY3VzdG9tOiB7XG4gICAgICAgICAgZmFtaWxpZXM6IHRoaXMuZm9udHNcbiAgICAgICAgfSxcbiAgICAgICAgdXJsczogdGhpcy5mb250VXJscyxcbiAgICAgICAgY2xhc3NlczogZmFsc2UsXG4gICAgICAgIGFjdGl2ZTogZG9uZVxuICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8vIEhpZGUgb3ZlcmxheSBwYXJ0c1xuICAgIGhpZGVPdmVybGF5OiBmdW5jdGlvbihzZWxlY3Rvcikge1xuICAgICAgJCh0aGlzLm9wdGlvbnMucGFyZW50RWwpLmZpbmQoc2VsZWN0b3IpLmhpZGUoKTtcbiAgICB9LFxuXG4gICAgLy8gU2hvdyBvdmVybGF5IHBhcnRzXG4gICAgc2hvd092ZXJsYXk6IGZ1bmN0aW9uKHNlbGVjdG9yLCB0aW1lKSB7XG4gICAgICBpZiAodGltZSkge1xuICAgICAgICAkKHRoaXMub3B0aW9ucy5wYXJlbnRFbCkuZmluZChzZWxlY3RvcikuZmFkZUluKFwiZmFzdFwiKS5kZWxheSh0aW1lKS5mYWRlT3V0KFwiZmFzdFwiKTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICAkKHRoaXMub3B0aW9ucy5wYXJlbnRFbCkuZmluZChzZWxlY3Rvcikuc2hvdygpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICAvLyBHZXQgaGlnaCBzY29yZXNcbiAgICBnZXRIaWdoc2NvcmVzOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBzID0gd2luZG93LmxvY2FsU3RvcmFnZS5nZXRJdGVtKFwiaGlnaHNjb3Jlc1wiKTtcbiAgICAgIHMgPSAocykgPyBKU09OLnBhcnNlKHMpIDogW107XG4gICAgICB0aGlzLmhpZ2hzY29yZXMgPSBzO1xuICAgICAgdGhpcy5zb3J0SGlnaHNjb3JlcygpO1xuICAgICAgcmV0dXJuIHRoaXMuaGlnaHNjb3JlcztcbiAgICB9LFxuXG4gICAgLy8gR2V0IGhpZ2hlc3Qgc2NvcmVcbiAgICBnZXRIaWdoc2NvcmU6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIF8ubWF4KHRoaXMuaGlnaHNjb3JlcywgXCJzY29yZVwiKTtcbiAgICB9LFxuXG4gICAgLy8gU2V0IHNpbmdsZSBoaWdoc2NvcmVcbiAgICBzZXRIaWdoc2NvcmU6IGZ1bmN0aW9uKHNjb3JlLCBuYW1lKSB7XG4gICAgICBpZiAodGhpcy5pc0hpZ2hzY29yZShzY29yZSkpIHtcbiAgICAgICAgdGhpcy5zb3J0SGlnaHNjb3JlcygpO1xuXG4gICAgICAgIC8vIFJlbW92ZSBsb3dlc3Qgb25lIGlmIG5lZWRlZFxuICAgICAgICBpZiAodGhpcy5oaWdoc2NvcmVzLmxlbmd0aCA+PSB0aGlzLmhpZ2hzY29yZUxpbWl0KSB7XG4gICAgICAgICAgdGhpcy5oaWdoc2NvcmVzLnNoaWZ0KCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBBZGQgbmV3IHNjb3JlXG4gICAgICAgIHRoaXMuaGlnaHNjb3Jlcy5wdXNoKHtcbiAgICAgICAgICBuYW1lOiBuYW1lLFxuICAgICAgICAgIHNjb3JlOiBzY29yZVxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBTb3J0IGFuZCBzZXRcbiAgICAgICAgdGhpcy5zb3J0SGlnaHNjb3JlcygpO1xuICAgICAgICB0aGlzLnNldEhpZ2hzY29yZXMoKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLy8gU29ydCBoaWdoc2NvcmVzXG4gICAgc29ydEhpZ2hzY29yZXM6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5oaWdoc2NvcmVzID0gXy5zb3J0QnkodGhpcy5oaWdoc2NvcmVzLCBcInNjb3JlXCIpO1xuICAgIH0sXG5cbiAgICAvLyBJcyBoaWdoc2NvcmUuICBJcyB0aGUgc2NvcmUgaGlnaGVyIHRoYW4gdGhlIGxvd2VzdFxuICAgIC8vIHJlY29yZGVkIHNjb3JlXG4gICAgaXNIaWdoc2NvcmU6IGZ1bmN0aW9uKHNjb3JlKSB7XG4gICAgICB2YXIgbWluID0gXy5taW4odGhpcy5oaWdoc2NvcmVzLCBcInNjb3JlXCIpLnNjb3JlO1xuICAgICAgcmV0dXJuIChzY29yZSA+IG1pbiB8fCB0aGlzLmhpZ2hzY29yZXMubGVuZ3RoIDwgdGhpcy5oaWdoc2NvcmVMaW1pdCk7XG4gICAgfSxcblxuICAgIC8vIENoZWNrIGlmIHNjb3JlIGlzIGhpZ2hlc3Qgc2NvcmVcbiAgICBpc0hpZ2hlc3RTY29yZTogZnVuY3Rpb24oc2NvcmUpIHtcbiAgICAgIHZhciBtYXggPSBfLm1heCh0aGlzLmhpZ2hzY29yZXMsIFwic2NvcmVcIikuc2NvcmUgfHwgMDtcbiAgICAgIHJldHVybiAoc2NvcmUgPiBtYXgpO1xuICAgIH0sXG5cbiAgICAvLyBTZXQgaGlnaHNjb3Jlc1xuICAgIHNldEhpZ2hzY29yZXM6IGZ1bmN0aW9uKCkge1xuICAgICAgd2luZG93LmxvY2FsU3RvcmFnZS5zZXRJdGVtKFwiaGlnaHNjb3Jlc1wiLCBKU09OLnN0cmluZ2lmeSh0aGlzLmhpZ2hzY29yZXMpKTtcbiAgICB9LFxuXG4gICAgLy8gUmVzZXQgaGlnaHNjaG9yZXNcbiAgICByZXNldEhpZ2hzY29yZXM6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5oaWdoc2NvcmVzID0gW107XG4gICAgICB3aW5kb3cubG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oXCJoaWdoc2NvcmVzXCIpO1xuICAgIH0sXG5cbiAgICAvLyBLZXkgY29tYm8gcmVzZXRcbiAgICBoYW5kbGVSZXNldDogZnVuY3Rpb24oKSB7XG4gICAgICAkKHdpbmRvdykub24oXCJrZXl1cFwiLCBfLmJpbmQoZnVuY3Rpb24oZSkge1xuICAgICAgICAvLyBDdHJsICsgSlxuICAgICAgICBpZiAoZS5jdHJsS2V5ICYmIChlLndoaWNoID09PSA3NCkpIHtcbiAgICAgICAgICB0aGlzLnJlc2V0SGlnaHNjb3JlcygpO1xuXG4gICAgICAgICAgLy8gU2hvdyBtZXNzYWdlXG4gICAgICAgICAgdGhpcy5zaG93T3ZlcmxheShcIi5oaWdoLXJlc2V0XCIsIDEwMDApO1xuICAgICAgICB9XG4gICAgICB9LCB0aGlzKSk7XG4gICAgfVxuICB9KTtcblxuICAvLyBDcmVhdGUgYXBwXG4gICQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCkge1xuICAgIHZhciBwO1xuICAgIHAgPSBuZXcgUGlja2xlKHtcbiAgICAgIGVsOiBcIiNwaWNrbGUtanVtcGVyXCIsXG4gICAgICBwYXJlbnRFbDogXCIuZ2FtZS13cmFwcGVyXCIsXG4gICAgICBoaWdoc2NvcmVMaW1pdDogNCxcbiAgICAgIGRlYnVnOiBmYWxzZVxuICAgIH0pO1xuICB9KTtcbn0pKCk7XG4iLCIvKiBnbG9iYWwgXzpmYWxzZSwgUGhhc2VyOmZhbHNlICovXG5cbi8qKlxuICogUHJlZmFiIGJlYW4gcGxhdGZvcm1cbiAqL1xuXG4oZnVuY3Rpb24oKSB7XG4gIFwidXNlIHN0cmljdFwiO1xuXG4gIC8vIENvbnN0cnVjdG9yXG4gIHZhciBCZWFuID0gZnVuY3Rpb24oZ2FtZSwgeCwgeSkge1xuICAgIC8vIENhbGwgZGVmYXVsdCBzcHJpdGVcbiAgICBQaGFzZXIuU3ByaXRlLmNhbGwodGhpcywgZ2FtZSwgeCwgeSwgXCJnYW1lLXNwcml0ZXNcIiwgXCJkaWxseWJlYW4ucG5nXCIpO1xuXG4gICAgLy8gQ29uZmlndXJlXG4gICAgdGhpcy5hbmNob3Iuc2V0VG8oMC41LCAwLjUpO1xuICAgIHRoaXMuc2NhbGUuc2V0VG8oKHRoaXMuZ2FtZS53aWR0aCAvIDUpIC8gdGhpcy53aWR0aCk7XG4gICAgdGhpcy5ob3ZlciA9IGZhbHNlO1xuICAgIHRoaXMuc2V0SG92ZXJTcGVlZCgxMDApO1xuXG4gICAgLy8gUGh5c2ljc1xuICAgIHRoaXMuZ2FtZS5waHlzaWNzLmFyY2FkZS5lbmFibGVCb2R5KHRoaXMpO1xuICAgIHRoaXMuYm9keS5hbGxvd0dyYXZpdHkgPSBmYWxzZTtcbiAgICB0aGlzLmJvZHkuaW1tb3ZhYmxlID0gdHJ1ZTtcblxuICAgIC8vIE9ubHkgYWxsb3cgZm9yIGNvbGxpc3Npb24gdXBcbiAgICB0aGlzLmJvZHkuY2hlY2tDb2xsaXNpb24udXAgPSB0cnVlO1xuICAgIHRoaXMuYm9keS5jaGVja0NvbGxpc2lvbi5kb3duID0gZmFsc2U7XG4gICAgdGhpcy5ib2R5LmNoZWNrQ29sbGlzaW9uLmxlZnQgPSBmYWxzZTtcbiAgICB0aGlzLmJvZHkuY2hlY2tDb2xsaXNpb24ucmlnaHQgPSBmYWxzZTtcblxuICAgIC8vIERldGVybWluZSBhbmNob3IgeCBib3VuZHNcbiAgICB0aGlzLnBhZGRpbmdYID0gMTA7XG4gICAgdGhpcy5nZXRBbmNob3JCb3VuZHNYKCk7XG4gIH07XG5cbiAgLy8gRXh0ZW5kIGZyb20gU3ByaXRlXG4gIEJlYW4ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQaGFzZXIuU3ByaXRlLnByb3RvdHlwZSk7XG4gIEJlYW4ucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gQmVhbjtcblxuICAvLyBBZGQgbWV0aG9kc1xuICBfLmV4dGVuZChCZWFuLnByb3RvdHlwZSwge1xuICAgIHVwZGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICBpZiAodGhpcy5ob3Zlcikge1xuICAgICAgICB0aGlzLmJvZHkudmVsb2NpdHkueCA9IHRoaXMuYm9keS52ZWxvY2l0eS54IHx8IHRoaXMuaG92ZXJTcGVlZDtcbiAgICAgICAgdGhpcy5ib2R5LnZlbG9jaXR5LnggPSAodGhpcy54IDw9IHRoaXMubWluWCkgPyB0aGlzLmhvdmVyU3BlZWQgOlxuICAgICAgICAgICh0aGlzLnggPj0gdGhpcy5tYXhYKSA/IC10aGlzLmhvdmVyU3BlZWQgOiB0aGlzLmJvZHkudmVsb2NpdHkueDtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLy8gU2V0IGhvdmVyIHNwZWVkLiAgQWRkIGEgYml0IG9mIHZhcmlhbmNlXG4gICAgc2V0SG92ZXJTcGVlZDogZnVuY3Rpb24oc3BlZWQpIHtcbiAgICAgIHRoaXMuaG92ZXJTcGVlZCA9IHNwZWVkICsgdGhpcy5nYW1lLnJuZC5pbnRlZ2VySW5SYW5nZSgtNTAsIDUwKTtcbiAgICB9LFxuXG4gICAgLy8gR2V0IGFuY2hvciBib3VuZHNcbiAgICBnZXRBbmNob3JCb3VuZHNYOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMubWluWCA9IHRoaXMucGFkZGluZ1ggKyAodGhpcy53aWR0aCAvIDIpO1xuICAgICAgdGhpcy5tYXhYID0gdGhpcy5nYW1lLndpZHRoIC0gKHRoaXMucGFkZGluZ1ggKyAodGhpcy53aWR0aCAvIDIpKTtcbiAgICAgIHJldHVybiBbdGhpcy5taW5YLCB0aGlzLm1heFhdO1xuICAgIH0sXG5cbiAgICAvLyBSZXNldCB0aGluZ3NcbiAgICByZXNldFNldHRpbmdzOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMucmVzZXQoMCwgMCk7XG4gICAgICB0aGlzLmJvZHkudmVsb2NpdHkueCA9IDA7XG4gICAgICB0aGlzLmhvdmVyID0gZmFsc2U7XG4gICAgICB0aGlzLmdldEFuY2hvckJvdW5kc1goKTtcbiAgICB9XG4gIH0pO1xuXG4gIC8vIEV4cG9ydFxuICBtb2R1bGUuZXhwb3J0cyA9IEJlYW47XG59KSgpO1xuIiwiLyogZ2xvYmFsIF86ZmFsc2UsIFBoYXNlcjpmYWxzZSAqL1xuXG4vKipcbiAqIFByZWZhYiBmb3IgQm90dWxpc20sIHRoZSBiYWQgZHVkZXNcbiAqL1xuXG4oZnVuY3Rpb24oKSB7XG4gIFwidXNlIHN0cmljdFwiO1xuXG4gIC8vIENvbnN0cnVjdG9yXG4gIHZhciBCb3R1bGlzbSA9IGZ1bmN0aW9uKGdhbWUsIHgsIHkpIHtcbiAgICAvLyBDYWxsIGRlZmF1bHQgc3ByaXRlXG4gICAgUGhhc2VyLlNwcml0ZS5jYWxsKHRoaXMsIGdhbWUsIHgsIHksIFwiZ2FtZS1zcHJpdGVzXCIsIFwiYm90Y2h5LnBuZ1wiKTtcblxuICAgIC8vIFNpemVcbiAgICB0aGlzLmFuY2hvci5zZXRUbygwLjUsIDAuNSk7XG4gICAgdGhpcy5zY2FsZS5zZXRUbygodGhpcy5nYW1lLndpZHRoIC8gMTApIC8gdGhpcy53aWR0aCk7XG5cbiAgICAvLyBDb25maWd1cmVcbiAgICB0aGlzLmhvdmVyID0gdHJ1ZTtcbiAgICB0aGlzLnNldEhvdmVyU3BlZWQoMTAwKTtcbiAgICB0aGlzLmhvdmVyUmFuZ2UgPSAxMDA7XG5cbiAgICAvLyBQaHlzaWNzXG4gICAgdGhpcy5nYW1lLnBoeXNpY3MuYXJjYWRlLmVuYWJsZUJvZHkodGhpcyk7XG4gICAgdGhpcy5ib2R5LmFsbG93R3Jhdml0eSA9IGZhbHNlO1xuICAgIHRoaXMuYm9keS5pbW1vdmFibGUgPSB0cnVlO1xuXG4gICAgLy8gTWFrZSB0aGUgY29sbGlzaW9uIGJvZHkgYSBiaXQgc21hbGxlclxuICAgIHZhciBib2R5U2NhbGUgPSAwLjg7XG4gICAgdGhpcy5ib2R5LnNldFNpemUodGhpcy53aWR0aCAqIGJvZHlTY2FsZSwgdGhpcy5oZWlnaHQgKiBib2R5U2NhbGUsXG4gICAgICAodGhpcy53aWR0aCAtICh0aGlzLndpZHRoICogYm9keVNjYWxlKSkgLyAyLFxuICAgICAgKHRoaXMuaGVpZ2h0IC0gKHRoaXMuaGVpZ2h0ICogYm9keVNjYWxlKSkgLyAyKTtcblxuICAgIC8vIERldGVybWluZSBhbmNob3IgeCBib3VuZHNcbiAgICB0aGlzLnBhZGRpbmdYID0gMTA7XG4gICAgdGhpcy5yZXNldFBsYWNlbWVudCh4LCB5KTtcbiAgfTtcblxuICAvLyBFeHRlbmQgZnJvbSBTcHJpdGVcbiAgQm90dWxpc20ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQaGFzZXIuU3ByaXRlLnByb3RvdHlwZSk7XG4gIEJvdHVsaXNtLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEJvdHVsaXNtO1xuXG4gIC8vIEFkZCBtZXRob2RzXG4gIF8uZXh0ZW5kKEJvdHVsaXNtLnByb3RvdHlwZSwge1xuICAgIHVwZGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAvLyBEbyBob3ZlclxuICAgICAgaWYgKHRoaXMuaG92ZXIpIHtcbiAgICAgICAgdGhpcy5ib2R5LnZlbG9jaXR5LnggPSB0aGlzLmJvZHkudmVsb2NpdHkueCB8fCB0aGlzLmhvdmVyU3BlZWQ7XG4gICAgICAgIHRoaXMuYm9keS52ZWxvY2l0eS54ID0gKHRoaXMueCA8PSB0aGlzLm1pblgpID8gdGhpcy5ob3ZlclNwZWVkIDpcbiAgICAgICAgICAodGhpcy54ID49IHRoaXMubWF4WCkgPyAtdGhpcy5ob3ZlclNwZWVkIDogdGhpcy5ib2R5LnZlbG9jaXR5Lng7XG4gICAgICB9XG4gICAgfSxcblxuICAgIC8vIFNldCBob3ZlciBzcGVlZC4gIEFkZCBhIGJpdCBvZiB2YXJpYW5jZVxuICAgIHNldEhvdmVyU3BlZWQ6IGZ1bmN0aW9uKHNwZWVkKSB7XG4gICAgICB0aGlzLmhvdmVyU3BlZWQgPSBzcGVlZCArIHRoaXMuZ2FtZS5ybmQuaW50ZWdlckluUmFuZ2UoLTI1LCAyNSk7XG4gICAgfSxcblxuICAgIC8vIEdldCBhbmNob3IgYm91bmRzLiAgVGhpcyBpcyByZWxhdGl2ZSB0byB3aGVyZSB0aGUgcGxhdGZvcm0gaXNcbiAgICBnZXRBbmNob3JCb3VuZHNYOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMubWluWCA9IE1hdGgubWF4KHRoaXMueCAtIHRoaXMuaG92ZXJSYW5nZSwgdGhpcy5wYWRkaW5nWCArICh0aGlzLndpZHRoIC8gMikpO1xuICAgICAgdGhpcy5tYXhYID0gTWF0aC5taW4odGhpcy54ICsgdGhpcy5ob3ZlclJhbmdlLCB0aGlzLmdhbWUud2lkdGggLSAodGhpcy5wYWRkaW5nWCArICh0aGlzLndpZHRoIC8gMikpKTtcbiAgICAgIHJldHVybiBbdGhpcy5taW5YLCB0aGlzLm1heFhdO1xuICAgIH0sXG5cbiAgICAvLyBSZXNldCB0aGluZ3NcbiAgICByZXNldFBsYWNlbWVudDogZnVuY3Rpb24oeCwgeSkge1xuICAgICAgdGhpcy5yZXNldCh4LCB5KTtcbiAgICAgIHRoaXMuYm9keS52ZWxvY2l0eS54ID0gMDtcbiAgICAgIHRoaXMuZ2V0QW5jaG9yQm91bmRzWCgpO1xuICAgIH0sXG5cbiAgICAvLyBSZXNldCBpbWFnZVxuICAgIHJlc2V0SW1hZ2U6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5oZWlnaHQgPSB0aGlzLm9yaWdpbmFsSGVpZ2h0O1xuICAgICAgdGhpcy53aWR0aCA9IHRoaXMub3JpZ2luYWxXaWR0aDtcbiAgICAgIHRoaXMuYWxwaGEgPSAxO1xuICAgIH0sXG5cbiAgICAvLyBNdXJkZXJlZCAobm90IGp1c3Qga2lsbClcbiAgICBtdXJkZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgLy8gR2V0IG9yaWdpbmFsIGhlaWdodFxuICAgICAgdGhpcy5vcmlnaW5hbEhlaWdodCA9IHRoaXMuaGVpZ2h0O1xuICAgICAgdGhpcy5vcmlnaW5hbFdpZHRoID0gdGhpcy53aWR0aDtcblxuICAgICAgdmFyIHR3ZWVuID0gdGhpcy5nYW1lLmFkZC50d2Vlbih0aGlzKS50byh7XG4gICAgICAgIGhlaWdodDogMCxcbiAgICAgICAgd2lkdGg6IDAsXG4gICAgICAgIGFscGhhOiAwXG4gICAgICB9LCAyMDAsIFBoYXNlci5FYXNpbmcuTGluZWFyLk5vbmUsIHRydWUpO1xuXG4gICAgICB0d2Vlbi5vbkNvbXBsZXRlLmFkZChfLmJpbmQoZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMucmVzZXRJbWFnZSgpO1xuICAgICAgICB0aGlzLmtpbGwoKTtcbiAgICAgIH0sIHRoaXMpKTtcbiAgICB9XG4gIH0pO1xuXG4gIC8vIEV4cG9ydFxuICBtb2R1bGUuZXhwb3J0cyA9IEJvdHVsaXNtO1xufSkoKTtcbiIsIi8qIGdsb2JhbCBfOmZhbHNlLCBQaGFzZXI6ZmFsc2UgKi9cblxuLyoqXG4gKiBQcmVmYWIgcGxhdGZvcm1cbiAqL1xuXG4oZnVuY3Rpb24oKSB7XG4gIFwidXNlIHN0cmljdFwiO1xuXG4gIC8vIENvbnN0cnVjdG9yXG4gIHZhciBDYXJyb3QgPSBmdW5jdGlvbihnYW1lLCB4LCB5KSB7XG4gICAgLy8gQ2FsbCBkZWZhdWx0IHNwcml0ZVxuICAgIFBoYXNlci5TcHJpdGUuY2FsbCh0aGlzLCBnYW1lLCB4LCB5LCBcImNhcnJvdC1zcHJpdGVzXCIsIFwiY2Fycm90LXNuYXAtMDEucG5nXCIpO1xuXG4gICAgLy8gQ29uZmlndXJlXG4gICAgdGhpcy5hbmNob3Iuc2V0VG8oMC41LCAwLjUpO1xuICAgIHRoaXMuc2NhbGUuc2V0VG8oKHRoaXMuZ2FtZS53aWR0aCAvIDUpIC8gdGhpcy53aWR0aCk7XG4gICAgdGhpcy5ob3ZlciA9IGZhbHNlO1xuICAgIHRoaXMuc2V0SG92ZXJTcGVlZCgxMDApO1xuXG4gICAgLy8gUGh5c2ljc1xuICAgIHRoaXMuZ2FtZS5waHlzaWNzLmFyY2FkZS5lbmFibGVCb2R5KHRoaXMpO1xuICAgIHRoaXMuYm9keS5hbGxvd0dyYXZpdHkgPSBmYWxzZTtcbiAgICB0aGlzLmJvZHkuaW1tb3ZhYmxlID0gdHJ1ZTtcblxuICAgIC8vIE9ubHkgYWxsb3cgZm9yIGNvbGxpc3Npb24gdXBcbiAgICB0aGlzLmJvZHkuY2hlY2tDb2xsaXNpb24udXAgPSB0cnVlO1xuICAgIHRoaXMuYm9keS5jaGVja0NvbGxpc2lvbi5kb3duID0gZmFsc2U7XG4gICAgdGhpcy5ib2R5LmNoZWNrQ29sbGlzaW9uLmxlZnQgPSBmYWxzZTtcbiAgICB0aGlzLmJvZHkuY2hlY2tDb2xsaXNpb24ucmlnaHQgPSBmYWxzZTtcblxuICAgIC8vIERldGVybWluZSBhbmNob3IgeCBib3VuZHNcbiAgICB0aGlzLnBhZGRpbmdYID0gMTA7XG4gICAgdGhpcy5nZXRBbmNob3JCb3VuZHNYKCk7XG5cbiAgICAvLyBTZXR1cCBhbmltYXRpb25zXG4gICAgdmFyIHNuYXBGcmFtZXMgPSBQaGFzZXIuQW5pbWF0aW9uLmdlbmVyYXRlRnJhbWVOYW1lcyhcImNhcnJvdC1zbmFwLVwiLCAxLCA1LCBcIi5wbmdcIiwgMik7XG4gICAgdGhpcy5zbmFwQW5pbWF0aW9uID0gdGhpcy5hbmltYXRpb25zLmFkZChcInNuYXBcIiwgc25hcEZyYW1lcyk7XG4gICAgdGhpcy5zbmFwQW5pbWF0aW9uLm9uQ29tcGxldGUuYWRkKHRoaXMuc25hcHBlZCwgdGhpcyk7XG4gIH07XG5cbiAgLy8gRXh0ZW5kIGZyb20gU3ByaXRlXG4gIENhcnJvdC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFBoYXNlci5TcHJpdGUucHJvdG90eXBlKTtcbiAgQ2Fycm90LnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IENhcnJvdDtcblxuICAvLyBBZGQgbWV0aG9kc1xuICBfLmV4dGVuZChDYXJyb3QucHJvdG90eXBlLCB7XG4gICAgdXBkYXRlOiBmdW5jdGlvbigpIHtcbiAgICAgIGlmICh0aGlzLmhvdmVyKSB7XG4gICAgICAgIHRoaXMuYm9keS52ZWxvY2l0eS54ID0gdGhpcy5ib2R5LnZlbG9jaXR5LnggfHwgdGhpcy5ob3ZlclNwZWVkO1xuICAgICAgICB0aGlzLmJvZHkudmVsb2NpdHkueCA9ICh0aGlzLnggPD0gdGhpcy5taW5YKSA/IHRoaXMuaG92ZXJTcGVlZCA6XG4gICAgICAgICAgKHRoaXMueCA+PSB0aGlzLm1heFgpID8gLXRoaXMuaG92ZXJTcGVlZCA6IHRoaXMuYm9keS52ZWxvY2l0eS54O1xuICAgICAgfVxuICAgIH0sXG5cbiAgICAvLyBTZXQgaG92ZXIgc3BlZWQuICBBZGQgYSBiaXQgb2YgdmFyaWFuY2VcbiAgICBzZXRIb3ZlclNwZWVkOiBmdW5jdGlvbihzcGVlZCkge1xuICAgICAgdGhpcy5ob3ZlclNwZWVkID0gc3BlZWQgKyB0aGlzLmdhbWUucm5kLmludGVnZXJJblJhbmdlKC01MCwgNTApO1xuICAgIH0sXG5cbiAgICAvLyBHZXQgYW5jaG9yIGJvdW5kc1xuICAgIGdldEFuY2hvckJvdW5kc1g6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5taW5YID0gdGhpcy5wYWRkaW5nWCArICh0aGlzLndpZHRoIC8gMik7XG4gICAgICB0aGlzLm1heFggPSB0aGlzLmdhbWUud2lkdGggLSAodGhpcy5wYWRkaW5nWCArICh0aGlzLndpZHRoIC8gMikpO1xuICAgICAgcmV0dXJuIFt0aGlzLm1pblgsIHRoaXMubWF4WF07XG4gICAgfSxcblxuICAgIC8vIFJlc2V0IHRoaW5nc1xuICAgIHJlc2V0U2V0dGluZ3M6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5yZXNldEltYWdlKCk7XG4gICAgICB0aGlzLnJlc2V0KDAsIDApO1xuICAgICAgdGhpcy5ib2R5LnZlbG9jaXR5LnggPSAwO1xuICAgICAgdGhpcy5ob3ZlciA9IGZhbHNlO1xuICAgICAgdGhpcy5nZXRBbmNob3JCb3VuZHNYKCk7XG4gICAgfSxcblxuICAgIC8vIFJlc2V0IGltYWdlXG4gICAgcmVzZXRJbWFnZTogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLmFscGhhID0gMTtcbiAgICAgIHRoaXMubG9hZFRleHR1cmUoXCJjYXJyb3Qtc3ByaXRlc1wiLCBcImNhcnJvdC1zbmFwLTAxLnBuZ1wiKTtcbiAgICB9LFxuXG4gICAgLy8gU25hcCBjYXJyb3RcbiAgICBzbmFwOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuYW5pbWF0aW9ucy5wbGF5KFwic25hcFwiLCAxNSwgZmFsc2UsIGZhbHNlKTtcbiAgICB9LFxuXG4gICAgLy8gU25hcHBlZFxuICAgIHNuYXBwZWQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHR3ZWVuID0gdGhpcy5nYW1lLmFkZC50d2Vlbih0aGlzKS50byh7XG4gICAgICAgIGFscGhhOiAwXG4gICAgICB9LCAyMDAsIFBoYXNlci5FYXNpbmcuTGluZWFyLk5vbmUsIHRydWUpO1xuICAgICAgdHdlZW4ub25Db21wbGV0ZS5hZGQoXy5iaW5kKGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLnJlc2V0SW1hZ2UoKTtcbiAgICAgICAgdGhpcy5raWxsKCk7XG4gICAgICB9LCB0aGlzKSk7XG4gICAgfVxuICB9KTtcblxuICAvLyBFeHBvcnRcbiAgbW9kdWxlLmV4cG9ydHMgPSBDYXJyb3Q7XG59KSgpO1xuIiwiLyogZ2xvYmFsIF86ZmFsc2UsIFBoYXNlcjpmYWxzZSAqL1xuXG4vKipcbiAqIFByZWZhYiAob2JqZWN0cykgRGlsbCBmb3IgYm9vc3RpbmdcbiAqL1xuXG4oZnVuY3Rpb24oKSB7XG4gIFwidXNlIHN0cmljdFwiO1xuXG4gIC8vIENvbnN0cnVjdG9yXG4gIHZhciBEaWxsID0gZnVuY3Rpb24oZ2FtZSwgeCwgeSkge1xuICAgIC8vIENhbGwgZGVmYXVsdCBzcHJpdGVcbiAgICBQaGFzZXIuU3ByaXRlLmNhbGwodGhpcywgZ2FtZSwgeCwgeSwgXCJnYW1lLXNwcml0ZXNcIiwgXCJkaWxsLnBuZ1wiKTtcblxuICAgIC8vIFNpemVcbiAgICB0aGlzLmFuY2hvci5zZXRUbygwLjUsIDAuNSk7XG4gICAgdGhpcy5zY2FsZS5zZXRUbygodGhpcy5nYW1lLndpZHRoIC8gOSkgLyB0aGlzLndpZHRoKTtcblxuICAgIC8vIFBoeXNpY3NcbiAgICB0aGlzLmdhbWUucGh5c2ljcy5hcmNhZGUuZW5hYmxlQm9keSh0aGlzKTtcbiAgICB0aGlzLmJvZHkuYWxsb3dHcmF2aXR5ID0gZmFsc2U7XG4gICAgdGhpcy5ib2R5LmltbW92YWJsZSA9IHRydWU7XG4gIH07XG5cbiAgLy8gRXh0ZW5kIGZyb20gU3ByaXRlXG4gIERpbGwucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQaGFzZXIuU3ByaXRlLnByb3RvdHlwZSk7XG4gIERpbGwucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gRGlsbDtcblxuICAvLyBBZGQgbWV0aG9kc1xuICBfLmV4dGVuZChEaWxsLnByb3RvdHlwZSwge1xuICAgIHVwZGF0ZTogZnVuY3Rpb24oKSB7XG5cbiAgICB9XG4gIH0pO1xuXG4gIC8vIEV4cG9ydFxuICBtb2R1bGUuZXhwb3J0cyA9IERpbGw7XG59KSgpO1xuIiwiLyogZ2xvYmFsIF86ZmFsc2UsIFBoYXNlcjpmYWxzZSAqL1xuXG4vKipcbiAqIFByZWZhYiBIZXJvL2NoYXJhY3RlclxuICovXG5cbihmdW5jdGlvbigpIHtcbiAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgLy8gQ29uc3RydWN0b3JcbiAgdmFyIEhlcm8gPSBmdW5jdGlvbihnYW1lLCB4LCB5KSB7XG4gICAgLy8gQ2FsbCBkZWZhdWx0IHNwcml0ZVxuICAgIFBoYXNlci5TcHJpdGUuY2FsbCh0aGlzLCBnYW1lLCB4LCB5LCBcInBpY2tsZS1zcHJpdGVzXCIsIFwicGlja2xlLWp1bXAtMDIucG5nXCIpO1xuXG4gICAgLy8gQ29uZmlndXJlXG4gICAgdGhpcy5hbmNob3Iuc2V0VG8oMC41KTtcbiAgICB0aGlzLm9yaWdpbmFsU2NhbGUgPSAodGhpcy5nYW1lLndpZHRoIC8gMjIpIC8gdGhpcy53aWR0aDtcbiAgICB0aGlzLnNjYWxlLnNldFRvKHRoaXMub3JpZ2luYWxTY2FsZSk7XG4gICAgdGhpcy5nYW1lLnBoeXNpY3MuYXJjYWRlLmVuYWJsZUJvZHkodGhpcyk7XG4gICAgdGhpcy5pc0RlYWQgPSBmYWxzZTtcblxuICAgIC8vIFRyYWNrIHdoZXJlIHRoZSBoZXJvIHN0YXJ0ZWQgYW5kIGhvdyBtdWNoIHRoZSBkaXN0YW5jZVxuICAgIC8vIGhhcyBjaGFuZ2VkIGZyb20gdGhhdCBwb2ludFxuICAgIHRoaXMueU9yaWcgPSB0aGlzLnk7XG4gICAgdGhpcy55Q2hhbmdlID0gMDtcblxuICAgIC8vIEFuaW1hdGlvbnNcbiAgICB2YXIgdXBGcmFtZXMgPSBQaGFzZXIuQW5pbWF0aW9uLmdlbmVyYXRlRnJhbWVOYW1lcyhcInBpY2tsZS1qdW1wLVwiLCAxLCA0LCBcIi5wbmdcIiwgMik7XG4gICAgdmFyIGRvd25GcmFtZXMgPSBQaGFzZXIuQW5pbWF0aW9uLmdlbmVyYXRlRnJhbWVOYW1lcyhcInBpY2tsZS1qdW1wLVwiLCA0LCAxLCBcIi5wbmdcIiwgMik7XG4gICAgdGhpcy5qdW1wVXAgPSB0aGlzLmFuaW1hdGlvbnMuYWRkKFwianVtcC11cFwiLCB1cEZyYW1lcyk7XG4gICAgdGhpcy5KdW1wRG93biA9IHRoaXMuYW5pbWF0aW9ucy5hZGQoXCJqdW1wLWRvd25cIiwgZG93bkZyYW1lcyk7XG4gICAgdGhpcy5qdW1wID0gdGhpcy5hbmltYXRpb25zLmFkZChcImp1bXBcIiwgdXBGcmFtZXMuY29uY2F0KGRvd25GcmFtZXMpKTtcbiAgfTtcblxuICAvLyBFeHRlbmQgZnJvbSBTcHJpdGVcbiAgSGVyby5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFBoYXNlci5TcHJpdGUucHJvdG90eXBlKTtcbiAgSGVyby5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBIZXJvO1xuXG4gIC8vIEFkZCBtZXRob2RzXG4gIF8uZXh0ZW5kKEhlcm8ucHJvdG90eXBlLCB7XG4gICAgdXBkYXRlOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciByeDtcbiAgICAgIHZhciByeTtcblxuICAgICAgLy8gVHJhY2sgdGhlIG1heGltdW0gYW1vdW50IHRoYXQgdGhlIGhlcm8gaGFzIHRyYXZlbGxlZFxuICAgICAgdGhpcy55Q2hhbmdlID0gTWF0aC5tYXgodGhpcy55Q2hhbmdlLCBNYXRoLmFicyh0aGlzLnkgLSB0aGlzLnlPcmlnKSk7XG5cbiAgICAgIC8vIFdyYXAgYXJvdW5kIGVkZ2VzIGxlZnQvdGlnaHQgZWRnZXNcbiAgICAgIHRoaXMuZ2FtZS53b3JsZC53cmFwKHRoaXMsIHRoaXMud2lkdGggLyAyLCBmYWxzZSwgdHJ1ZSwgZmFsc2UpO1xuXG4gICAgICAvLyBXaGVuIGhlYWRpbmcgZG93biwgYW5pbWF0ZSB0byBkb3duXG4gICAgICBpZiAodGhpcy5ib2R5LnZlbG9jaXR5LnkgPiAwICYmIHRoaXMuZ29pbmdVcCkge1xuICAgICAgICB0aGlzLm9uRmlyZSA9IGZhbHNlO1xuICAgICAgICB0aGlzLmdvaW5nVXAgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5kb0p1bXBEb3duKCk7XG4gICAgICB9XG5cbiAgICAgIC8vIEVsc2Ugd2hlbiBoZWFkaW5nIHVwLCBub3RlXG4gICAgICBlbHNlIGlmICh0aGlzLmJvZHkudmVsb2NpdHkueSA8IDAgJiYgIXRoaXMuZ29pbmdVcCkge1xuICAgICAgICB0aGlzLmdvaW5nVXAgPSB0cnVlO1xuICAgICAgICB0aGlzLmRvSnVtcFVwKCk7XG4gICAgICB9XG5cbiAgICAgIC8vIFNoYWtlIHdoZW4gb24gZmlyZVxuICAgICAgaWYgKHRoaXMub25GaXJlKSB7XG4gICAgICAgIHJ4ID0gdGhpcy5nYW1lLnJuZC5pbnRlZ2VySW5SYW5nZSgtNCwgNCk7XG4gICAgICAgIHJ5ID0gdGhpcy5nYW1lLnJuZC5pbnRlZ2VySW5SYW5nZSgtMiwgMik7XG4gICAgICAgIHRoaXMucG9zaXRpb24ueCArPSByeDtcbiAgICAgICAgdGhpcy5wb3NpdGlvbi55ICs9IHJ5O1xuICAgICAgfVxuICAgIH0sXG5cbiAgICAvLyBSZXNldCBwbGFjZW1lbnQgY3VzdG9tXG4gICAgcmVzZXRQbGFjZW1lbnQ6IGZ1bmN0aW9uKHgsIHkpIHtcbiAgICAgIHRoaXMucmVzZXQoeCwgeSk7XG4gICAgICB0aGlzLnlPcmlnID0gdGhpcy55O1xuICAgICAgdGhpcy55Q2hhbmdlID0gMDtcbiAgICB9LFxuXG4gICAgLy8gSnVtcCB1cFxuICAgIGRvSnVtcFVwOiBmdW5jdGlvbigpIHtcbiAgICAgIGlmICghdGhpcy5vbkZpcmUgJiYgIXRoaXMuaXNEZWFkKSB7XG4gICAgICAgIHRoaXMuYW5pbWF0aW9ucy5wbGF5KFwianVtcC11cFwiLCAxNSwgZmFsc2UpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICAvLyBKdW1wIGRvd25cbiAgICBkb0p1bXBEb3duOiBmdW5jdGlvbigpIHtcbiAgICAgIGlmICghdGhpcy5vbkZpcmUgJiYgIXRoaXMuaXNEZWFkKSB7XG4gICAgICAgIHRoaXMuYW5pbWF0aW9ucy5wbGF5KFwianVtcC1kb3duXCIsIDE1LCBmYWxzZSk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIC8vIE9uIGZpcmVcbiAgICBzZXRPbkZpcmU6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5vbkZpcmUgPSB0cnVlO1xuICAgICAgdGhpcy5sb2FkVGV4dHVyZShcInBpY2tsZS1zcHJpdGVzXCIsIFwicGlja2xlLXJvY2tldC5wbmdcIik7XG4gICAgICB0aGlzLnNjYWxlLnNldFRvKHRoaXMub3JpZ2luYWxTY2FsZSAqIDEuNSk7XG4gICAgfSxcblxuICAgIC8vIE9mZiBmaXJlXG4gICAgcHV0T3V0RmlyZTogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnNjYWxlLnNldFRvKHRoaXMub3JpZ2luYWxTY2FsZSk7XG4gICAgICB0aGlzLm9uRmlyZSA9IGZhbHNlO1xuICAgIH0sXG5cbiAgICAvLyBNdXJkZXIgd2l0aCBib3RjaHlcbiAgICBib3RjaHlNdWRlcjogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLmlzRGVhZCA9IHRydWU7XG4gICAgICB0aGlzLmxvYWRUZXh0dXJlKFwicGlja2xlLXNwcml0ZXNcIiwgXCJwaWNrbGUtYm90Y2h5LnBuZ1wiKTtcblxuICAgICAgdmFyIHR3ZWVuID0gdGhpcy5nYW1lLmFkZC50d2Vlbih0aGlzKS50byh7XG4gICAgICAgIGFuZ2xlOiAxNzVcbiAgICAgIH0sIDUwMCwgUGhhc2VyLkVhc2luZy5MaW5lYXIuTm9uZSwgdHJ1ZSk7XG5cbiAgICAgIHR3ZWVuLm9uQ29tcGxldGUuYWRkKF8uYmluZChmdW5jdGlvbigpIHtcbiAgICAgICAgLy8gRG8gc29tZXRoaW5nXG4gICAgICB9LCB0aGlzKSk7XG4gICAgfVxuICB9KTtcblxuICAvLyBFeHBvcnRcbiAgbW9kdWxlLmV4cG9ydHMgPSBIZXJvO1xufSkoKTtcbiIsIi8qIGdsb2JhbCBfOmZhbHNlLCBQaGFzZXI6ZmFsc2UgKi9cblxuLyoqXG4gKiBQcmVmYWIgamFyIHBsYXRmb3JtXG4gKi9cblxuKGZ1bmN0aW9uKCkge1xuICBcInVzZSBzdHJpY3RcIjtcblxuICAvLyBDb25zdHJ1Y3RvclxuICB2YXIgSmFyID0gZnVuY3Rpb24oZ2FtZSwgeCwgeSkge1xuICAgIC8vIENhbGwgZGVmYXVsdCBzcHJpdGVcbiAgICBQaGFzZXIuU3ByaXRlLmNhbGwodGhpcywgZ2FtZSwgeCwgeSwgXCJnYW1lLXNwcml0ZXNcIiwgXCJqYXIucG5nXCIpO1xuXG4gICAgLy8gQ29uZmlndXJlXG4gICAgdGhpcy5hbmNob3Iuc2V0VG8oMC41LCAwLjUpO1xuICAgIHRoaXMuc2NhbGUuc2V0VG8oKHRoaXMuZ2FtZS53aWR0aCAvIDIpIC8gdGhpcy53aWR0aCk7XG5cbiAgICAvLyBQaHlzaWNzXG4gICAgdGhpcy5nYW1lLnBoeXNpY3MuYXJjYWRlLmVuYWJsZUJvZHkodGhpcyk7XG4gICAgdGhpcy5ib2R5LmFsbG93R3Jhdml0eSA9IGZhbHNlO1xuICAgIHRoaXMuYm9keS5pbW1vdmFibGUgPSB0cnVlO1xuICB9O1xuXG4gIC8vIEV4dGVuZCBmcm9tIFNwcml0ZVxuICBKYXIucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQaGFzZXIuU3ByaXRlLnByb3RvdHlwZSk7XG4gIEphci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBKYXI7XG5cbiAgLy8gQWRkIG1ldGhvZHNcbiAgXy5leHRlbmQoSmFyLnByb3RvdHlwZSwge1xuICAgIHVwZGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgfVxuICB9KTtcblxuICAvLyBFeHBvcnRcbiAgbW9kdWxlLmV4cG9ydHMgPSBKYXI7XG59KSgpO1xuIiwiLyogZ2xvYmFsIF86ZmFsc2UsIFBoYXNlcjpmYWxzZSAqL1xuXG4vKipcbiAqIFByZWZhYiBtaW5pIHBpY2tsZSAoa2luZCBvZiBsaWtlIGEgY29pbiwganVzdCBwb2ludHMpXG4gKi9cblxuKGZ1bmN0aW9uKCkge1xuICBcInVzZSBzdHJpY3RcIjtcblxuICAvLyBDb25zdHJ1Y3RvclxuICB2YXIgTWluaSA9IGZ1bmN0aW9uKGdhbWUsIHgsIHkpIHtcbiAgICAvLyBDYWxsIGRlZmF1bHQgc3ByaXRlXG4gICAgUGhhc2VyLlNwcml0ZS5jYWxsKHRoaXMsIGdhbWUsIHgsIHksIFwiZ2FtZS1zcHJpdGVzXCIsIFwibWFnaWNkaWxsLnBuZ1wiKTtcblxuICAgIC8vIENvbmZpZ3VyZVxuICAgIHRoaXMuYW5jaG9yLnNldFRvKDAuNSwgMC41KTtcbiAgICB0aGlzLnNjYWxlLnNldFRvKCh0aGlzLmdhbWUud2lkdGggLyAyMCkgLyB0aGlzLndpZHRoKTtcblxuICAgIC8vIFBoeXNpY3NcbiAgICB0aGlzLmdhbWUucGh5c2ljcy5hcmNhZGUuZW5hYmxlQm9keSh0aGlzKTtcbiAgICB0aGlzLmJvZHkuYWxsb3dHcmF2aXR5ID0gZmFsc2U7XG4gICAgdGhpcy5ib2R5LmltbW92YWJsZSA9IHRydWU7XG4gIH07XG5cbiAgLy8gRXh0ZW5kIGZyb20gU3ByaXRlXG4gIE1pbmkucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQaGFzZXIuU3ByaXRlLnByb3RvdHlwZSk7XG4gIE1pbmkucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gTWluaTtcblxuICAvLyBBZGQgbWV0aG9kc1xuICBfLmV4dGVuZChNaW5pLnByb3RvdHlwZSwge1xuICAgIHVwZGF0ZTogZnVuY3Rpb24oKSB7XG5cbiAgICB9XG4gIH0pO1xuXG4gIC8vIEV4cG9ydFxuICBtb2R1bGUuZXhwb3J0cyA9IE1pbmk7XG59KSgpO1xuIiwiLyogZ2xvYmFsIF86ZmFsc2UsIFBoYXNlcjpmYWxzZSAqL1xuXG4vKipcbiAqIFByZWZhYiAob2JqZWN0cykgYm9vc3QgZm9yIHBlcHBlclxuICovXG5cbihmdW5jdGlvbigpIHtcbiAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgLy8gQ29uc3RydWN0b3IgZm9yIEJvb3N0XG4gIHZhciBQZXBwZXIgPSBmdW5jdGlvbihnYW1lLCB4LCB5KSB7XG4gICAgLy8gQ2FsbCBkZWZhdWx0IHNwcml0ZVxuICAgIFBoYXNlci5TcHJpdGUuY2FsbCh0aGlzLCBnYW1lLCB4LCB5LCBcImdhbWUtc3ByaXRlc1wiLCBcImdob3N0LXBlcHBlci5wbmdcIik7XG5cbiAgICAvLyBTaXplXG4gICAgdGhpcy5hbmNob3Iuc2V0VG8oMC41LCAwLjUpO1xuICAgIHRoaXMuc2NhbGUuc2V0VG8oKHRoaXMuZ2FtZS53aWR0aCAvIDE4KSAvIHRoaXMud2lkdGgpO1xuXG4gICAgLy8gUGh5c2ljc1xuICAgIHRoaXMuZ2FtZS5waHlzaWNzLmFyY2FkZS5lbmFibGVCb2R5KHRoaXMpO1xuICAgIHRoaXMuYm9keS5hbGxvd0dyYXZpdHkgPSBmYWxzZTtcbiAgICB0aGlzLmJvZHkuaW1tb3ZhYmxlID0gdHJ1ZTtcbiAgfTtcblxuICAvLyBFeHRlbmQgZnJvbSBTcHJpdGVcbiAgUGVwcGVyLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUGhhc2VyLlNwcml0ZS5wcm90b3R5cGUpO1xuICBQZXBwZXIucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gUGVwcGVyO1xuXG4gIC8vIEFkZCBtZXRob2RzXG4gIF8uZXh0ZW5kKFBlcHBlci5wcm90b3R5cGUsIHtcbiAgICB1cGRhdGU6IGZ1bmN0aW9uKCkge1xuXG4gICAgfVxuICB9KTtcblxuICAvLyBFeHBvcnRcbiAgbW9kdWxlLmV4cG9ydHMgPSBQZXBwZXI7XG59KSgpO1xuIiwiLyogZ2xvYmFsIF86ZmFsc2UsIFBoYXNlcjpmYWxzZSAqL1xuXG4vKipcbiAqIEdhbWVvdmVyIHN0YXRlXG4gKi9cblxuKGZ1bmN0aW9uKCkge1xuICBcInVzZSBzdHJpY3RcIjtcblxuICAvLyBDb25zdHJ1Y3RvclxuICB2YXIgR2FtZW92ZXIgPSBmdW5jdGlvbigpIHtcbiAgICBQaGFzZXIuU3RhdGUuY2FsbCh0aGlzKTtcbiAgfTtcblxuICAvLyBFeHRlbmQgZnJvbSBTdGF0ZVxuICBHYW1lb3Zlci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFBoYXNlci5TdGF0ZS5wcm90b3R5cGUpO1xuICBHYW1lb3Zlci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBHYW1lb3ZlcjtcblxuICAvLyBBZGQgbWV0aG9kc1xuICBfLmV4dGVuZChHYW1lb3Zlci5wcm90b3R5cGUsIFBoYXNlci5TdGF0ZS5wcm90b3R5cGUsIHtcbiAgICAvLyBQcmVsb2FkXG4gICAgcHJlbG9hZDogZnVuY3Rpb24oKSB7XG4gICAgICAvLyBMb2FkIHVwIGdhbWUgaW1hZ2VzXG4gICAgICB0aGlzLmdhbWUubG9hZC5hdGxhcyhcImdhbWVvdmVyLXNwcml0ZXNcIiwgXCJhc3NldHMvZ2FtZW92ZXItc3ByaXRlcy5wbmdcIiwgXCJhc3NldHMvZ2FtZW92ZXItc3ByaXRlcy5qc29uXCIpO1xuICAgIH0sXG5cbiAgICAvLyBDcmVhdGVcbiAgICBjcmVhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgLy8gU2V0IGJhY2tncm91bmRcbiAgICAgIHRoaXMuZ2FtZS5zdGFnZS5iYWNrZ3JvdW5kQ29sb3IgPSBcIiM4Y2M2M2ZcIjtcblxuICAgICAgLy8gTWFrZSBwYWRkaW5nIGRlcGVuZGVudCBvbiB3aWR0aFxuICAgICAgdGhpcy5wYWRkaW5nID0gdGhpcy5nYW1lLndpZHRoIC8gNTA7XG5cbiAgICAgIC8vIFBsYWNlIHRpdGxlXG4gICAgICB0aGlzLnRpdGxlSW1hZ2UgPSB0aGlzLmdhbWUuYWRkLnNwcml0ZSgwLCAwLCBcImdhbWVvdmVyLXNwcml0ZXNcIiwgXCJnYW1lb3Zlci5wbmdcIik7XG4gICAgICB0aGlzLnRpdGxlSW1hZ2UuYW5jaG9yLnNldFRvKDAuNSwgMCk7XG4gICAgICB0aGlzLnRpdGxlSW1hZ2Uuc2NhbGUuc2V0VG8oKHRoaXMuZ2FtZS53aWR0aCAtICh0aGlzLnBhZGRpbmcgKiAxNikpIC8gdGhpcy50aXRsZUltYWdlLndpZHRoKTtcbiAgICAgIHRoaXMudGl0bGVJbWFnZS5yZXNldCh0aGlzLmNlbnRlclN0YWdlWCh0aGlzLnRpdGxlSW1hZ2UpLCB0aGlzLnBhZGRpbmcgKiAyKTtcbiAgICAgIHRoaXMuZ2FtZS5hZGQuZXhpc3RpbmcodGhpcy50aXRsZUltYWdlKTtcblxuICAgICAgLy8gSGlnaHNjb3JlIGxpc3QuICBDYW4ndCBzZWVtIHRvIGZpbmQgYSB3YXkgdG8gcGFzcyB0aGUgc2NvcmVcbiAgICAgIC8vIHZpYSBhIHN0YXRlIGNoYW5nZS5cbiAgICAgIHRoaXMuc2NvcmUgPSB0aGlzLmdhbWUucGlja2xlLnNjb3JlO1xuXG4gICAgICAvLyBTaG93IHNjb3JlXG4gICAgICB0aGlzLnNob3dTY29yZSgpO1xuXG4gICAgICAvLyBTaG93IGlucHV0IGlmIG5ldyBoaWdoc2NvcmUsIG90aGVyd2lzZSBzaG93IGxpc3RcbiAgICAgIGlmICh0aGlzLmdhbWUucGlja2xlLmlzSGlnaHNjb3JlKHRoaXMuc2NvcmUpKSB7XG4gICAgICAgIHRoaXMuaGlnaHNjb3JlSW5wdXQoKTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICB0aGlzLmhpZ2hzY29yZUxpc3QoKTtcbiAgICAgIH1cblxuICAgICAgLy8gUGxhY2UgcmUtcGxheVxuICAgICAgdGhpcy5yZXBsYXlJbWFnZSA9IHRoaXMuZ2FtZS5hZGQuc3ByaXRlKHRoaXMuZ2FtZS53aWR0aCAtIHRoaXMucGFkZGluZyAqIDIsXG4gICAgICAgIHRoaXMuZ2FtZS5oZWlnaHQgLSB0aGlzLnBhZGRpbmcgKiAyLCBcImdhbWVvdmVyLXNwcml0ZXNcIiwgXCJ0aXRsZS1wbGF5LnBuZ1wiKTtcbiAgICAgIHRoaXMucmVwbGF5SW1hZ2UuYW5jaG9yLnNldFRvKDEsIDEpO1xuICAgICAgdGhpcy5yZXBsYXlJbWFnZS5zY2FsZS5zZXRUbygodGhpcy5nYW1lLndpZHRoICogMC4yNSkgLyB0aGlzLnJlcGxheUltYWdlLndpZHRoKTtcbiAgICAgIHRoaXMuZ2FtZS5hZGQuZXhpc3RpbmcodGhpcy5yZXBsYXlJbWFnZSk7XG5cbiAgICAgIC8vIEFkZCBob3ZlciBmb3IgbW91c2VcbiAgICAgIHRoaXMucmVwbGF5SW1hZ2UuaW5wdXRFbmFibGVkID0gdHJ1ZTtcbiAgICAgIHRoaXMucmVwbGF5SW1hZ2UuZXZlbnRzLm9uSW5wdXRPdmVyLmFkZChmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5yZXBsYXlJbWFnZS5vcmlnaW5hbFRpbnQgPSB0aGlzLnJlcGxheUltYWdlLnRpbnQ7XG4gICAgICAgIHRoaXMucmVwbGF5SW1hZ2UudGludCA9IDAuNSAqIDB4RkZGRkZGO1xuICAgICAgfSwgdGhpcyk7XG5cbiAgICAgIHRoaXMucmVwbGF5SW1hZ2UuZXZlbnRzLm9uSW5wdXRPdXQuYWRkKGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLnJlcGxheUltYWdlLnRpbnQgPSB0aGlzLnJlcGxheUltYWdlLm9yaWdpbmFsVGludDtcbiAgICAgIH0sIHRoaXMpO1xuXG4gICAgICAvLyBBZGQgaW50ZXJhY3Rpb25zIGZvciBzdGFydGluZ1xuICAgICAgdGhpcy5yZXBsYXlJbWFnZS5ldmVudHMub25JbnB1dERvd24uYWRkKHRoaXMucmVwbGF5LCB0aGlzKTtcblxuICAgICAgLy8gSW5wdXRcbiAgICAgIHRoaXMubGVmdEJ1dHRvbiA9IHRoaXMuZ2FtZS5pbnB1dC5rZXlib2FyZC5hZGRLZXkoUGhhc2VyLktleWJvYXJkLkxFRlQpO1xuICAgICAgdGhpcy5yaWdodEJ1dHRvbiA9IHRoaXMuZ2FtZS5pbnB1dC5rZXlib2FyZC5hZGRLZXkoUGhhc2VyLktleWJvYXJkLlJJR0hUKTtcbiAgICAgIHRoaXMudXBCdXR0b24gPSB0aGlzLmdhbWUuaW5wdXQua2V5Ym9hcmQuYWRkS2V5KFBoYXNlci5LZXlib2FyZC5VUCk7XG4gICAgICB0aGlzLmRvd25CdXR0b24gPSB0aGlzLmdhbWUuaW5wdXQua2V5Ym9hcmQuYWRkS2V5KFBoYXNlci5LZXlib2FyZC5ET1dOKTtcbiAgICAgIHRoaXMuYWN0aW9uQnV0dG9uID0gdGhpcy5nYW1lLmlucHV0LmtleWJvYXJkLmFkZEtleShQaGFzZXIuS2V5Ym9hcmQuU1BBQ0VCQVIpO1xuXG4gICAgICB0aGlzLmxlZnRCdXR0b24ub25Eb3duLmFkZChmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHRoaXMuaElucHV0KSB7XG4gICAgICAgICAgdGhpcy5tb3ZlQ3Vyc29yKC0xKTtcbiAgICAgICAgfVxuICAgICAgfSwgdGhpcyk7XG5cbiAgICAgIHRoaXMucmlnaHRCdXR0b24ub25Eb3duLmFkZChmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHRoaXMuaElucHV0KSB7XG4gICAgICAgICAgdGhpcy5tb3ZlQ3Vyc29yKDEpO1xuICAgICAgICB9XG4gICAgICB9LCB0aGlzKTtcblxuICAgICAgdGhpcy51cEJ1dHRvbi5vbkRvd24uYWRkKGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAodGhpcy5oSW5wdXQpIHtcbiAgICAgICAgICB0aGlzLm1vdmVMZXR0ZXIoMSk7XG4gICAgICAgIH1cbiAgICAgIH0sIHRoaXMpO1xuXG4gICAgICB0aGlzLmRvd25CdXR0b24ub25Eb3duLmFkZChmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHRoaXMuaElucHV0KSB7XG4gICAgICAgICAgdGhpcy5tb3ZlTGV0dGVyKC0xKTtcbiAgICAgICAgfVxuICAgICAgfSwgdGhpcyk7XG5cbiAgICAgIHRoaXMuYWN0aW9uQnV0dG9uLm9uRG93bi5hZGQoZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBzYXZlZDtcblxuICAgICAgICBpZiAodGhpcy5oSW5wdXQpIHtcbiAgICAgICAgICBzYXZlZCA9IHRoaXMuc2F2ZUhpZ2hzY29yZSgpO1xuICAgICAgICAgIGlmIChzYXZlZCkge1xuICAgICAgICAgICAgdGhpcy5oaWdoc2NvcmVMaXN0KCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIHRoaXMucmVwbGF5KCk7XG4gICAgICAgIH1cbiAgICAgIH0sIHRoaXMpO1xuICAgIH0sXG5cbiAgICAvLyBVcGRhdGVcbiAgICB1cGRhdGU6IGZ1bmN0aW9uKCkge1xuICAgIH0sXG5cbiAgICAvLyBTaHV0ZG93biwgY2xlYW4gdXAgb24gc3RhdGUgY2hhbmdlXG4gICAgc2h1dGRvd246IGZ1bmN0aW9uKCkge1xuICAgICAgW1widGl0bGVUZXh0XCIsIFwicmVwbGF5VGV4dFwiXS5mb3JFYWNoKF8uYmluZChmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgIGlmICh0aGlzW2l0ZW1dICYmIHRoaXNbaXRlbV0uZGVzdHJveSkge1xuICAgICAgICAgIHRoaXNbaXRlbV0uZGVzdHJveSgpO1xuICAgICAgICAgIHRoaXNbaXRlbV0gPSBudWxsO1xuICAgICAgICB9XG4gICAgICB9LCB0aGlzKSk7XG4gICAgfSxcblxuICAgIC8vIEhhbmRsZSByZXBsYXlcbiAgICByZXBsYXk6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5nYW1lLnN0YXRlLnN0YXJ0KFwibWVudVwiKTtcbiAgICB9LFxuXG4gICAgLy8gU2hvdyBoaWdoc2NvcmVcbiAgICBzaG93U2NvcmU6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zY29yZUdyb3VwID0gdGhpcy5nYW1lLmFkZC5ncm91cCgpO1xuXG4gICAgICAvLyBQbGFjZSBsYWJlbFxuICAgICAgdGhpcy55b3VyU2NvcmVJbWFnZSA9IG5ldyBQaGFzZXIuU3ByaXRlKHRoaXMuZ2FtZSwgMCwgMCwgXCJnYW1lb3Zlci1zcHJpdGVzXCIsIFwieW91ci1zY29yZS5wbmdcIik7XG4gICAgICB0aGlzLnlvdXJTY29yZUltYWdlLmFuY2hvci5zZXRUbygwLjUsIDApO1xuICAgICAgdGhpcy55b3VyU2NvcmVJbWFnZS5zY2FsZS5zZXRUbygoKHRoaXMuZ2FtZS53aWR0aCAqIDAuNSkgLSAodGhpcy5wYWRkaW5nICogNikpIC8gdGhpcy55b3VyU2NvcmVJbWFnZS53aWR0aCk7XG4gICAgICB0aGlzLnlvdXJTY29yZUltYWdlLnJlc2V0KHRoaXMuY2VudGVyU3RhZ2VYKHRoaXMueW91clNjb3JlSW1hZ2UpLFxuICAgICAgICB0aGlzLnRpdGxlSW1hZ2UuaGVpZ2h0ICsgKHRoaXMucGFkZGluZyAqIDgpKTtcblxuICAgICAgLy8gU2NvcmVcbiAgICAgIHRoaXMuc2NvcmVUZXh0ID0gbmV3IFBoYXNlci5UZXh0KHRoaXMuZ2FtZSwgMCwgMCxcbiAgICAgICAgdGhpcy5zY29yZS50b0xvY2FsZVN0cmluZygpLCB7XG4gICAgICAgICAgZm9udDogXCJcIiArICh0aGlzLmdhbWUud29ybGQuaGVpZ2h0IC8gMTApICsgXCJweCBPbW5lc1JvbWFuLTkwMFwiLFxuICAgICAgICAgIGZpbGw6IFwiIzM5YjU0YVwiLFxuICAgICAgICAgIGFsaWduOiBcImNlbnRlclwiLFxuICAgICAgICB9KTtcbiAgICAgIHRoaXMuc2NvcmVUZXh0LmFuY2hvci5zZXRUbygwLjUsIDApO1xuICAgICAgdGhpcy5zY29yZVRleHQucmVzZXQodGhpcy5jZW50ZXJTdGFnZVgodGhpcy5zY29yZVRleHQpLFxuICAgICAgICB0aGlzLnRpdGxlSW1hZ2UuaGVpZ2h0ICsgdGhpcy55b3VyU2NvcmVJbWFnZS5oZWlnaHQgKyAodGhpcy5wYWRkaW5nICogNykpO1xuXG4gICAgICAvLyBBZGQgZ3JvdXBzXG4gICAgICBfLmRlbGF5KF8uYmluZChmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5zY29yZUdyb3VwLmFkZCh0aGlzLnlvdXJTY29yZUltYWdlKTtcbiAgICAgICAgdGhpcy5zY29yZUdyb3VwLmFkZCh0aGlzLnNjb3JlVGV4dCk7XG4gICAgICB9LCB0aGlzKSwgMTAwMCk7XG4gICAgfSxcblxuICAgIC8vIE1ha2UgaGlnaGVzdCBzY29yZSBpbnB1dFxuICAgIGhpZ2hzY29yZUlucHV0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuaElucHV0ID0gdHJ1ZTtcbiAgICAgIHRoaXMuaElucHV0SW5kZXggPSAwO1xuICAgICAgdGhpcy5oSW5wdXRzID0gdGhpcy5nYW1lLmFkZC5ncm91cCgpO1xuICAgICAgdmFyIHkgPSB0aGlzLmdhbWUud29ybGQuaGVpZ2h0ICogMC43O1xuXG4gICAgICAvLyBGaXJzdCBpbnB1dFxuICAgICAgdmFyIG9uZSA9IG5ldyBQaGFzZXIuVGV4dChcbiAgICAgICAgdGhpcy5nYW1lLFxuICAgICAgICB0aGlzLmdhbWUud29ybGQud2lkdGggKiAwLjMzMzMzLFxuICAgICAgICB5LFxuICAgICAgICBcIkFcIiwge1xuICAgICAgICAgIGZvbnQ6IFwiXCIgKyAodGhpcy5nYW1lLndvcmxkLmhlaWdodCAvIDE1KSArIFwicHggT21uZXNSb21hbi1ib2xkXCIsXG4gICAgICAgICAgZmlsbDogXCIjRkZGRkZGXCIsXG4gICAgICAgICAgYWxpZ246IFwiY2VudGVyXCIsXG4gICAgICAgIH0pO1xuICAgICAgb25lLmFuY2hvci5zZXQoMC41KTtcbiAgICAgIHRoaXMuaElucHV0cy5hZGQob25lKTtcblxuICAgICAgLy8gU2Vjb25kIGlucHV0XG4gICAgICB2YXIgc2Vjb25kID0gbmV3IFBoYXNlci5UZXh0KFxuICAgICAgICB0aGlzLmdhbWUsXG4gICAgICAgIHRoaXMuZ2FtZS53b3JsZC53aWR0aCAqIDAuNSxcbiAgICAgICAgeSxcbiAgICAgICAgXCJBXCIsIHtcbiAgICAgICAgICBmb250OiBcIlwiICsgKHRoaXMuZ2FtZS53b3JsZC5oZWlnaHQgLyAxNSkgKyBcInB4IE9tbmVzUm9tYW4tYm9sZFwiLFxuICAgICAgICAgIGZpbGw6IFwiI0ZGRkZGRlwiLFxuICAgICAgICAgIGFsaWduOiBcImNlbnRlclwiLFxuICAgICAgICB9KTtcbiAgICAgIHNlY29uZC5hbmNob3Iuc2V0KDAuNSk7XG4gICAgICB0aGlzLmhJbnB1dHMuYWRkKHNlY29uZCk7XG5cbiAgICAgIC8vIFNlY29uZCBpbnB1dFxuICAgICAgdmFyIHRoaXJkID0gbmV3IFBoYXNlci5UZXh0KFxuICAgICAgICB0aGlzLmdhbWUsXG4gICAgICAgIHRoaXMuZ2FtZS53b3JsZC53aWR0aCAqIDAuNjY2NjYsXG4gICAgICAgIHksXG4gICAgICAgIFwiQVwiLCB7XG4gICAgICAgICAgZm9udDogXCJcIiArICh0aGlzLmdhbWUud29ybGQuaGVpZ2h0IC8gMTUpICsgXCJweCBPbW5lc1JvbWFuLWJvbGRcIixcbiAgICAgICAgICBmaWxsOiBcIiNGRkZGRkZcIixcbiAgICAgICAgICBhbGlnbjogXCJjZW50ZXJcIixcbiAgICAgICAgfSk7XG4gICAgICB0aGlyZC5hbmNob3Iuc2V0KDAuNSk7XG4gICAgICB0aGlzLmhJbnB1dHMuYWRkKHRoaXJkKTtcblxuICAgICAgLy8gQ3Vyc29yXG4gICAgICB0aGlzLmhDdXJzb3IgPSB0aGlzLmdhbWUuYWRkLnRleHQoXG4gICAgICAgIG9uZS54LFxuICAgICAgICBvbmUueSAtICh0aGlzLmdhbWUud29ybGQuaGVpZ2h0IC8gMjApLFxuICAgICAgICBcIl9cIiwge1xuICAgICAgICAgIGZvbnQ6IFwiYm9sZCBcIiArICh0aGlzLmdhbWUud29ybGQuaGVpZ2h0IC8gNSkgKyBcInB4IEFyaWFsXCIsXG4gICAgICAgICAgZmlsbDogXCIjRkZGRkZGXCIsXG4gICAgICAgICAgYWxpZ246IFwiY2VudGVyXCIsXG4gICAgICAgIH0pO1xuICAgICAgdGhpcy5oQ3Vyc29yLmFuY2hvci5zZXQoMC41KTtcblxuICAgICAgLy8gSGFuZGxlIGluaXRhbCBjdXJzb3JcbiAgICAgIHRoaXMubW92ZUN1cnNvcigwKTtcbiAgICB9LFxuXG4gICAgLy8gTW92ZSBjdXJzb3JcbiAgICBtb3ZlQ3Vyc29yOiBmdW5jdGlvbihhbW91bnQpIHtcbiAgICAgIHZhciBuZXdJbmRleCA9IHRoaXMuaElucHV0SW5kZXggKyBhbW91bnQ7XG4gICAgICB0aGlzLmhJbnB1dEluZGV4ID0gKG5ld0luZGV4IDwgMCkgPyB0aGlzLmhJbnB1dHMubGVuZ3RoIC0gMSA6XG4gICAgICAgIChuZXdJbmRleCA+PSB0aGlzLmhJbnB1dHMubGVuZ3RoKSA/IDAgOiBuZXdJbmRleDtcbiAgICAgIHZhciBpID0gdGhpcy5oSW5wdXRzLmdldENoaWxkQXQodGhpcy5oSW5wdXRJbmRleCk7XG5cbiAgICAgIC8vIE1vdmUgY3Vyc29yXG4gICAgICB0aGlzLmhDdXJzb3IueCA9IGkueDtcbiAgICAgIHRoaXMuaElucHV0cy5mb3JFYWNoKGZ1bmN0aW9uKGlucHV0KSB7XG4gICAgICAgIGlucHV0LmZpbGwgPSBcIiNGRkZGRkZcIjtcbiAgICAgIH0pO1xuXG4gICAgICBpLmZpbGwgPSBcIiNGRkREQkJcIjtcblxuICAgICAgLy8gVE9ETzogSGlnaGxpZ2h0IGlucHV0LlxuICAgIH0sXG5cbiAgICAvLyBNb3ZlIGxldHRlclxuICAgIG1vdmVMZXR0ZXI6IGZ1bmN0aW9uKGFtb3VudCkge1xuICAgICAgdmFyIGkgPSB0aGlzLmhJbnB1dHMuZ2V0Q2hpbGRBdCh0aGlzLmhJbnB1dEluZGV4KTtcbiAgICAgIHZhciB0ID0gaS50ZXh0O1xuICAgICAgdmFyIG4gPSAodCA9PT0gXCJBXCIgJiYgYW1vdW50ID09PSAtMSkgPyBcIlpcIiA6XG4gICAgICAgICh0ID09PSBcIlpcIiAmJiBhbW91bnQgPT09IDEpID8gXCJBXCIgOlxuICAgICAgICBTdHJpbmcuZnJvbUNoYXJDb2RlKHQuY2hhckNvZGVBdCgwKSArIGFtb3VudCk7XG5cbiAgICAgIGkudGV4dCA9IG47XG4gICAgfSxcblxuICAgIC8vIFNhdmUgaGlnaHNjb3JlXG4gICAgc2F2ZUhpZ2hzY29yZTogZnVuY3Rpb24oKSB7XG4gICAgICAvLyBHZXQgbmFtZVxuICAgICAgdmFyIG5hbWUgPSBcIlwiO1xuICAgICAgdGhpcy5oSW5wdXRzLmZvckVhY2goZnVuY3Rpb24oaW5wdXQpIHtcbiAgICAgICAgbmFtZSA9IG5hbWUgKyBpbnB1dC50ZXh0O1xuICAgICAgfSk7XG5cbiAgICAgIC8vIERvbid0IGFsbG93IEFBQVxuICAgICAgaWYgKG5hbWUgPT09IFwiQUFBXCIpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuXG4gICAgICAvLyBTYXZlIGhpZ2hzY29yZVxuICAgICAgdGhpcy5nYW1lLnBpY2tsZS5zZXRIaWdoc2NvcmUodGhpcy5zY29yZSwgbmFtZSk7XG5cbiAgICAgIC8vIFJlbW92ZSBpbnB1dFxuICAgICAgdGhpcy5oSW5wdXQgPSBmYWxzZTtcbiAgICAgIHRoaXMuaElucHV0cy5kZXN0cm95KCk7XG4gICAgICB0aGlzLmhDdXJzb3IuZGVzdHJveSgpO1xuXG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9LFxuXG4gICAgLy8gSGlnaHNjb3JlIGxpc3RcbiAgICBoaWdoc2NvcmVMaXN0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuaGlnaHNjb3JlTGltaXQgPSB0aGlzLmdhbWUucGlja2xlLmhpZ2hzY29yZUxpbWl0IHx8IDM7XG4gICAgICB0aGlzLmhpZ2hzY29yZUxpc3RHcm91cCA9IHRoaXMuZ2FtZS5hZGQuZ3JvdXAoKTtcbiAgICAgIHRoaXMuZ2FtZS5waWNrbGUuc29ydEhpZ2hzY29yZXMoKTtcbiAgICAgIHZhciBmb250U2l6ZSA9IHRoaXMuZ2FtZS53b3JsZC5oZWlnaHQgLyAyNTtcbiAgICAgIHZhciBiYXNlWSA9IHRoaXMudGl0bGVJbWFnZS5oZWlnaHQgKyB0aGlzLnlvdXJTY29yZUltYWdlLmhlaWdodCArXG4gICAgICAgIHRoaXMuc2NvcmVUZXh0LmhlaWdodCArIHRoaXMucGFkZGluZyAqIDEwO1xuICAgICAgdmFyIHhPZmZzZXQgPSAtdGhpcy5wYWRkaW5nICogMjtcblxuICAgICAgLy8gQWRkIGxhYmVsXG4gICAgICB0aGlzLmhpZ2hzY29yZUxpc3RMYWJlbCA9IG5ldyBQaGFzZXIuVGV4dCh0aGlzLmdhbWUsIDAsIDAsXG4gICAgICAgIFwiSGlnaCBTY29yZXNcIiwge1xuICAgICAgICAgIGZvbnQ6IFwiXCIgKyAodGhpcy5nYW1lLndvcmxkLmhlaWdodCAvIDE3LjUpICsgXCJweCBPbW5lc1JvbWFuLWJvbGRcIixcbiAgICAgICAgICBmaWxsOiBcIiNiOGY0YmNcIixcbiAgICAgICAgICBhbGlnbjogXCJyaWdodFwiLFxuICAgICAgICB9KTtcbiAgICAgIHRoaXMuaGlnaHNjb3JlTGlzdExhYmVsLmFuY2hvci5zZXRUbygwLjUsIDApO1xuICAgICAgdGhpcy5oaWdoc2NvcmVMaXN0TGFiZWwucmVzZXQodGhpcy5jZW50ZXJTdGFnZVgodGhpcy5oaWdoc2NvcmVMaXN0TGFiZWwpLCBiYXNlWSk7XG4gICAgICB0aGlzLmhpZ2hzY29yZUxpc3RHcm91cC5hZGQodGhpcy5oaWdoc2NvcmVMaXN0TGFiZWwpO1xuXG4gICAgICAvLyBOZXcgYmFzZSBoZWlnaHRcbiAgICAgIGJhc2VZID0gYmFzZVkgKyB0aGlzLmhpZ2hzY29yZUxpc3RMYWJlbC5oZWlnaHQgKyB0aGlzLnBhZGRpbmcgKiAwLjI1O1xuXG4gICAgICAvLyBBZGQgaGlnaCBzY29yZXNcbiAgICAgIGlmICh0aGlzLmdhbWUucGlja2xlLmhpZ2hzY29yZXMubGVuZ3RoID4gMCkge1xuICAgICAgICBfLmVhY2godGhpcy5nYW1lLnBpY2tsZS5oaWdoc2NvcmVzLnJldmVyc2UoKS5zbGljZSgwLCB0aGlzLmhpZ2hzY29yZUxpbWl0KSxcbiAgICAgICAgICBfLmJpbmQoZnVuY3Rpb24oaCwgaSkge1xuICAgICAgICAgIC8vIE5hbWVcbiAgICAgICAgICB2YXIgbmFtZSA9IG5ldyBQaGFzZXIuVGV4dChcbiAgICAgICAgICAgIHRoaXMuZ2FtZSxcbiAgICAgICAgICAgIHRoaXMuZ2FtZS53aWR0aCAvIDIgLSB0aGlzLnBhZGRpbmcgKyB4T2Zmc2V0LFxuICAgICAgICAgICAgYmFzZVkgKyAoKGZvbnRTaXplICsgdGhpcy5wYWRkaW5nIC8gMikgKiBpKSxcbiAgICAgICAgICAgIGgubmFtZSwge1xuICAgICAgICAgICAgICBmb250OiBcIlwiICsgZm9udFNpemUgKyBcInB4IE9tbmVzUm9tYW5cIixcbiAgICAgICAgICAgICAgZmlsbDogXCIjYjhmNGJjXCIsXG4gICAgICAgICAgICAgIGFsaWduOiBcInJpZ2h0XCIsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICBuYW1lLmFuY2hvci5zZXRUbygxLCAwKTtcblxuICAgICAgICAgIC8vIFNjb3JlXG4gICAgICAgICAgdmFyIHNjb3JlID0gbmV3IFBoYXNlci5UZXh0KFxuICAgICAgICAgICAgdGhpcy5nYW1lLFxuICAgICAgICAgICAgdGhpcy5nYW1lLndpZHRoIC8gMiArIHRoaXMucGFkZGluZyArIHhPZmZzZXQsXG4gICAgICAgICAgICBiYXNlWSArICgoZm9udFNpemUgKyB0aGlzLnBhZGRpbmcgLyAyKSAqIGkpLFxuICAgICAgICAgICAgaC5zY29yZS50b0xvY2FsZVN0cmluZygpLCB7XG4gICAgICAgICAgICAgIGZvbnQ6IFwiXCIgKyBmb250U2l6ZSArIFwicHggT21uZXNSb21hblwiLFxuICAgICAgICAgICAgICBmaWxsOiBcIiNiOGY0YmNcIixcbiAgICAgICAgICAgICAgYWxpZ246IFwibGVmdFwiLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgc2NvcmUuYW5jaG9yLnNldFRvKDAsIDApO1xuXG4gICAgICAgICAgLy8gQWRkIHRvIGdyb3Vwc1xuICAgICAgICAgIHRoaXMuaGlnaHNjb3JlTGlzdEdyb3VwLmFkZChuYW1lKTtcbiAgICAgICAgICB0aGlzLmhpZ2hzY29yZUxpc3RHcm91cC5hZGQoc2NvcmUpO1xuICAgICAgICB9LCB0aGlzKSk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIC8vIENlbnRlciB4IG9uIHN0YWdlXG4gICAgY2VudGVyU3RhZ2VYOiBmdW5jdGlvbihvYmopIHtcbiAgICAgIHJldHVybiAoKHRoaXMuZ2FtZS53aWR0aCAtIG9iai53aWR0aCkgLyAyKSArIChvYmoud2lkdGggLyAyKTtcbiAgICB9LFxuXG4gICAgLy8gQ2VudGVyIHggb24gc3RhZ2VcbiAgICBjZW50ZXJTdGFnZVk6IGZ1bmN0aW9uKG9iaikge1xuICAgICAgcmV0dXJuICgodGhpcy5nYW1lLmhlaWdodCAtIG9iai5oZWlnaHQpIC8gMikgKyAob2JqLmhlaWdodCAvIDIpO1xuICAgIH1cbiAgfSk7XG5cbiAgLy8gRXhwb3J0XG4gIG1vZHVsZS5leHBvcnRzID0gR2FtZW92ZXI7XG59KSgpO1xuIiwiLyogZ2xvYmFsIF86ZmFsc2UsIFBoYXNlcjpmYWxzZSAqL1xuXG4vKipcbiAqIE1lbnUgc3RhdGVcbiAqL1xuXG4oZnVuY3Rpb24oKSB7XG4gIFwidXNlIHN0cmljdFwiO1xuXG4gIC8vIENvbnN0cnVjdG9yXG4gIHZhciBNZW51ID0gZnVuY3Rpb24oKSB7XG4gICAgUGhhc2VyLlN0YXRlLmNhbGwodGhpcyk7XG4gIH07XG5cbiAgLy8gRXh0ZW5kIGZyb20gU3RhdGVcbiAgTWVudS5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFBoYXNlci5TdGF0ZS5wcm90b3R5cGUpO1xuICBNZW51LnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IE1lbnU7XG5cbiAgLy8gQWRkIG1ldGhvZHNcbiAgXy5leHRlbmQoTWVudS5wcm90b3R5cGUsIFBoYXNlci5TdGF0ZS5wcm90b3R5cGUsIHtcbiAgICAvLyBQcmVsb2FkXG4gICAgcHJlbG9hZDogZnVuY3Rpb24oKSB7XG4gICAgICAvLyBMb2FkIHVwIGdhbWUgaW1hZ2VzXG4gICAgICB0aGlzLmdhbWUubG9hZC5hdGxhcyhcInRpdGxlLXNwcml0ZXNcIiwgXCJhc3NldHMvdGl0bGUtc3ByaXRlcy5wbmdcIiwgXCJhc3NldHMvdGl0bGUtc3ByaXRlcy5qc29uXCIpO1xuICAgIH0sXG5cbiAgICAvLyBDcmVhdGVcbiAgICBjcmVhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgLy8gU2V0IGJhY2tncm91bmRcbiAgICAgIHRoaXMuZ2FtZS5zdGFnZS5iYWNrZ3JvdW5kQ29sb3IgPSBcIiNiOGY0YmNcIjtcblxuICAgICAgLy8gTWFrZSBwYWRkaW5nIGRlcGVuZGVudCBvbiB3aWR0aFxuICAgICAgdGhpcy5wYWRkaW5nID0gdGhpcy5nYW1lLndpZHRoIC8gNTA7XG5cbiAgICAgIC8vIFBsYWNlIHRpdGxlXG4gICAgICB0aGlzLnRpdGxlSW1hZ2UgPSB0aGlzLmdhbWUuYWRkLnNwcml0ZSgwLCAwLCBcInRpdGxlLXNwcml0ZXNcIiwgXCJ0aXRsZS5wbmdcIik7XG4gICAgICB0aGlzLnRpdGxlSW1hZ2UuYW5jaG9yLnNldFRvKDAuNSwgMC41KTtcbiAgICAgIHRoaXMudGl0bGVJbWFnZS5zY2FsZS5zZXRUbygodGhpcy5nYW1lLndpZHRoIC0gKHRoaXMucGFkZGluZyAqIDQpKSAvIHRoaXMudGl0bGVJbWFnZS53aWR0aCk7XG4gICAgICB0aGlzLnRpdGxlSW1hZ2UucmVzZXQodGhpcy5jZW50ZXJTdGFnZVgodGhpcy50aXRsZUltYWdlKSxcbiAgICAgICAgdGhpcy5jZW50ZXJTdGFnZVkodGhpcy50aXRsZUltYWdlKSAtIHRoaXMucGFkZGluZyAqIDQpO1xuICAgICAgdGhpcy5nYW1lLmFkZC5leGlzdGluZyh0aGlzLnRpdGxlSW1hZ2UpO1xuXG4gICAgICAvLyBQbGFjZSBwbGF5XG4gICAgICB0aGlzLnBsYXlJbWFnZSA9IHRoaXMuZ2FtZS5hZGQuc3ByaXRlKDAsIDAsIFwidGl0bGUtc3ByaXRlc1wiLCBcInRpdGxlLXBsYXkucG5nXCIpO1xuICAgICAgdGhpcy5wbGF5SW1hZ2UuYW5jaG9yLnNldFRvKDAuNCwgMSk7XG4gICAgICB0aGlzLnBsYXlJbWFnZS5zY2FsZS5zZXRUbygodGhpcy5nYW1lLndpZHRoICogMC41KSAvIHRoaXMudGl0bGVJbWFnZS53aWR0aCk7XG4gICAgICB0aGlzLnBsYXlJbWFnZS5yZXNldCh0aGlzLmNlbnRlclN0YWdlWCh0aGlzLnBsYXlJbWFnZSksIHRoaXMuZ2FtZS5oZWlnaHQgLSB0aGlzLnBhZGRpbmcgKiAyKTtcbiAgICAgIHRoaXMuZ2FtZS5hZGQuZXhpc3RpbmcodGhpcy5wbGF5SW1hZ2UpO1xuXG4gICAgICAvLyBBZGQgaG92ZXIgZm9yIG1vdXNlXG4gICAgICB0aGlzLnBsYXlJbWFnZS5pbnB1dEVuYWJsZWQgPSB0cnVlO1xuICAgICAgdGhpcy5wbGF5SW1hZ2UuZXZlbnRzLm9uSW5wdXRPdmVyLmFkZChmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5wbGF5SW1hZ2Uub3JpZ2luYWxUaW50ID0gdGhpcy5wbGF5SW1hZ2UudGludDtcbiAgICAgICAgdGhpcy5wbGF5SW1hZ2UudGludCA9IDAuNSAqIDB4RkZGRkZGO1xuICAgICAgfSwgdGhpcyk7XG5cbiAgICAgIHRoaXMucGxheUltYWdlLmV2ZW50cy5vbklucHV0T3V0LmFkZChmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5wbGF5SW1hZ2UudGludCA9IHRoaXMucGxheUltYWdlLm9yaWdpbmFsVGludDtcbiAgICAgIH0sIHRoaXMpO1xuXG4gICAgICAvLyBBZGQgbW91c2UgaW50ZXJhY3Rpb25cbiAgICAgIHRoaXMucGxheUltYWdlLmV2ZW50cy5vbklucHV0RG93bi5hZGQodGhpcy5nbywgdGhpcyk7XG5cbiAgICAgIC8vIEFkZCBrZXlib2FyZCBpbnRlcmFjdGlvblxuICAgICAgdGhpcy5hY3Rpb25CdXR0b24gPSB0aGlzLmdhbWUuaW5wdXQua2V5Ym9hcmQuYWRkS2V5KFBoYXNlci5LZXlib2FyZC5TUEFDRUJBUik7XG4gICAgICB0aGlzLmFjdGlvbkJ1dHRvbi5vbkRvd24uYWRkKGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLmdvKCk7XG4gICAgICB9LCB0aGlzKTtcblxuICAgICAgLy8gU2hvdyBhbnkgb3ZlcmxheXNcbiAgICAgIHRoaXMuZ2FtZS5waWNrbGUuc2hvd092ZXJsYXkoXCIuc3RhdGUtbWVudVwiKTtcbiAgICB9LFxuXG4gICAgLy8gU3RhcnQgcGxheWluZ1xuICAgIGdvOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuZ2FtZS5waWNrbGUuaGlkZU92ZXJsYXkoXCIuc3RhdGUtbWVudVwiKTtcbiAgICAgIHRoaXMuZ2FtZS5zdGF0ZS5zdGFydChcInBsYXlcIik7XG4gICAgfSxcblxuICAgIC8vIFVwZGF0ZVxuICAgIHVwZGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgfSxcblxuICAgIC8vIENlbnRlciB4IG9uIHN0YWdlXG4gICAgY2VudGVyU3RhZ2VYOiBmdW5jdGlvbihvYmopIHtcbiAgICAgIHJldHVybiAoKHRoaXMuZ2FtZS53aWR0aCAtIG9iai53aWR0aCkgLyAyKSArIChvYmoud2lkdGggLyAyKTtcbiAgICB9LFxuXG4gICAgLy8gQ2VudGVyIHggb24gc3RhZ2VcbiAgICBjZW50ZXJTdGFnZVk6IGZ1bmN0aW9uKG9iaikge1xuICAgICAgcmV0dXJuICgodGhpcy5nYW1lLmhlaWdodCAtIG9iai5oZWlnaHQpIC8gMikgKyAob2JqLmhlaWdodCAvIDIpO1xuICAgIH1cbiAgfSk7XG5cbiAgLy8gRXhwb3J0XG4gIG1vZHVsZS5leHBvcnRzID0gTWVudTtcbn0pKCk7XG4iLCIvKiBnbG9iYWwgXzpmYWxzZSwgUGhhc2VyOmZhbHNlICovXG5cbi8qKlxuICogUGxheSBzdGF0ZVxuICovXG5cbihmdW5jdGlvbigpIHtcbiAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgLy8gRGVwZW5kZW5jaWVzXG4gIHZhciBwcmVmYWJzID0ge1xuICAgIERpbGw6IHJlcXVpcmUoXCIuL3ByZWZhYi1kaWxsLmpzXCIpLFxuICAgIFBlcHBlcjogcmVxdWlyZShcIi4vcHJlZmFiLXBlcHBlci5qc1wiKSxcbiAgICBCb3R1bGlzbTogcmVxdWlyZShcIi4vcHJlZmFiLWJvdHVsaXNtLmpzXCIpLFxuICAgIE1pbmk6IHJlcXVpcmUoXCIuL3ByZWZhYi1taW5pLmpzXCIpLFxuICAgIEhlcm86IHJlcXVpcmUoXCIuL3ByZWZhYi1oZXJvLmpzXCIpLFxuICAgIEJlYW46IHJlcXVpcmUoXCIuL3ByZWZhYi1iZWFuLmpzXCIpLFxuICAgIENhcnJvdDogcmVxdWlyZShcIi4vcHJlZmFiLWNhcnJvdC5qc1wiKSxcbiAgICBKYXI6IHJlcXVpcmUoXCIuL3ByZWZhYi1qYXIuanNcIilcbiAgfTtcblxuICAvLyBDb25zdHJ1Y3RvclxuICB2YXIgUGxheSA9IGZ1bmN0aW9uKCkge1xuICAgIFBoYXNlci5TdGF0ZS5jYWxsKHRoaXMpO1xuICB9O1xuXG4gIC8vIEV4dGVuZCBmcm9tIFN0YXRlXG4gIFBsYXkucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQaGFzZXIuU3RhdGUucHJvdG90eXBlKTtcbiAgUGxheS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBQbGF5O1xuXG4gIC8vIEFkZCBtZXRob2RzXG4gIF8uZXh0ZW5kKFBsYXkucHJvdG90eXBlLCBQaGFzZXIuU3RhdGUucHJvdG90eXBlLCB7XG4gICAgLy8gUHJlbG9hZFxuICAgIHByZWxvYWQ6IGZ1bmN0aW9uKCkge1xuICAgICAgLy8gTG9hZCB1cCBnYW1lIGltYWdlc1xuICAgICAgdGhpcy5nYW1lLmxvYWQuYXRsYXMoXCJnYW1lLXNwcml0ZXNcIiwgXCJhc3NldHMvZ2FtZS1zcHJpdGVzLnBuZ1wiLCBcImFzc2V0cy9nYW1lLXNwcml0ZXMuanNvblwiKTtcbiAgICAgIHRoaXMuZ2FtZS5sb2FkLmF0bGFzKFwicGlja2xlLXNwcml0ZXNcIiwgXCJhc3NldHMvcGlja2xlLXNwcml0ZXMucG5nXCIsIFwiYXNzZXRzL3BpY2tsZS1zcHJpdGVzLmpzb25cIik7XG4gICAgICB0aGlzLmdhbWUubG9hZC5hdGxhcyhcImNhcnJvdC1zcHJpdGVzXCIsIFwiYXNzZXRzL2NhcnJvdC1zcHJpdGVzLnBuZ1wiLCBcImFzc2V0cy9jYXJyb3Qtc3ByaXRlcy5qc29uXCIpO1xuICAgIH0sXG5cbiAgICAvLyBDcmVhdGVcbiAgICBjcmVhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgLy8gU2V0IGluaXRpYWwgZGlmZmljdWx0eSBhbmQgbGV2ZWwgc2V0dGluZ3NcbiAgICAgIHRoaXMuY3JlYXRlU3VwZXJMZXZlbEJHKCk7XG4gICAgICB0aGlzLnVwZGF0ZURpZmZpY3VsdHkoKTtcblxuICAgICAgLy8gU2NvcmluZ1xuICAgICAgdGhpcy5zY29yZU1pbmkgPSAxMDA7XG4gICAgICB0aGlzLnNjb3JlRGlsbCA9IDUwMDtcbiAgICAgIHRoaXMuc2NvcmVQZXBwZXIgPSA3NTA7XG4gICAgICB0aGlzLnNjb3JlQm90ID0gMTAwMDtcblxuICAgICAgLy8gU3BhY2luZ1xuICAgICAgdGhpcy5wYWRkaW5nID0gMTA7XG5cbiAgICAgIC8vIERldGVybWluZSB3aGVyZSBmaXJzdCBwbGF0Zm9ybSBhbmQgaGVybyB3aWxsIGJlLlxuICAgICAgdGhpcy5zdGFydFkgPSB0aGlzLmdhbWUuaGVpZ2h0IC0gNTtcblxuICAgICAgLy8gSW5pdGlhbGl6ZSB0cmFja2luZyB2YXJpYWJsZXNcbiAgICAgIHRoaXMucmVzZXRWaWV3VHJhY2tpbmcoKTtcblxuICAgICAgLy8gU2NhbGluZ1xuICAgICAgdGhpcy5nYW1lLnNjYWxlLnNjYWxlTW9kZSA9IFBoYXNlci5TY2FsZU1hbmFnZXIuU0hPV19BTEw7XG4gICAgICB0aGlzLmdhbWUuc2NhbGUubWF4V2lkdGggPSB0aGlzLmdhbWUud2lkdGg7XG4gICAgICB0aGlzLmdhbWUuc2NhbGUubWF4SGVpZ2h0ID0gdGhpcy5nYW1lLmhlaWdodDtcbiAgICAgIHRoaXMuZ2FtZS5zY2FsZS5wYWdlQWxpZ25Ib3Jpem9udGFsbHkgPSB0cnVlO1xuICAgICAgdGhpcy5nYW1lLnNjYWxlLnBhZ2VBbGlnblZlcnRpY2FsbHkgPSB0cnVlO1xuXG4gICAgICAvLyBQaHlzaWNzXG4gICAgICB0aGlzLmdhbWUucGh5c2ljcy5zdGFydFN5c3RlbShQaGFzZXIuUGh5c2ljcy5BUkNBREUpO1xuICAgICAgdGhpcy5nYW1lLnBoeXNpY3MuYXJjYWRlLmdyYXZpdHkueSA9IDEwMDA7XG5cbiAgICAgIC8vIENvbnRhaW5lcnNcbiAgICAgIHRoaXMuYmVhbnMgPSB0aGlzLmdhbWUuYWRkLmdyb3VwKCk7XG4gICAgICB0aGlzLmNhcnJvdHMgPSB0aGlzLmdhbWUuYWRkLmdyb3VwKCk7XG4gICAgICB0aGlzLm1pbmlzID0gdGhpcy5nYW1lLmFkZC5ncm91cCgpO1xuICAgICAgdGhpcy5kaWxscyA9IHRoaXMuZ2FtZS5hZGQuZ3JvdXAoKTtcbiAgICAgIHRoaXMucGVwcGVycyA9IHRoaXMuZ2FtZS5hZGQuZ3JvdXAoKTtcbiAgICAgIHRoaXMuYm90cyA9IHRoaXMuZ2FtZS5hZGQuZ3JvdXAoKTtcblxuICAgICAgLy8gUGxhdGZvcm1zXG4gICAgICB0aGlzLmFkZFBsYXRmb3JtcygpO1xuXG4gICAgICAvLyBBZGQgaGVybyBoZXJlIHNvIGlzIGFsd2F5cyBvbiB0b3AuXG4gICAgICB0aGlzLmhlcm8gPSBuZXcgcHJlZmFicy5IZXJvKHRoaXMuZ2FtZSwgMCwgMCk7XG4gICAgICB0aGlzLmhlcm8ucmVzZXRQbGFjZW1lbnQodGhpcy5nYW1lLndpZHRoICogMC41LCB0aGlzLnN0YXJ0WSAtIHRoaXMuaGVyby5oZWlnaHQgLSA1MCk7XG4gICAgICB0aGlzLmdhbWUuYWRkLmV4aXN0aW5nKHRoaXMuaGVybyk7XG5cbiAgICAgIC8vIEluaXRpYWxpemUgc2NvcmVcbiAgICAgIHRoaXMucmVzZXRTY29yZSgpO1xuICAgICAgdGhpcy51cGRhdGVTY29yZSgpO1xuXG4gICAgICAvLyBDdXJzb3JzLCBpbnB1dFxuICAgICAgdGhpcy5jdXJzb3JzID0gdGhpcy5nYW1lLmlucHV0LmtleWJvYXJkLmNyZWF0ZUN1cnNvcktleXMoKTtcbiAgICAgIHRoaXMuYWN0aW9uQnV0dG9uID0gdGhpcy5nYW1lLmlucHV0LmtleWJvYXJkLmFkZEtleShQaGFzZXIuS2V5Ym9hcmQuU1BBQ0VCQVIpO1xuICAgIH0sXG5cbiAgICAvLyBVcGRhdGVcbiAgICB1cGRhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgLy8gVGhpcyBpcyB3aGVyZSB0aGUgbWFpbiBtYWdpYyBoYXBwZW5zXG4gICAgICAvLyB0aGUgeSBvZmZzZXQgYW5kIHRoZSBoZWlnaHQgb2YgdGhlIHdvcmxkIGFyZSBhZGp1c3RlZFxuICAgICAgLy8gdG8gbWF0Y2ggdGhlIGhpZ2hlc3QgcG9pbnQgdGhlIGhlcm8gaGFzIHJlYWNoZWRcbiAgICAgIHRoaXMud29ybGQuc2V0Qm91bmRzKDAsIC10aGlzLmhlcm8ueUNoYW5nZSwgdGhpcy5nYW1lLndvcmxkLndpZHRoLFxuICAgICAgICB0aGlzLmdhbWUuaGVpZ2h0ICsgdGhpcy5oZXJvLnlDaGFuZ2UpO1xuXG4gICAgICAvLyBUaGUgYnVpbHQgaW4gY2FtZXJhIGZvbGxvdyBtZXRob2RzIHdvbid0IHdvcmsgZm9yIG91ciBuZWVkc1xuICAgICAgLy8gdGhpcyBpcyBhIGN1c3RvbSBmb2xsb3cgc3R5bGUgdGhhdCB3aWxsIG5vdCBldmVyIG1vdmUgZG93biwgaXQgb25seSBtb3ZlcyB1cFxuICAgICAgdGhpcy5jYW1lcmFZTWluID0gTWF0aC5taW4odGhpcy5jYW1lcmFZTWluLCB0aGlzLmhlcm8ueSAtIHRoaXMuZ2FtZS5oZWlnaHQgLyAyKTtcbiAgICAgIHRoaXMuY2FtZXJhLnkgPSB0aGlzLmNhbWVyYVlNaW47XG5cbiAgICAgIC8vIElmIGhlcm8gZmFsbHMgYmVsb3cgY2FtZXJhXG4gICAgICBpZiAodGhpcy5oZXJvLnkgPiB0aGlzLmNhbWVyYVlNaW4gKyB0aGlzLmdhbWUuaGVpZ2h0ICsgMjAwKSB7XG4gICAgICAgIHRoaXMuZ2FtZU92ZXIoKTtcbiAgICAgIH1cblxuICAgICAgLy8gSWYgaGVybyBpcyBnb2luZyBkb3duLCB0aGVuIG5vIGxvbmdlciBvbiBmaXJlXG4gICAgICBpZiAodGhpcy5oZXJvLmJvZHkudmVsb2NpdHkueSA+IDApIHtcbiAgICAgICAgdGhpcy5wdXRPdXRGaXJlKCk7XG4gICAgICB9XG5cbiAgICAgIC8vIE1vdmUgaGVyb1xuICAgICAgdGhpcy5oZXJvLmJvZHkudmVsb2NpdHkueCA9XG4gICAgICAgICh0aGlzLmN1cnNvcnMubGVmdC5pc0Rvd24pID8gLSh0aGlzLmdhbWUucGh5c2ljcy5hcmNhZGUuZ3Jhdml0eS55IC8gNSkgOlxuICAgICAgICAodGhpcy5jdXJzb3JzLnJpZ2h0LmlzRG93bikgPyAodGhpcy5nYW1lLnBoeXNpY3MuYXJjYWRlLmdyYXZpdHkueSAvIDUpIDogMDtcblxuICAgICAgLy8gQ29sbGlzaW9uc1xuICAgICAgdGhpcy51cGRhdGVDb2xsaXNpb25zKCk7XG5cbiAgICAgIC8vIEl0ZW1zIChwbGF0Zm9ybXMgYW5kIGl0ZW1zKVxuICAgICAgdGhpcy51cGRhdGVJdGVtcygpO1xuXG4gICAgICAvLyBVcGRhdGUgc2NvcmVcbiAgICAgIHRoaXMudXBkYXRlU2NvcmUoKTtcblxuICAgICAgLy8gVXBkYXRlIGRpZmZpY3VsdFxuICAgICAgdGhpcy51cGRhdGVEaWZmaWN1bHR5KCk7XG5cbiAgICAgIC8vIFNoYWtlXG4gICAgICB0aGlzLnVwZGF0ZVdvcmxkU2hha2UoKTtcblxuICAgICAgLy8gRGVidWdcbiAgICAgIGlmICh0aGlzLmdhbWUucGlja2xlLm9wdGlvbnMuZGVidWcpIHtcbiAgICAgICAgdGhpcy5nYW1lLmRlYnVnLmJvZHkodGhpcy5oZXJvKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLy8gSGFuZGxlIGNvbGxpc2lvbnNcbiAgICB1cGRhdGVDb2xsaXNpb25zOiBmdW5jdGlvbigpIHtcbiAgICAgIC8vIFdoZW4gZGVhZCwgbm8gY29sbGlzaW9ucywganVzdCBmYWxsIHRvIGRlYXRoLlxuICAgICAgaWYgKHRoaXMuaGVyby5pc0RlYWQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBQbGF0Zm9ybSBjb2xsaXNpb25zXG4gICAgICB0aGlzLmdhbWUucGh5c2ljcy5hcmNhZGUuY29sbGlkZSh0aGlzLmhlcm8sIHRoaXMuYmVhbnMsIHRoaXMudXBkYXRlSGVyb1BsYXRmb3JtLCBudWxsLCB0aGlzKTtcbiAgICAgIHRoaXMuZ2FtZS5waHlzaWNzLmFyY2FkZS5jb2xsaWRlKHRoaXMuaGVybywgdGhpcy5jYXJyb3RzLCB0aGlzLnVwZGF0ZUhlcm9QbGF0Zm9ybSwgbnVsbCwgdGhpcyk7XG4gICAgICB0aGlzLmdhbWUucGh5c2ljcy5hcmNhZGUuY29sbGlkZSh0aGlzLmhlcm8sIHRoaXMuYmFzZSwgdGhpcy51cGRhdGVIZXJvUGxhdGZvcm0sIG51bGwsIHRoaXMpO1xuXG4gICAgICAvLyBNaW5pIGNvbGxpc2lvbnNcbiAgICAgIHRoaXMuZ2FtZS5waHlzaWNzLmFyY2FkZS5vdmVybGFwKHRoaXMuaGVybywgdGhpcy5taW5pcywgZnVuY3Rpb24oaGVybywgbWluaSkge1xuICAgICAgICBtaW5pLmtpbGwoKTtcbiAgICAgICAgdGhpcy51cGRhdGVTY29yZSh0aGlzLnNjb3JlTWluaSk7XG4gICAgICB9LCBudWxsLCB0aGlzKTtcblxuICAgICAgLy8gRGlsbCBjb2xsaXNpb25zLiAgRG9uJ3QgZG8gYW55dGhpbmcgaWYgb24gZmlyZVxuICAgICAgaWYgKCF0aGlzLm9uRmlyZSkge1xuICAgICAgICB0aGlzLmdhbWUucGh5c2ljcy5hcmNhZGUub3ZlcmxhcCh0aGlzLmhlcm8sIHRoaXMuZGlsbHMsIGZ1bmN0aW9uKGhlcm8sIGRpbGwpIHtcbiAgICAgICAgICBkaWxsLmtpbGwoKTtcbiAgICAgICAgICB0aGlzLnVwZGF0ZVNjb3JlKHRoaXMuc2NvcmVEaWxsKTtcbiAgICAgICAgICBoZXJvLmJvZHkudmVsb2NpdHkueSA9IHRoaXMuZ2FtZS5waHlzaWNzLmFyY2FkZS5ncmF2aXR5LnkgKiAtMSAqIDEuNTtcbiAgICAgICAgfSwgbnVsbCwgdGhpcyk7XG4gICAgICB9XG5cbiAgICAgIC8vIFBlcHBlciBjb2xsaXNpb25zXG4gICAgICB0aGlzLmdhbWUucGh5c2ljcy5hcmNhZGUub3ZlcmxhcCh0aGlzLmhlcm8sIHRoaXMucGVwcGVycywgZnVuY3Rpb24oaGVybywgcGVwcGVyKSB7XG4gICAgICAgIHBlcHBlci5raWxsKCk7XG4gICAgICAgIHRoaXMudXBkYXRlU2NvcmUodGhpcy5zY29yZVBlcHBlcik7XG4gICAgICAgIHRoaXMuc2V0T25GaXJlKCk7XG4gICAgICAgIGhlcm8uYm9keS52ZWxvY2l0eS55ID0gdGhpcy5nYW1lLnBoeXNpY3MuYXJjYWRlLmdyYXZpdHkueSAqIC0xICogMztcbiAgICAgIH0sIG51bGwsIHRoaXMpO1xuXG4gICAgICAvLyBCb3R1bGlzbSBjb2xsaXNpb25zLiAgSWYgaGVybyBqdW1wcyBvbiB0b3AsIHRoZW4ga2lsbCwgb3RoZXJ3aXNlIGRpZSwgYW5kXG4gICAgICAvLyBpZ25vcmUgaWYgb24gZmlyZS5cbiAgICAgIGlmICghdGhpcy5vbkZpcmUpIHtcbiAgICAgICAgdGhpcy5nYW1lLnBoeXNpY3MuYXJjYWRlLmNvbGxpZGUodGhpcy5oZXJvLCB0aGlzLmJvdHMsIGZ1bmN0aW9uKGhlcm8sIGJvdCkge1xuICAgICAgICAgIGlmIChoZXJvLmJvZHkudG91Y2hpbmcuZG93bikge1xuICAgICAgICAgICAgYm90Lm11cmRlcigpO1xuICAgICAgICAgICAgdGhpcy51cGRhdGVTY29yZSh0aGlzLnNjb3JlQm90KTtcbiAgICAgICAgICAgIGhlcm8uYm9keS52ZWxvY2l0eS55ID0gdGhpcy5nYW1lLnBoeXNpY3MuYXJjYWRlLmdyYXZpdHkueSAqIC0xICogMC41O1xuICAgICAgICAgIH1cbiAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGhlcm8uYm90Y2h5TXVkZXIoKTtcbiAgICAgICAgICAgIGJvdC5tdXJkZXIoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0sIG51bGwsIHRoaXMpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICAvLyBQbGF0Zm9ybSBjb2xsaXNpb25cbiAgICB1cGRhdGVIZXJvUGxhdGZvcm06IGZ1bmN0aW9uKGhlcm8sIGl0ZW0pIHtcbiAgICAgIC8vIE1ha2Ugc3VyZSBubyBsb25nZXIgb24gZmlyZVxuICAgICAgdGhpcy5wdXRPdXRGaXJlKCk7XG5cbiAgICAgIC8vIEp1bXBcbiAgICAgIGhlcm8uYm9keS52ZWxvY2l0eS55ID0gdGhpcy5nYW1lLnBoeXNpY3MuYXJjYWRlLmdyYXZpdHkueSAqIC0xICogMC43O1xuXG4gICAgICAvLyBJZiBjYXJyb3QsIHNuYXBcbiAgICAgIGlmIChpdGVtIGluc3RhbmNlb2YgcHJlZmFicy5DYXJyb3QpIHtcbiAgICAgICAgaXRlbS5zbmFwKCk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIC8vIEhhbmRsZSBpdGVtc1xuICAgIHVwZGF0ZUl0ZW1zOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBoaWdoZXN0O1xuICAgICAgdmFyIGJlYW47XG4gICAgICB2YXIgY2Fycm90O1xuXG4gICAgICAvLyBSZW1vdmUgYW55IHBvb2wgaXRlbXMgdGhhdCBhcmUgb2ZmIHNjcmVlblxuICAgICAgW1wibWluaXNcIiwgXCJkaWxsc1wiLCBcImJvdHNcIiwgXCJwZXBwZXJzXCIsIFwiYmVhbnNcIiwgXCJjYXJyb3RzXCJdLmZvckVhY2goXy5iaW5kKGZ1bmN0aW9uKHBvb2wpIHtcbiAgICAgICAgdGhpc1twb29sXS5mb3JFYWNoQWxpdmUoZnVuY3Rpb24ocCkge1xuICAgICAgICAgIC8vIENoZWNrIGlmIHRoaXMgb25lIGlzIG9mIHRoZSBzY3JlZW5cbiAgICAgICAgICBpZiAocC55ID4gdGhpcy5jYW1lcmEueSArIHRoaXMuZ2FtZS5oZWlnaHQpIHtcbiAgICAgICAgICAgIHAua2lsbCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSwgdGhpcyk7XG4gICAgICB9LCB0aGlzKSk7XG5cbiAgICAgIC8vIFJlbW92ZSBhbnkgcmVndWxhciBpdGVtcyB0aGF0IGFyZSBvZmYgc2NyZWVuXG4gICAgICBbXCJiYXNlXCJdLmZvckVhY2goXy5iaW5kKGZ1bmN0aW9uKHApIHtcbiAgICAgICAgaWYgKHRoaXNbcF0gJiYgdGhpc1twXS5hbGl2ZSAmJiB0aGlzW3BdLnkgPiB0aGlzLmNhbWVyYS55ICsgdGhpcy5nYW1lLmhlaWdodCAqIDIpIHtcbiAgICAgICAgICB0aGlzW3BdLmtpbGwoKTtcbiAgICAgICAgfVxuICAgICAgfSwgdGhpcykpO1xuXG4gICAgICAvLyBEZXRlcm1pbmUgd2hlcmUgdGhlIGxhc3QgcGxhdGZvcm0gaXNcbiAgICAgIFtcImJlYW5zXCIsIFwiY2Fycm90c1wiXS5mb3JFYWNoKF8uYmluZChmdW5jdGlvbihncm91cCkge1xuICAgICAgICB0aGlzW2dyb3VwXS5mb3JFYWNoQWxpdmUoZnVuY3Rpb24ocCkge1xuICAgICAgICAgIGlmIChwLnkgPCB0aGlzLnBsYXRmb3JtWU1pbikge1xuICAgICAgICAgICAgdGhpcy5wbGF0Zm9ybVlNaW4gPSBwLnk7XG4gICAgICAgICAgICBoaWdoZXN0ID0gcDtcbiAgICAgICAgICB9XG4gICAgICAgIH0sIHRoaXMpO1xuICAgICAgfSwgdGhpcykpO1xuXG4gICAgICAvLyBBZGQgbmV3IHBsYXRmb3JtIGlmIG5lZWRlZFxuICAgICAgY2Fycm90ID0gdGhpcy5jYXJyb3RzLmdldEZpcnN0RGVhZCgpO1xuICAgICAgYmVhbiA9IHRoaXMuYmVhbnMuZ2V0Rmlyc3REZWFkKCk7XG4gICAgICBpZiAoY2Fycm90ICYmIGJlYW4pIHtcbiAgICAgICAgaWYgKE1hdGgucmFuZG9tKCkgPCB0aGlzLmNhcnJvdENoYW5jZSkge1xuICAgICAgICAgIHRoaXMucGxhY2VQbGF0Zm9ybShjYXJyb3QsIGhpZ2hlc3QpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIHRoaXMucGxhY2VQbGF0Zm9ybShiZWFuLCBoaWdoZXN0KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG5cbiAgICAvLyBTaGFrZSB3b3JsZCBlZmZlY3RcbiAgICB1cGRhdGVXb3JsZFNoYWtlOiBmdW5jdGlvbigpIHtcbiAgICAgIGlmICh0aGlzLnNoYWtlV29ybGRDb3VudGVyID4gMCkge1xuICAgICAgICB2YXIgbWFnbml0dWRlID0gTWF0aC5tYXgodGhpcy5zaGFrZVdvcmxkQ291bnRlciAvIDUwLCAxKSArIDE7XG4gICAgICAgIHZhciByeCA9IHRoaXMuZ2FtZS5ybmQuaW50ZWdlckluUmFuZ2UoLTQgKiBtYWduaXR1ZGUsIDQgKiBtYWduaXR1ZGUpO1xuICAgICAgICB2YXIgcnkgPSB0aGlzLmdhbWUucm5kLmludGVnZXJJblJhbmdlKC0yICogbWFnbml0dWRlLCAyICogbWFnbml0dWRlKTtcbiAgICAgICAgdGhpcy5nYW1lLmNhbWVyYS54ICs9IHJ4O1xuICAgICAgICB0aGlzLmdhbWUuY2FtZXJhLnkgKz0gcnk7XG4gICAgICAgIHRoaXMuc2hha2VXb3JsZENvdW50ZXItLTtcblxuICAgICAgICBpZiAodGhpcy5zaGFrZVdvcmxkQ291bnRlciA8PSAwKSB7XG4gICAgICAgICAgdGhpcy5nYW1lLmNhbWVyYS54ID0gMDtcbiAgICAgICAgICB0aGlzLmdhbWUuY2FtZXJhLnkgPSAwO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcblxuICAgIC8vIFNodXRkb3duXG4gICAgc2h1dGRvd246IGZ1bmN0aW9uKCkge1xuICAgICAgLy8gUmVzZXQgZXZlcnl0aGluZywgb3IgdGhlIHdvcmxkIHdpbGwgYmUgbWVzc2VkIHVwXG4gICAgICB0aGlzLndvcmxkLnNldEJvdW5kcygwLCAwLCB0aGlzLmdhbWUud2lkdGgsIHRoaXMuZ2FtZS5oZWlnaHQpO1xuICAgICAgdGhpcy5jdXJzb3IgPSBudWxsO1xuICAgICAgdGhpcy5yZXNldFZpZXdUcmFja2luZygpO1xuICAgICAgdGhpcy5yZXNldFNjb3JlKCk7XG5cbiAgICAgIFtcImhlcm9cIiwgXCJiZWFuc1wiLCBcIm1pbmlzXCIsIFwiZGlsbHNcIiwgXCJwZXBwZXJzXCIsXG4gICAgICAgIFwiY2Fycm90c1wiLCBcInNjb3JlR3JvdXBcIl0uZm9yRWFjaChfLmJpbmQoZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICBpZiAodGhpc1tpdGVtXSkge1xuICAgICAgICAgIHRoaXNbaXRlbV0uZGVzdHJveSgpO1xuICAgICAgICAgIHRoaXNbaXRlbV0gPSBudWxsO1xuICAgICAgICB9XG4gICAgICB9LCB0aGlzKSk7XG4gICAgfSxcblxuICAgIC8vIEdhbWUgb3ZlclxuICAgIGdhbWVPdmVyOiBmdW5jdGlvbigpIHtcbiAgICAgIC8vIENhbid0IHNlZW0gdG8gZmluZCBhIHdheSB0byBwYXNzIHRoZSBzY29yZVxuICAgICAgLy8gdmlhIGEgc3RhdGUgY2hhbmdlLlxuICAgICAgdGhpcy5nYW1lLnBpY2tsZS5zY29yZSA9IHRoaXMuc2NvcmU7XG4gICAgICB0aGlzLmdhbWUuc3RhdGUuc3RhcnQoXCJnYW1lb3ZlclwiKTtcbiAgICB9LFxuXG4gICAgLy8gU2hha2Ugd29ybGRcbiAgICBzaGFrZTogZnVuY3Rpb24obGVuZ3RoKSB7XG4gICAgICB0aGlzLnNoYWtlV29ybGRDb3VudGVyID0gKCFsZW5ndGgpID8gMCA6IHRoaXMuc2hha2VXb3JsZENvdW50ZXIgKyBsZW5ndGg7XG4gICAgfSxcblxuICAgIC8vIEFkZCBwbGF0Zm9ybSBwb29sIGFuZCBjcmVhdGUgaW5pdGlhbCBvbmVcbiAgICBhZGRQbGF0Zm9ybXM6IGZ1bmN0aW9uKCkge1xuICAgICAgLy8gQWRkIGJhc2UgcGxhdGZvcm0gKGphcikuXG4gICAgICB0aGlzLmJhc2UgPSBuZXcgcHJlZmFicy5KYXIodGhpcy5nYW1lLCB0aGlzLmdhbWUud2lkdGggKiAwLjUsIHRoaXMuc3RhcnRZLCB0aGlzLmdhbWUud2lkdGggKiAyKTtcbiAgICAgIHRoaXMuZ2FtZS5hZGQuZXhpc3RpbmcodGhpcy5iYXNlKTtcblxuICAgICAgLy8gQWRkIHNvbWUgYmFzZSBjYXJyb3RzIChidXQgaGF2ZSB0aGVtIG9mZiBzY3JlZW4pXG4gICAgICBfLmVhY2goXy5yYW5nZSgxMCksIF8uYmluZChmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHAgPSBuZXcgcHJlZmFicy5DYXJyb3QodGhpcy5nYW1lLCAtOTk5LCB0aGlzLmdhbWUuaGVpZ2h0ICogMik7XG4gICAgICAgIHRoaXMuY2Fycm90cy5hZGQocCk7XG4gICAgICB9LCB0aGlzKSk7XG5cbiAgICAgIC8vIEFkZCBzb21lIGJhc2UgYmVhbnNcbiAgICAgIHZhciBwcmV2aW91cztcbiAgICAgIF8uZWFjaChfLnJhbmdlKDIwKSwgXy5iaW5kKGZ1bmN0aW9uKGkpIHtcbiAgICAgICAgdmFyIHAgPSBuZXcgcHJlZmFicy5CZWFuKHRoaXMuZ2FtZSwgMCwgMCk7XG4gICAgICAgIHRoaXMucGxhY2VQbGF0Zm9ybShwLCBwcmV2aW91cywgdGhpcy53b3JsZC5oZWlnaHQgLSB0aGlzLnBsYXRmb3JtU3BhY2VZIC0gdGhpcy5wbGF0Zm9ybVNwYWNlWSAqIGkpO1xuICAgICAgICB0aGlzLmJlYW5zLmFkZChwKTtcbiAgICAgICAgcHJldmlvdXMgPSBwO1xuICAgICAgfSwgdGhpcykpO1xuICAgIH0sXG5cbiAgICAvLyBQbGFjZSBwbGF0Zm9ybVxuICAgIHBsYWNlUGxhdGZvcm06IGZ1bmN0aW9uKHBsYXRmb3JtLCBwcmV2aW91c1BsYXRmb3JtLCBvdmVycmlkZVksIHBsYXRmb3JtVHlwZSkge1xuICAgICAgcGxhdGZvcm0ucmVzZXRTZXR0aW5ncygpO1xuICAgICAgcGxhdGZvcm1UeXBlID0gKHBsYXRmb3JtVHlwZSA9PT0gdW5kZWZpbmVkKSA/IFwiYmVhblwiIDogcGxhdGZvcm1UeXBlO1xuICAgICAgdmFyIHkgPSBvdmVycmlkZVkgfHwgdGhpcy5wbGF0Zm9ybVlNaW4gLSB0aGlzLnBsYXRmb3JtU3BhY2VZO1xuICAgICAgdmFyIG1pblggPSBwbGF0Zm9ybS5taW5YO1xuICAgICAgdmFyIG1heFggPSBwbGF0Zm9ybS5tYXhYO1xuXG4gICAgICAvLyBEZXRlcm1pbmUgeCBiYXNlZCBvbiBwcmV2aW91c1BsYXRmb3JtXG4gICAgICB2YXIgeCA9IHRoaXMucm5kLmludGVnZXJJblJhbmdlKG1pblgsIG1heFgpO1xuICAgICAgaWYgKHByZXZpb3VzUGxhdGZvcm0pIHtcbiAgICAgICAgeCA9IHRoaXMucm5kLmludGVnZXJJblJhbmdlKHByZXZpb3VzUGxhdGZvcm0ueCAtIHRoaXMucGxhdGZvcm1HYXBNYXgsIHByZXZpb3VzUGxhdGZvcm0ueCArIHRoaXMucGxhdGZvcm1HYXBNYXgpO1xuXG4gICAgICAgIC8vIFNvbWUgbG9naWMgdG8gdHJ5IHRvIHdyYXBcbiAgICAgICAgeCA9ICh4IDwgMCkgPyBNYXRoLm1pbihtYXhYLCB0aGlzLndvcmxkLndpZHRoICsgeCkgOiBNYXRoLm1heCh4LCBtaW5YKTtcbiAgICAgICAgeCA9ICh4ID4gdGhpcy53b3JsZC53aWR0aCkgPyBNYXRoLm1heChtaW5YLCB4IC0gdGhpcy53b3JsZC53aWR0aCkgOiBNYXRoLm1pbih4LCBtYXhYKTtcbiAgICAgIH1cblxuICAgICAgLy8gUGxhY2VcbiAgICAgIHBsYXRmb3JtLnJlc2V0KHgsIHkpO1xuXG4gICAgICAvLyBBZGQgc29tZSBmbHVmZlxuICAgICAgdGhpcy5mbHVmZlBsYXRmb3JtKHBsYXRmb3JtKTtcbiAgICB9LFxuXG4gICAgLy8gQWRkIHBvc3NpYmxlIGZsdWZmIHRvIHBsYXRmb3JtXG4gICAgZmx1ZmZQbGF0Zm9ybTogZnVuY3Rpb24ocGxhdGZvcm0pIHtcbiAgICAgIHZhciB4ID0gcGxhdGZvcm0ueDtcbiAgICAgIHZhciB5ID0gcGxhdGZvcm0ueSAtIHBsYXRmb3JtLmhlaWdodCAvIDIgLSAzMDtcblxuICAgICAgLy8gQWRkIGZsdWZmXG4gICAgICBpZiAoTWF0aC5yYW5kb20oKSA8PSB0aGlzLmhvdmVyQ2hhbmNlKSB7XG4gICAgICAgIHBsYXRmb3JtLmhvdmVyID0gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKE1hdGgucmFuZG9tKCkgPD0gdGhpcy5taW5pQ2hhbmNlKSB7XG4gICAgICAgIHRoaXMuYWRkV2l0aFBvb2wodGhpcy5taW5pcywgXCJNaW5pXCIsIHgsIHkpO1xuICAgICAgfVxuICAgICAgZWxzZSBpZiAoTWF0aC5yYW5kb20oKSA8PSB0aGlzLmRpbGxDaGFuY2UpIHtcbiAgICAgICAgdGhpcy5hZGRXaXRoUG9vbCh0aGlzLmRpbGxzLCBcIkRpbGxcIiwgeCwgeSk7XG4gICAgICB9XG4gICAgICBlbHNlIGlmIChNYXRoLnJhbmRvbSgpIDw9IHRoaXMuYm90Q2hhbmNlKSB7XG4gICAgICAgIHRoaXMuYWRkV2l0aFBvb2wodGhpcy5ib3RzLCBcIkJvdHVsaXNtXCIsIHgsIHkpO1xuICAgICAgfVxuICAgICAgZWxzZSBpZiAoTWF0aC5yYW5kb20oKSA8PSB0aGlzLnBlcHBlckNoYW5jZSkge1xuICAgICAgICB0aGlzLmFkZFdpdGhQb29sKHRoaXMucGVwcGVycywgXCJQZXBwZXJcIiwgeCwgeSk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIC8vIEdlbmVyaWMgYWRkIHdpdGggcG9vbGluZyBmdW5jdGlvbmFsbGl0eVxuICAgIGFkZFdpdGhQb29sOiBmdW5jdGlvbihwb29sLCBwcmVmYWIsIHgsIHkpIHtcbiAgICAgIHZhciBvID0gcG9vbC5nZXRGaXJzdERlYWQoKTtcbiAgICAgIG8gPSBvIHx8IG5ldyBwcmVmYWJzW3ByZWZhYl0odGhpcy5nYW1lLCB4LCB5KTtcblxuICAgICAgLy8gVXNlIGN1c3RvbSByZXNldCBpZiBhdmFpbGFibGVcbiAgICAgIGlmIChvLnJlc2V0UGxhY2VtZW50KSB7XG4gICAgICAgIG8ucmVzZXRQbGFjZW1lbnQoeCwgeSk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgby5yZXNldCh4LCB5KTtcbiAgICAgIH1cblxuICAgICAgcG9vbC5hZGQobyk7XG4gICAgfSxcblxuICAgIC8vIFVwZGF0ZSBzY29yZS4gIFNjb3JlIGlzIHRoZSBzY29yZSB3aXRob3V0IGhvdyBmYXIgdGhleSBoYXZlIGdvbmUgdXAuXG4gICAgdXBkYXRlU2NvcmU6IGZ1bmN0aW9uKGFkZGl0aW9uKSB7XG4gICAgICBhZGRpdGlvbiA9IGFkZGl0aW9uIHx8IDA7XG4gICAgICB0aGlzLnNjb3JlVXAgPSAoLXRoaXMuY2FtZXJhWU1pbiA+PSA5OTk5OTk5KSA/IDAgOlxuICAgICAgICBNYXRoLm1pbihNYXRoLm1heCgwLCAtdGhpcy5jYW1lcmFZTWluKSwgOTk5OTk5OSAtIDEpO1xuICAgICAgdGhpcy5zY29yZUNvbGxlY3QgPSAodGhpcy5zY29yZUNvbGxlY3QgfHwgMCkgKyBhZGRpdGlvbjtcbiAgICAgIHRoaXMuc2NvcmUgPSBNYXRoLnJvdW5kKHRoaXMuc2NvcmVVcCArIHRoaXMuc2NvcmVDb2xsZWN0KTtcblxuICAgICAgLy8gU2NvcmUgdGV4dFxuICAgICAgaWYgKCF0aGlzLnNjb3JlR3JvdXApIHtcbiAgICAgICAgdGhpcy5zY29yZUdyb3VwID0gdGhpcy5nYW1lLmFkZC5ncm91cCgpO1xuXG4gICAgICAgIC8vIFNjb3JlIGxhYmVsXG4gICAgICAgIC8qXG4gICAgICAgIHRoaXMuc2NvcmVMYWJlbEltYWdlID0gdGhpcy5nYW1lLmFkZC5zcHJpdGUoXG4gICAgICAgICAgdGhpcy5wYWRkaW5nLFxuICAgICAgICAgIHRoaXMucGFkZGluZyAqIDAuODUsIFwiZ2FtZS1zcHJpdGVzXCIsIFwieW91ci1zY29yZS5wbmdcIik7XG4gICAgICAgIHRoaXMuc2NvcmVMYWJlbEltYWdlLmFuY2hvci5zZXRUbygwLCAwKTtcbiAgICAgICAgdGhpcy5zY29yZUxhYmVsSW1hZ2Uuc2NhbGUuc2V0VG8oKHRoaXMuZ2FtZS53aWR0aCAvIDUpIC8gdGhpcy5zY29yZUxhYmVsSW1hZ2Uud2lkdGgpO1xuICAgICAgICB0aGlzLnNjb3JlR3JvdXAuYWRkKHRoaXMuc2NvcmVMYWJlbEltYWdlKTtcbiAgICAgICAgKi9cblxuICAgICAgICAvLyBTY29yZSB0ZXh0XG4gICAgICAgIHRoaXMuc2NvcmVUZXh0ID0gbmV3IFBoYXNlci5UZXh0KHRoaXMuZ2FtZSwgdGhpcy5wYWRkaW5nLCAwLFxuICAgICAgICAgIHRoaXMuc2NvcmUudG9Mb2NhbGVTdHJpbmcoKSwge1xuICAgICAgICAgICAgZm9udDogXCJcIiArICh0aGlzLmdhbWUud29ybGQuaGVpZ2h0IC8gMzApICsgXCJweCBPbW5lc1JvbWFuLWJvbGRcIixcbiAgICAgICAgICAgIGZpbGw6IFwiIzM5YjU0YVwiLFxuICAgICAgICAgICAgYWxpZ246IFwibGVmdFwiLFxuICAgICAgICAgIH0pO1xuICAgICAgICB0aGlzLnNjb3JlVGV4dC5hbmNob3Iuc2V0VG8oMCwgMCk7XG4gICAgICAgIHRoaXMuc2NvcmVUZXh0LnNldFNoYWRvdygxLCAxLCBcInJnYmEoMCwgMCwgMCwgMC4zKVwiLCAyKTtcblxuICAgICAgICAvLyBGaXggc2NvcmUgdG8gdG9wXG4gICAgICAgIHRoaXMuc2NvcmVHcm91cC5maXhlZFRvQ2FtZXJhID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5zY29yZUdyb3VwLmNhbWVyYU9mZnNldC5zZXRUbyh0aGlzLnBhZGRpbmcsIHRoaXMucGFkZGluZyk7XG5cbiAgICAgICAgLy8gSGFjayBhcm91bmQgZm9udC1sb2FkaW5nIGlzc3Vlc1xuICAgICAgICBfLmRlbGF5KF8uYmluZChmdW5jdGlvbigpIHtcbiAgICAgICAgICB0aGlzLnNjb3JlR3JvdXAuYWRkKHRoaXMuc2NvcmVUZXh0KTtcbiAgICAgICAgfSwgdGhpcyksIDEwMDApO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHRoaXMuc2NvcmVUZXh0LnRleHQgPSB0aGlzLnNjb3JlLnRvTG9jYWxlU3RyaW5nKCk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIC8vIFJlc2V0IHNjb3JlXG4gICAgcmVzZXRTY29yZTogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnNjb3JlVXAgPSAwO1xuICAgICAgdGhpcy5zY29yZUNvbGxlY3QgPSAwO1xuICAgICAgdGhpcy5zY29yZSA9IDA7XG4gICAgfSxcblxuICAgIC8vIFJlc2V0IHZpZXcgdHJhY2tpbmdcbiAgICByZXNldFZpZXdUcmFja2luZzogZnVuY3Rpb24oKSB7XG4gICAgICAvLyBDYW1lcmEgYW5kIHBsYXRmb3JtIHRyYWNraW5nIHZhcnNcbiAgICAgIHRoaXMuY2FtZXJhWU1pbiA9IDk5OTk5OTk7XG4gICAgICB0aGlzLnBsYXRmb3JtWU1pbiA9IDk5OTk5OTk7XG4gICAgfSxcblxuICAgIC8vIEdlbmVyYWwgdG91Y2hpbmdcbiAgICBpc1RvdWNoaW5nOiBmdW5jdGlvbihib2R5KSB7XG4gICAgICBpZiAoYm9keSAmJiBib2R5LnRvdWNoKSB7XG4gICAgICAgIHJldHVybiAoYm9keS50b3VjaGluZy51cCB8fCBib2R5LnRvdWNoaW5nLmRvd24gfHxcbiAgICAgICAgICBib2R5LnRvdWNoaW5nLmxlZnQgfHwgYm9keS50b3VjaGluZy5yaWdodCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9LFxuXG4gICAgLy8gRGV0ZXJtaW5lIGRpZmZpY3VsdHlcbiAgICB1cGRhdGVEaWZmaWN1bHR5OiBmdW5jdGlvbigpIHtcbiAgICAgIC8vIEluaXRpYWwgc3RhdGVcbiAgICAgIHRoaXMucGxhdGZvcm1TcGFjZVkgPSAxMTA7XG4gICAgICB0aGlzLnBsYXRmb3JtR2FwTWF4ID0gMjAwO1xuICAgICAgdGhpcy5ob3ZlckNoYW5jZSA9IDAuMTtcbiAgICAgIHRoaXMubWluaUNoYW5jZSA9IDAuMztcbiAgICAgIHRoaXMuZGlsbENoYW5jZSA9IDAuMztcbiAgICAgIHRoaXMuYm90Q2hhbmNlID0gMDtcbiAgICAgIHRoaXMucGVwcGVyQ2hhbmNlID0gMC4xO1xuICAgICAgdGhpcy5jYXJyb3RDaGFuY2UgPSAwLjE7XG5cbiAgICAgIC8vIFNldCBpbml0aWFsIGJhY2tncm91bmRcbiAgICAgIHRoaXMuZ2FtZS5zdGFnZS5iYWNrZ3JvdW5kQ29sb3IgPSBcIiM5MzdENkZcIjtcblxuICAgICAgLy8gSW5pdGlsYSBwaHlzaWNzIHRpbWVcbiAgICAgIC8vdGhpcy5nYW1lLnRpbWUuc2xvd01vdGlvbiA9IDE7XG5cbiAgICAgIC8vIEZpcnN0IGxldmVsXG4gICAgICBpZiAoIXRoaXMuY2FtZXJhWU1pbiB8fCB0aGlzLmNhbWVyYVlNaW4gPiAtMjAwMDApIHtcbiAgICAgICAgLy8gRGVmYXVsdFxuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIFNlY29uZCBsZXZlbFxuICAgICAgZWxzZSBpZiAodGhpcy5jYW1lcmFZTWluID4gLTQwMDAwKSB7XG4gICAgICAgIHRoaXMuaG92ZXJDaGFuY2UgPSAwLjM7XG4gICAgICAgIHRoaXMubWluaUNoYW5jZSA9IDAuMztcbiAgICAgICAgdGhpcy5kaWxsQ2hhbmNlID0gMC40O1xuICAgICAgICB0aGlzLmJvdENoYW5jZSA9IDAuMjtcbiAgICAgICAgdGhpcy5jYXJyb3RDaGFuY2UgPSAwLjI7XG4gICAgICAgIHRoaXMuZ2FtZS5zdGFnZS5iYWNrZ3JvdW5kQ29sb3IgPSBcIiNCRERFQjZcIjtcbiAgICAgIH1cblxuICAgICAgLy8gVGhpcmQgbGV2ZWxcbiAgICAgIGVsc2UgaWYgKHRoaXMuY2FtZXJhWU1pbiA+IC02MDAwMCkge1xuICAgICAgICB0aGlzLmhvdmVyQ2hhbmNlID0gMC40O1xuICAgICAgICB0aGlzLm1pbmlDaGFuY2UgPSAwLjI7XG4gICAgICAgIHRoaXMuZGlsbENoYW5jZSA9IDAuNDtcbiAgICAgICAgdGhpcy5ib3RDaGFuY2UgPSAwLjM7XG4gICAgICAgIHRoaXMuY2Fycm90Q2hhbmNlID0gMC4zO1xuICAgICAgICB0aGlzLmdhbWUuc3RhZ2UuYmFja2dyb3VuZENvbG9yID0gXCIjQjFFMEVDXCI7XG4gICAgICB9XG5cbiAgICAgIC8vIEZvdXJ0aCBsZXZlbFxuICAgICAgZWxzZSB7XG4gICAgICAgIHRoaXMuYmdHcm91cC52aXNpYmxlID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5ob3ZlckNoYW5jZSA9IDAuNDtcbiAgICAgICAgdGhpcy5taW5pQ2hhbmNlID0gMC4yO1xuICAgICAgICB0aGlzLmRpbGxDaGFuY2UgPSAwLjQ7XG4gICAgICAgIHRoaXMuYm90Q2hhbmNlID0gMC4zO1xuICAgICAgICB0aGlzLmNhcnJvdENoYW5jZSA9IDAuNDtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLy8gQ3JlYXRlIHN1cGVyIGxldmVsIGdyYWRpZW50XG4gICAgY3JlYXRlU3VwZXJMZXZlbEJHOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2xiZ0JNID0gdGhpcy5nYW1lLm1ha2UuYml0bWFwRGF0YSh0aGlzLmdhbWUud2lkdGgsIHRoaXMuZ2FtZS5oZWlnaHQpO1xuXG4gICAgICAvLyBDcmVhdGUgZ3JhZGllbnRcbiAgICAgIHZhciBncmFkaWVudCA9IHRoaXMuc2xiZ0JNLmNvbnRleHQuY3JlYXRlTGluZWFyR3JhZGllbnQoXG4gICAgICAgIDAsIHRoaXMuZ2FtZS5oZWlnaHQgLyAyLCB0aGlzLmdhbWUud2lkdGgsIHRoaXMuZ2FtZS5oZWlnaHQgLyAyKTtcbiAgICAgIGdyYWRpZW50LmFkZENvbG9yU3RvcCgwLCBcIiM0RjNGOUFcIik7XG4gICAgICBncmFkaWVudC5hZGRDb2xvclN0b3AoMSwgXCIjRTcwQjhEXCIpO1xuXG4gICAgICAvLyBBZGQgdG8gYml0bWFwXG4gICAgICB0aGlzLnNsYmdCTS5jb250ZXh0LmZpbGxTdHlsZSA9IGdyYWRpZW50O1xuICAgICAgdGhpcy5zbGJnQk0uY29udGV4dC5maWxsUmVjdCgwLCAwLCB0aGlzLmdhbWUud2lkdGgsIHRoaXMuZ2FtZS5oZWlnaHQpO1xuXG4gICAgICAvLyBDcmVhdGUgYmFja2dyb3VuZCBncm91cCBzbyB0aGF0IHdlIGNhbiBwdXQgdGhpcyB0aGVyZSBsYXRlclxuICAgICAgdGhpcy5iZ0dyb3VwID0gdGhpcy5nYW1lLmFkZC5ncm91cCgpO1xuICAgICAgdGhpcy5iZ0dyb3VwLmZpeGVkVG9DYW1lcmEgPSB0cnVlO1xuXG4gICAgICAvLyBBZGQgY3JhenkgYmFja2dyb3VuZCBhbmQgdGhlbiBoaWRlIHNpbmNlIGFkZGluZyBpbiBtaWRkbGVcbiAgICAgIC8vIHJlYWxseSBtZXNzZXMgd2l0aCB0aGluZ3NcbiAgICAgIHRoaXMuYmdHcm91cC5jcmVhdGUoMCwgMCwgdGhpcy5zbGJnQk0pO1xuICAgICAgdGhpcy5iZ0dyb3VwLnZpc2libGUgPSBmYWxzZTtcbiAgICB9LFxuXG4gICAgLy8gU2V0IG9uIGZpcmVcbiAgICBzZXRPbkZpcmU6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5vbkZpcmUgPSB0cnVlO1xuICAgICAgdGhpcy5oZXJvLnNldE9uRmlyZSgpO1xuICAgIH0sXG5cbiAgICAvLyBTZXQgb2ZmIGZpcmVcbiAgICBwdXRPdXRGaXJlOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMub25GaXJlID0gZmFsc2U7XG4gICAgICB0aGlzLmhlcm8ucHV0T3V0RmlyZSgpO1xuICAgIH1cbiAgfSk7XG5cbiAgLy8gRXhwb3J0XG4gIG1vZHVsZS5leHBvcnRzID0gUGxheTtcbn0pKCk7XG4iXX0=
