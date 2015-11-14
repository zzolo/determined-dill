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
      var rx;
      var ry;

      // Do hover
      if (this.hover) {
        this.body.velocity.x = this.body.velocity.x || this.hoverSpeed;
        this.body.velocity.x = (this.x <= this.minX) ? this.hoverSpeed :
          (this.x >= this.maxX) ? -this.hoverSpeed : this.body.velocity.x;
      }

      // Shake
      if (this.shake) {
        rx = this.game.rnd.integerInRange(-4, 4);
        ry = this.game.rnd.integerInRange(-2, 2);
        this.position.x += rx;
        this.position.y += ry;
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

      if (this.body.velocity) {
        this.body.velocity.x = 0;
      }

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
    },

    // Shake
    shakeOn: function() {
      this.shake = true;
    },

    // Shake off
    shakeOff: function() {
      this.shake = false;
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
    doJumpUp: function(rate) {
      if (!this.onFire && !this.isDead) {
        return this.animations.play("jump-up", rate || 15, false);
      }
    },

    // Jump down
    doJumpDown: function(rate) {
      if (!this.onFire && !this.isDead) {
        return this.animations.play("jump-down", rate || 15, false);
      }
    },

    // Jump up and down
    doJump: function(rate) {
      if (!this.onFire && !this.isDead) {
        return this.animations.play("jump", rate || 15, false);
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

  // Dependencies
  var prefabs = {
    Botulism: require("./prefab-botulism.js"),
    Hero: require("./prefab-hero.js")
  };

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
      this.game.load.atlas("pickle-sprites", "assets/pickle-sprites.png", "assets/pickle-sprites.json");
      this.game.load.atlas("game-sprites", "assets/game-sprites.png", "assets/game-sprites.json");
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
      this.titleImage.scale.setTo((this.game.width - (this.padding * 6)) / this.titleImage.width);
      this.titleImage.reset(this.centerStageX(this.titleImage),
        this.centerStageY(this.titleImage) - this.padding * 8);
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

      // Make chase scene every few seconds
      //this.chase();
      this.chaseTimer = this.game.time.create(false);
      this.chaseTimer.loop(10000, this.chase, this);
      this.chaseTimer.start();
    },

    // Start playing
    go: function() {
      this.game.pickle.hideOverlay(".state-menu");

      // Kill any thing
      if (this.hero) {
        this.hero.kill();
        this.bot.kill();
      }

      this.game.time.events.remove(this.chaseTimer);
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
    },

    // Make chase scene
    // Tween to: function (properties, duration, ease, autoStart, delay, repeat, yoyo)
    chase: function() {
      var y = this.titleImage.x + (this.titleImage.height / 2) + this.padding * 4;

      // Add if needed
      if (!this.pickle || !this.pickle.alive) {
        this.hero = new prefabs.Hero(this.game, -1000, -1000);

        // Gravity gets started int he game
        this.hero.body.allowGravity = false;
        this.hero.body.immovable = true;

        this.game.add.existing(this.hero);
      }

      if (!this.bot || !this.bot.alive) {
        this.bot = new prefabs.Botulism(this.game, -1000, -1000);
        this.bot.hover = false;
        this.game.add.existing(this.bot);
      }

      // Reset placement
      this.hero.resetPlacement(-this.hero.width, y - this.padding * 6);
      this.bot.resetPlacement(this.game.width + this.padding * 6, y);

      // Make sure bot is not shaking
      this.bot.shakeOff();

      // Move pickle in
      this.game.add.tween(this.hero).to({ x: this.padding * 6, y: y }, 1000,
        Phaser.Easing.Quadratic.InOut, true, 0);

      this.hero.doJumpUp();
      this.game.time.events.add(400, function() {
        this.hero.doJumpDown();
      }, this);

      // Bring in bot
      this.game.add.tween(this.bot).to({ x: this.game.width - this.padding * 6 }, 1000,
        Phaser.Easing.Quadratic.InOut, true, 1500)
        .onComplete.addOnce(function() {
          // Shake it up
          this.game.time.events.add(300, function() {
            this.bot.shakeOn();
          }, this);

          // Chase pickle
          this.game.add.tween(this.bot).to({ x: this.bot.width * -4 }, 2000,
            Phaser.Easing.Exponential.In, true, 1000);

          // Pickle jump away
          this.game.add.tween(this.hero).to({ x: -this.hero.width, y: y - this.padding * 6 }, 500,
            Phaser.Easing.Quadratic.InOut, true, 2200);

          // Animate pickle
          this.game.time.events.add(2200, function() {
            this.hero.doJumpUp();
          }, this);
        }, this);
    }
  });

  // Export
  module.exports = Menu;
})();

},{"./prefab-botulism.js":3,"./prefab-hero.js":6}],12:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy96em9sby9Db2RlL3BlcnNvbmFsL2RldGVybWluZWQtZGlsbC9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL3p6b2xvL0NvZGUvcGVyc29uYWwvZGV0ZXJtaW5lZC1kaWxsL2pzL2Zha2VfMjU1MWY4NDkuanMiLCIvVXNlcnMvenpvbG8vQ29kZS9wZXJzb25hbC9kZXRlcm1pbmVkLWRpbGwvanMvcGlja2xlLWp1bXBlci9wcmVmYWItYmVhbi5qcyIsIi9Vc2Vycy96em9sby9Db2RlL3BlcnNvbmFsL2RldGVybWluZWQtZGlsbC9qcy9waWNrbGUtanVtcGVyL3ByZWZhYi1ib3R1bGlzbS5qcyIsIi9Vc2Vycy96em9sby9Db2RlL3BlcnNvbmFsL2RldGVybWluZWQtZGlsbC9qcy9waWNrbGUtanVtcGVyL3ByZWZhYi1jYXJyb3QuanMiLCIvVXNlcnMvenpvbG8vQ29kZS9wZXJzb25hbC9kZXRlcm1pbmVkLWRpbGwvanMvcGlja2xlLWp1bXBlci9wcmVmYWItZGlsbC5qcyIsIi9Vc2Vycy96em9sby9Db2RlL3BlcnNvbmFsL2RldGVybWluZWQtZGlsbC9qcy9waWNrbGUtanVtcGVyL3ByZWZhYi1oZXJvLmpzIiwiL1VzZXJzL3p6b2xvL0NvZGUvcGVyc29uYWwvZGV0ZXJtaW5lZC1kaWxsL2pzL3BpY2tsZS1qdW1wZXIvcHJlZmFiLWphci5qcyIsIi9Vc2Vycy96em9sby9Db2RlL3BlcnNvbmFsL2RldGVybWluZWQtZGlsbC9qcy9waWNrbGUtanVtcGVyL3ByZWZhYi1taW5pLmpzIiwiL1VzZXJzL3p6b2xvL0NvZGUvcGVyc29uYWwvZGV0ZXJtaW5lZC1kaWxsL2pzL3BpY2tsZS1qdW1wZXIvcHJlZmFiLXBlcHBlci5qcyIsIi9Vc2Vycy96em9sby9Db2RlL3BlcnNvbmFsL2RldGVybWluZWQtZGlsbC9qcy9waWNrbGUtanVtcGVyL3N0YXRlLWdhbWVvdmVyLmpzIiwiL1VzZXJzL3p6b2xvL0NvZGUvcGVyc29uYWwvZGV0ZXJtaW5lZC1kaWxsL2pzL3BpY2tsZS1qdW1wZXIvc3RhdGUtbWVudS5qcyIsIi9Vc2Vycy96em9sby9Db2RlL3BlcnNvbmFsL2RldGVybWluZWQtZGlsbC9qcy9waWNrbGUtanVtcGVyL3N0YXRlLXBsYXkuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdFdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckxBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKiBnbG9iYWwgXzpmYWxzZSwgJDpmYWxzZSwgUGhhc2VyOmZhbHNlLCBXZWJGb250OmZhbHNlICovXG5cbi8qKlxuICogTWFpbiBKUyBmb3IgUGlja2xlIEp1bXBlclxuICovXG5cbihmdW5jdGlvbigpIHtcbiAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgLy8gRGVwZW5kZW5jaWVzXG4gIHZhciBzdGF0ZXMgPSB7XG4gICAgR2FtZW92ZXI6IHJlcXVpcmUoXCIuL3BpY2tsZS1qdW1wZXIvc3RhdGUtZ2FtZW92ZXIuanNcIiksXG4gICAgUGxheTogcmVxdWlyZShcIi4vcGlja2xlLWp1bXBlci9zdGF0ZS1wbGF5LmpzXCIpLFxuICAgIE1lbnU6IHJlcXVpcmUoXCIuL3BpY2tsZS1qdW1wZXIvc3RhdGUtbWVudS5qc1wiKSxcbiAgfTtcblxuICAvLyBDb25zdHJ1Y3RvcmUgZm9yIFBpY2tsZVxuICB2YXIgUGlja2xlID0gd2luZG93LlBpY2tsZSA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuICAgIHRoaXMuZWwgPSB0aGlzLm9wdGlvbnMuZWw7XG4gICAgdGhpcy4kZWwgPSAkKHRoaXMub3B0aW9ucy5lbCk7XG4gICAgdGhpcy4kID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gJChvcHRpb25zLmVsKS5maW5kO1xuICAgIH07XG5cbiAgICB0aGlzLndpZHRoID0gdGhpcy4kZWwud2lkdGgoKTtcbiAgICB0aGlzLmhlaWdodCA9ICQod2luZG93KS5oZWlnaHQoKTtcblxuICAgIC8vIFN0YXJ0IChsb2FkIGZvbnRzIGZpcnN0KVxuICAgIHRoaXMuZm9udHMgPSBbXCJNYXJrZXRpbmdcIiwgXCJPbW5lc1JvbWFuXCIsIFwiT21uZXNSb21hbi1ib2xkXCIsIFwiT21uZXNSb21hbi05MDBcIl07XG4gICAgdGhpcy5mb250VXJscyA9IFtcImRpc3QvcGlja2xlLWp1bXBlci5jc3NcIl07XG4gICAgdGhpcy5sb2FkRm9udHModGhpcy5zdGFydCk7XG4gIH07XG5cbiAgLy8gQWRkIHByb3BlcnRpZXNcbiAgXy5leHRlbmQoUGlja2xlLnByb3RvdHlwZSwge1xuICAgIC8vIFN0YXJ0IGV2ZXJ5dGhpbmdcbiAgICBzdGFydDogZnVuY3Rpb24oKSB7XG4gICAgICAvLyBDcmVhdGUgUGhhc2VyIGdhbWVcbiAgICAgIHRoaXMuZ2FtZSA9IG5ldyBQaGFzZXIuR2FtZShcbiAgICAgICAgdGhpcy53aWR0aCxcbiAgICAgICAgdGhpcy5oZWlnaHQsXG4gICAgICAgIFBoYXNlci5BVVRPLFxuICAgICAgICB0aGlzLmVsLnJlcGxhY2UoXCIjXCIsIFwiXCIpKTtcblxuICAgICAgLy8gQWRkIHJlZmVyZW5jZSB0byBnYW1lLCBzaW5jZSBtb3N0IHBhcnRzIGhhdmUgdGhpcyByZWZlcmVuY2VcbiAgICAgIC8vIGFscmVhZHlcbiAgICAgIHRoaXMuZ2FtZS5waWNrbGUgPSB0aGlzO1xuXG4gICAgICAvLyBSZWdpc3RlciBzdGF0ZXNcbiAgICAgIHRoaXMuZ2FtZS5zdGF0ZS5hZGQoXCJtZW51XCIsIHN0YXRlcy5NZW51KTtcbiAgICAgIHRoaXMuZ2FtZS5zdGF0ZS5hZGQoXCJwbGF5XCIsIHN0YXRlcy5QbGF5KTtcbiAgICAgIHRoaXMuZ2FtZS5zdGF0ZS5hZGQoXCJnYW1lb3ZlclwiLCBzdGF0ZXMuR2FtZW92ZXIpO1xuXG4gICAgICAvLyBIaWdoc2NvcmVcbiAgICAgIHRoaXMuaGlnaHNjb3JlTGltaXQgPSB0aGlzLm9wdGlvbnMuaGlnaHNjb3JlTGltaXQgfHwgMTA7XG4gICAgICB0aGlzLmdldEhpZ2hzY29yZXMoKTtcblxuICAgICAgLy8gQWxsb3cgZm9yIHNjb3JlIHJlc2V0IHdpdGgga2V5Ym9hcmRcbiAgICAgIHRoaXMuaGFuZGxlUmVzZXQoKTtcblxuICAgICAgLy8gU3RhcnQgd2l0aCBtZW51XG4gICAgICB0aGlzLmdhbWUuc3RhdGUuc3RhcnQoXCJtZW51XCIpO1xuXG4gICAgICAvLyBEZWJ1Z1xuICAgICAgaWYgKHRoaXMub3B0aW9ucy5kZWJ1Zykge1xuICAgICAgICB0aGlzLnJlc2V0SGlnaHNjb3JlcygpO1xuICAgICAgICB0aGlzLmdldEhpZ2hzY29yZXMoKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLy8gTG9hZCBmb250cy4gIFVSTFMgaXMgcmVsYXRpdmUgdG8gSFRNTCwgbm90IEpTXG4gICAgbG9hZEZvbnRzOiBmdW5jdGlvbihkb25lKSB7XG4gICAgICBkb25lID0gXy5iaW5kKGRvbmUsIHRoaXMpO1xuXG4gICAgICBXZWJGb250LmxvYWQoe1xuICAgICAgICBjdXN0b206IHtcbiAgICAgICAgICBmYW1pbGllczogdGhpcy5mb250c1xuICAgICAgICB9LFxuICAgICAgICB1cmxzOiB0aGlzLmZvbnRVcmxzLFxuICAgICAgICBjbGFzc2VzOiBmYWxzZSxcbiAgICAgICAgYWN0aXZlOiBkb25lXG4gICAgICB9KTtcbiAgICB9LFxuXG4gICAgLy8gSGlkZSBvdmVybGF5IHBhcnRzXG4gICAgaGlkZU92ZXJsYXk6IGZ1bmN0aW9uKHNlbGVjdG9yKSB7XG4gICAgICAkKHRoaXMub3B0aW9ucy5wYXJlbnRFbCkuZmluZChzZWxlY3RvcikuaGlkZSgpO1xuICAgIH0sXG5cbiAgICAvLyBTaG93IG92ZXJsYXkgcGFydHNcbiAgICBzaG93T3ZlcmxheTogZnVuY3Rpb24oc2VsZWN0b3IsIHRpbWUpIHtcbiAgICAgIGlmICh0aW1lKSB7XG4gICAgICAgICQodGhpcy5vcHRpb25zLnBhcmVudEVsKS5maW5kKHNlbGVjdG9yKS5mYWRlSW4oXCJmYXN0XCIpLmRlbGF5KHRpbWUpLmZhZGVPdXQoXCJmYXN0XCIpO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgICQodGhpcy5vcHRpb25zLnBhcmVudEVsKS5maW5kKHNlbGVjdG9yKS5zaG93KCk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIC8vIEdldCBoaWdoIHNjb3Jlc1xuICAgIGdldEhpZ2hzY29yZXM6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHMgPSB3aW5kb3cubG9jYWxTdG9yYWdlLmdldEl0ZW0oXCJoaWdoc2NvcmVzXCIpO1xuICAgICAgcyA9IChzKSA/IEpTT04ucGFyc2UocykgOiBbXTtcbiAgICAgIHRoaXMuaGlnaHNjb3JlcyA9IHM7XG4gICAgICB0aGlzLnNvcnRIaWdoc2NvcmVzKCk7XG4gICAgICByZXR1cm4gdGhpcy5oaWdoc2NvcmVzO1xuICAgIH0sXG5cbiAgICAvLyBHZXQgaGlnaGVzdCBzY29yZVxuICAgIGdldEhpZ2hzY29yZTogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gXy5tYXgodGhpcy5oaWdoc2NvcmVzLCBcInNjb3JlXCIpO1xuICAgIH0sXG5cbiAgICAvLyBTZXQgc2luZ2xlIGhpZ2hzY29yZVxuICAgIHNldEhpZ2hzY29yZTogZnVuY3Rpb24oc2NvcmUsIG5hbWUpIHtcbiAgICAgIGlmICh0aGlzLmlzSGlnaHNjb3JlKHNjb3JlKSkge1xuICAgICAgICB0aGlzLnNvcnRIaWdoc2NvcmVzKCk7XG5cbiAgICAgICAgLy8gUmVtb3ZlIGxvd2VzdCBvbmUgaWYgbmVlZGVkXG4gICAgICAgIGlmICh0aGlzLmhpZ2hzY29yZXMubGVuZ3RoID49IHRoaXMuaGlnaHNjb3JlTGltaXQpIHtcbiAgICAgICAgICB0aGlzLmhpZ2hzY29yZXMuc2hpZnQoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEFkZCBuZXcgc2NvcmVcbiAgICAgICAgdGhpcy5oaWdoc2NvcmVzLnB1c2goe1xuICAgICAgICAgIG5hbWU6IG5hbWUsXG4gICAgICAgICAgc2NvcmU6IHNjb3JlXG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIFNvcnQgYW5kIHNldFxuICAgICAgICB0aGlzLnNvcnRIaWdoc2NvcmVzKCk7XG4gICAgICAgIHRoaXMuc2V0SGlnaHNjb3JlcygpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICAvLyBTb3J0IGhpZ2hzY29yZXNcbiAgICBzb3J0SGlnaHNjb3JlczogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLmhpZ2hzY29yZXMgPSBfLnNvcnRCeSh0aGlzLmhpZ2hzY29yZXMsIFwic2NvcmVcIik7XG4gICAgfSxcblxuICAgIC8vIElzIGhpZ2hzY29yZS4gIElzIHRoZSBzY29yZSBoaWdoZXIgdGhhbiB0aGUgbG93ZXN0XG4gICAgLy8gcmVjb3JkZWQgc2NvcmVcbiAgICBpc0hpZ2hzY29yZTogZnVuY3Rpb24oc2NvcmUpIHtcbiAgICAgIHZhciBtaW4gPSBfLm1pbih0aGlzLmhpZ2hzY29yZXMsIFwic2NvcmVcIikuc2NvcmU7XG4gICAgICByZXR1cm4gKHNjb3JlID4gbWluIHx8IHRoaXMuaGlnaHNjb3Jlcy5sZW5ndGggPCB0aGlzLmhpZ2hzY29yZUxpbWl0KTtcbiAgICB9LFxuXG4gICAgLy8gQ2hlY2sgaWYgc2NvcmUgaXMgaGlnaGVzdCBzY29yZVxuICAgIGlzSGlnaGVzdFNjb3JlOiBmdW5jdGlvbihzY29yZSkge1xuICAgICAgdmFyIG1heCA9IF8ubWF4KHRoaXMuaGlnaHNjb3JlcywgXCJzY29yZVwiKS5zY29yZSB8fCAwO1xuICAgICAgcmV0dXJuIChzY29yZSA+IG1heCk7XG4gICAgfSxcblxuICAgIC8vIFNldCBoaWdoc2NvcmVzXG4gICAgc2V0SGlnaHNjb3JlczogZnVuY3Rpb24oKSB7XG4gICAgICB3aW5kb3cubG9jYWxTdG9yYWdlLnNldEl0ZW0oXCJoaWdoc2NvcmVzXCIsIEpTT04uc3RyaW5naWZ5KHRoaXMuaGlnaHNjb3JlcykpO1xuICAgIH0sXG5cbiAgICAvLyBSZXNldCBoaWdoc2Nob3Jlc1xuICAgIHJlc2V0SGlnaHNjb3JlczogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLmhpZ2hzY29yZXMgPSBbXTtcbiAgICAgIHdpbmRvdy5sb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbShcImhpZ2hzY29yZXNcIik7XG4gICAgfSxcblxuICAgIC8vIEtleSBjb21ibyByZXNldFxuICAgIGhhbmRsZVJlc2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICQod2luZG93KS5vbihcImtleXVwXCIsIF8uYmluZChmdW5jdGlvbihlKSB7XG4gICAgICAgIC8vIEN0cmwgKyBKXG4gICAgICAgIGlmIChlLmN0cmxLZXkgJiYgKGUud2hpY2ggPT09IDc0KSkge1xuICAgICAgICAgIHRoaXMucmVzZXRIaWdoc2NvcmVzKCk7XG5cbiAgICAgICAgICAvLyBTaG93IG1lc3NhZ2VcbiAgICAgICAgICB0aGlzLnNob3dPdmVybGF5KFwiLmhpZ2gtcmVzZXRcIiwgMTAwMCk7XG4gICAgICAgIH1cbiAgICAgIH0sIHRoaXMpKTtcbiAgICB9XG4gIH0pO1xuXG4gIC8vIENyZWF0ZSBhcHBcbiAgJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKSB7XG4gICAgdmFyIHA7XG4gICAgcCA9IG5ldyBQaWNrbGUoe1xuICAgICAgZWw6IFwiI3BpY2tsZS1qdW1wZXJcIixcbiAgICAgIHBhcmVudEVsOiBcIi5nYW1lLXdyYXBwZXJcIixcbiAgICAgIGhpZ2hzY29yZUxpbWl0OiA0LFxuICAgICAgZGVidWc6IGZhbHNlXG4gICAgfSk7XG4gIH0pO1xufSkoKTtcbiIsIi8qIGdsb2JhbCBfOmZhbHNlLCBQaGFzZXI6ZmFsc2UgKi9cblxuLyoqXG4gKiBQcmVmYWIgYmVhbiBwbGF0Zm9ybVxuICovXG5cbihmdW5jdGlvbigpIHtcbiAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgLy8gQ29uc3RydWN0b3JcbiAgdmFyIEJlYW4gPSBmdW5jdGlvbihnYW1lLCB4LCB5KSB7XG4gICAgLy8gQ2FsbCBkZWZhdWx0IHNwcml0ZVxuICAgIFBoYXNlci5TcHJpdGUuY2FsbCh0aGlzLCBnYW1lLCB4LCB5LCBcImdhbWUtc3ByaXRlc1wiLCBcImRpbGx5YmVhbi5wbmdcIik7XG5cbiAgICAvLyBDb25maWd1cmVcbiAgICB0aGlzLmFuY2hvci5zZXRUbygwLjUsIDAuNSk7XG4gICAgdGhpcy5zY2FsZS5zZXRUbygodGhpcy5nYW1lLndpZHRoIC8gNSkgLyB0aGlzLndpZHRoKTtcbiAgICB0aGlzLmhvdmVyID0gZmFsc2U7XG4gICAgdGhpcy5zZXRIb3ZlclNwZWVkKDEwMCk7XG5cbiAgICAvLyBQaHlzaWNzXG4gICAgdGhpcy5nYW1lLnBoeXNpY3MuYXJjYWRlLmVuYWJsZUJvZHkodGhpcyk7XG4gICAgdGhpcy5ib2R5LmFsbG93R3Jhdml0eSA9IGZhbHNlO1xuICAgIHRoaXMuYm9keS5pbW1vdmFibGUgPSB0cnVlO1xuXG4gICAgLy8gT25seSBhbGxvdyBmb3IgY29sbGlzc2lvbiB1cFxuICAgIHRoaXMuYm9keS5jaGVja0NvbGxpc2lvbi51cCA9IHRydWU7XG4gICAgdGhpcy5ib2R5LmNoZWNrQ29sbGlzaW9uLmRvd24gPSBmYWxzZTtcbiAgICB0aGlzLmJvZHkuY2hlY2tDb2xsaXNpb24ubGVmdCA9IGZhbHNlO1xuICAgIHRoaXMuYm9keS5jaGVja0NvbGxpc2lvbi5yaWdodCA9IGZhbHNlO1xuXG4gICAgLy8gRGV0ZXJtaW5lIGFuY2hvciB4IGJvdW5kc1xuICAgIHRoaXMucGFkZGluZ1ggPSAxMDtcbiAgICB0aGlzLmdldEFuY2hvckJvdW5kc1goKTtcbiAgfTtcblxuICAvLyBFeHRlbmQgZnJvbSBTcHJpdGVcbiAgQmVhbi5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFBoYXNlci5TcHJpdGUucHJvdG90eXBlKTtcbiAgQmVhbi5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBCZWFuO1xuXG4gIC8vIEFkZCBtZXRob2RzXG4gIF8uZXh0ZW5kKEJlYW4ucHJvdG90eXBlLCB7XG4gICAgdXBkYXRlOiBmdW5jdGlvbigpIHtcbiAgICAgIGlmICh0aGlzLmhvdmVyKSB7XG4gICAgICAgIHRoaXMuYm9keS52ZWxvY2l0eS54ID0gdGhpcy5ib2R5LnZlbG9jaXR5LnggfHwgdGhpcy5ob3ZlclNwZWVkO1xuICAgICAgICB0aGlzLmJvZHkudmVsb2NpdHkueCA9ICh0aGlzLnggPD0gdGhpcy5taW5YKSA/IHRoaXMuaG92ZXJTcGVlZCA6XG4gICAgICAgICAgKHRoaXMueCA+PSB0aGlzLm1heFgpID8gLXRoaXMuaG92ZXJTcGVlZCA6IHRoaXMuYm9keS52ZWxvY2l0eS54O1xuICAgICAgfVxuICAgIH0sXG5cbiAgICAvLyBTZXQgaG92ZXIgc3BlZWQuICBBZGQgYSBiaXQgb2YgdmFyaWFuY2VcbiAgICBzZXRIb3ZlclNwZWVkOiBmdW5jdGlvbihzcGVlZCkge1xuICAgICAgdGhpcy5ob3ZlclNwZWVkID0gc3BlZWQgKyB0aGlzLmdhbWUucm5kLmludGVnZXJJblJhbmdlKC01MCwgNTApO1xuICAgIH0sXG5cbiAgICAvLyBHZXQgYW5jaG9yIGJvdW5kc1xuICAgIGdldEFuY2hvckJvdW5kc1g6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5taW5YID0gdGhpcy5wYWRkaW5nWCArICh0aGlzLndpZHRoIC8gMik7XG4gICAgICB0aGlzLm1heFggPSB0aGlzLmdhbWUud2lkdGggLSAodGhpcy5wYWRkaW5nWCArICh0aGlzLndpZHRoIC8gMikpO1xuICAgICAgcmV0dXJuIFt0aGlzLm1pblgsIHRoaXMubWF4WF07XG4gICAgfSxcblxuICAgIC8vIFJlc2V0IHRoaW5nc1xuICAgIHJlc2V0U2V0dGluZ3M6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5yZXNldCgwLCAwKTtcbiAgICAgIHRoaXMuYm9keS52ZWxvY2l0eS54ID0gMDtcbiAgICAgIHRoaXMuaG92ZXIgPSBmYWxzZTtcbiAgICAgIHRoaXMuZ2V0QW5jaG9yQm91bmRzWCgpO1xuICAgIH1cbiAgfSk7XG5cbiAgLy8gRXhwb3J0XG4gIG1vZHVsZS5leHBvcnRzID0gQmVhbjtcbn0pKCk7XG4iLCIvKiBnbG9iYWwgXzpmYWxzZSwgUGhhc2VyOmZhbHNlICovXG5cbi8qKlxuICogUHJlZmFiIGZvciBCb3R1bGlzbSwgdGhlIGJhZCBkdWRlc1xuICovXG5cbihmdW5jdGlvbigpIHtcbiAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgLy8gQ29uc3RydWN0b3JcbiAgdmFyIEJvdHVsaXNtID0gZnVuY3Rpb24oZ2FtZSwgeCwgeSkge1xuICAgIC8vIENhbGwgZGVmYXVsdCBzcHJpdGVcbiAgICBQaGFzZXIuU3ByaXRlLmNhbGwodGhpcywgZ2FtZSwgeCwgeSwgXCJnYW1lLXNwcml0ZXNcIiwgXCJib3RjaHkucG5nXCIpO1xuXG4gICAgLy8gU2l6ZVxuICAgIHRoaXMuYW5jaG9yLnNldFRvKDAuNSwgMC41KTtcbiAgICB0aGlzLnNjYWxlLnNldFRvKCh0aGlzLmdhbWUud2lkdGggLyAxMCkgLyB0aGlzLndpZHRoKTtcblxuICAgIC8vIENvbmZpZ3VyZVxuICAgIHRoaXMuaG92ZXIgPSB0cnVlO1xuICAgIHRoaXMuc2V0SG92ZXJTcGVlZCgxMDApO1xuICAgIHRoaXMuaG92ZXJSYW5nZSA9IDEwMDtcblxuICAgIC8vIFBoeXNpY3NcbiAgICB0aGlzLmdhbWUucGh5c2ljcy5hcmNhZGUuZW5hYmxlQm9keSh0aGlzKTtcbiAgICB0aGlzLmJvZHkuYWxsb3dHcmF2aXR5ID0gZmFsc2U7XG4gICAgdGhpcy5ib2R5LmltbW92YWJsZSA9IHRydWU7XG5cbiAgICAvLyBNYWtlIHRoZSBjb2xsaXNpb24gYm9keSBhIGJpdCBzbWFsbGVyXG4gICAgdmFyIGJvZHlTY2FsZSA9IDAuODtcbiAgICB0aGlzLmJvZHkuc2V0U2l6ZSh0aGlzLndpZHRoICogYm9keVNjYWxlLCB0aGlzLmhlaWdodCAqIGJvZHlTY2FsZSxcbiAgICAgICh0aGlzLndpZHRoIC0gKHRoaXMud2lkdGggKiBib2R5U2NhbGUpKSAvIDIsXG4gICAgICAodGhpcy5oZWlnaHQgLSAodGhpcy5oZWlnaHQgKiBib2R5U2NhbGUpKSAvIDIpO1xuXG4gICAgLy8gRGV0ZXJtaW5lIGFuY2hvciB4IGJvdW5kc1xuICAgIHRoaXMucGFkZGluZ1ggPSAxMDtcbiAgICB0aGlzLnJlc2V0UGxhY2VtZW50KHgsIHkpO1xuICB9O1xuXG4gIC8vIEV4dGVuZCBmcm9tIFNwcml0ZVxuICBCb3R1bGlzbS5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFBoYXNlci5TcHJpdGUucHJvdG90eXBlKTtcbiAgQm90dWxpc20ucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gQm90dWxpc207XG5cbiAgLy8gQWRkIG1ldGhvZHNcbiAgXy5leHRlbmQoQm90dWxpc20ucHJvdG90eXBlLCB7XG4gICAgdXBkYXRlOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciByeDtcbiAgICAgIHZhciByeTtcblxuICAgICAgLy8gRG8gaG92ZXJcbiAgICAgIGlmICh0aGlzLmhvdmVyKSB7XG4gICAgICAgIHRoaXMuYm9keS52ZWxvY2l0eS54ID0gdGhpcy5ib2R5LnZlbG9jaXR5LnggfHwgdGhpcy5ob3ZlclNwZWVkO1xuICAgICAgICB0aGlzLmJvZHkudmVsb2NpdHkueCA9ICh0aGlzLnggPD0gdGhpcy5taW5YKSA/IHRoaXMuaG92ZXJTcGVlZCA6XG4gICAgICAgICAgKHRoaXMueCA+PSB0aGlzLm1heFgpID8gLXRoaXMuaG92ZXJTcGVlZCA6IHRoaXMuYm9keS52ZWxvY2l0eS54O1xuICAgICAgfVxuXG4gICAgICAvLyBTaGFrZVxuICAgICAgaWYgKHRoaXMuc2hha2UpIHtcbiAgICAgICAgcnggPSB0aGlzLmdhbWUucm5kLmludGVnZXJJblJhbmdlKC00LCA0KTtcbiAgICAgICAgcnkgPSB0aGlzLmdhbWUucm5kLmludGVnZXJJblJhbmdlKC0yLCAyKTtcbiAgICAgICAgdGhpcy5wb3NpdGlvbi54ICs9IHJ4O1xuICAgICAgICB0aGlzLnBvc2l0aW9uLnkgKz0gcnk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIC8vIFNldCBob3ZlciBzcGVlZC4gIEFkZCBhIGJpdCBvZiB2YXJpYW5jZVxuICAgIHNldEhvdmVyU3BlZWQ6IGZ1bmN0aW9uKHNwZWVkKSB7XG4gICAgICB0aGlzLmhvdmVyU3BlZWQgPSBzcGVlZCArIHRoaXMuZ2FtZS5ybmQuaW50ZWdlckluUmFuZ2UoLTI1LCAyNSk7XG4gICAgfSxcblxuICAgIC8vIEdldCBhbmNob3IgYm91bmRzLiAgVGhpcyBpcyByZWxhdGl2ZSB0byB3aGVyZSB0aGUgcGxhdGZvcm0gaXNcbiAgICBnZXRBbmNob3JCb3VuZHNYOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMubWluWCA9IE1hdGgubWF4KHRoaXMueCAtIHRoaXMuaG92ZXJSYW5nZSwgdGhpcy5wYWRkaW5nWCArICh0aGlzLndpZHRoIC8gMikpO1xuICAgICAgdGhpcy5tYXhYID0gTWF0aC5taW4odGhpcy54ICsgdGhpcy5ob3ZlclJhbmdlLCB0aGlzLmdhbWUud2lkdGggLSAodGhpcy5wYWRkaW5nWCArICh0aGlzLndpZHRoIC8gMikpKTtcbiAgICAgIHJldHVybiBbdGhpcy5taW5YLCB0aGlzLm1heFhdO1xuICAgIH0sXG5cbiAgICAvLyBSZXNldCB0aGluZ3NcbiAgICByZXNldFBsYWNlbWVudDogZnVuY3Rpb24oeCwgeSkge1xuICAgICAgdGhpcy5yZXNldCh4LCB5KTtcblxuICAgICAgaWYgKHRoaXMuYm9keS52ZWxvY2l0eSkge1xuICAgICAgICB0aGlzLmJvZHkudmVsb2NpdHkueCA9IDA7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuZ2V0QW5jaG9yQm91bmRzWCgpO1xuICAgIH0sXG5cbiAgICAvLyBSZXNldCBpbWFnZVxuICAgIHJlc2V0SW1hZ2U6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5oZWlnaHQgPSB0aGlzLm9yaWdpbmFsSGVpZ2h0O1xuICAgICAgdGhpcy53aWR0aCA9IHRoaXMub3JpZ2luYWxXaWR0aDtcbiAgICAgIHRoaXMuYWxwaGEgPSAxO1xuICAgIH0sXG5cbiAgICAvLyBNdXJkZXJlZCAobm90IGp1c3Qga2lsbClcbiAgICBtdXJkZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgLy8gR2V0IG9yaWdpbmFsIGhlaWdodFxuICAgICAgdGhpcy5vcmlnaW5hbEhlaWdodCA9IHRoaXMuaGVpZ2h0O1xuICAgICAgdGhpcy5vcmlnaW5hbFdpZHRoID0gdGhpcy53aWR0aDtcblxuICAgICAgdmFyIHR3ZWVuID0gdGhpcy5nYW1lLmFkZC50d2Vlbih0aGlzKS50byh7XG4gICAgICAgIGhlaWdodDogMCxcbiAgICAgICAgd2lkdGg6IDAsXG4gICAgICAgIGFscGhhOiAwXG4gICAgICB9LCAyMDAsIFBoYXNlci5FYXNpbmcuTGluZWFyLk5vbmUsIHRydWUpO1xuXG4gICAgICB0d2Vlbi5vbkNvbXBsZXRlLmFkZChfLmJpbmQoZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMucmVzZXRJbWFnZSgpO1xuICAgICAgICB0aGlzLmtpbGwoKTtcbiAgICAgIH0sIHRoaXMpKTtcbiAgICB9LFxuXG4gICAgLy8gU2hha2VcbiAgICBzaGFrZU9uOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2hha2UgPSB0cnVlO1xuICAgIH0sXG5cbiAgICAvLyBTaGFrZSBvZmZcbiAgICBzaGFrZU9mZjogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnNoYWtlID0gZmFsc2U7XG4gICAgfVxuICB9KTtcblxuICAvLyBFeHBvcnRcbiAgbW9kdWxlLmV4cG9ydHMgPSBCb3R1bGlzbTtcbn0pKCk7XG4iLCIvKiBnbG9iYWwgXzpmYWxzZSwgUGhhc2VyOmZhbHNlICovXG5cbi8qKlxuICogUHJlZmFiIHBsYXRmb3JtXG4gKi9cblxuKGZ1bmN0aW9uKCkge1xuICBcInVzZSBzdHJpY3RcIjtcblxuICAvLyBDb25zdHJ1Y3RvclxuICB2YXIgQ2Fycm90ID0gZnVuY3Rpb24oZ2FtZSwgeCwgeSkge1xuICAgIC8vIENhbGwgZGVmYXVsdCBzcHJpdGVcbiAgICBQaGFzZXIuU3ByaXRlLmNhbGwodGhpcywgZ2FtZSwgeCwgeSwgXCJjYXJyb3Qtc3ByaXRlc1wiLCBcImNhcnJvdC1zbmFwLTAxLnBuZ1wiKTtcblxuICAgIC8vIENvbmZpZ3VyZVxuICAgIHRoaXMuYW5jaG9yLnNldFRvKDAuNSwgMC41KTtcbiAgICB0aGlzLnNjYWxlLnNldFRvKCh0aGlzLmdhbWUud2lkdGggLyA1KSAvIHRoaXMud2lkdGgpO1xuICAgIHRoaXMuaG92ZXIgPSBmYWxzZTtcbiAgICB0aGlzLnNldEhvdmVyU3BlZWQoMTAwKTtcblxuICAgIC8vIFBoeXNpY3NcbiAgICB0aGlzLmdhbWUucGh5c2ljcy5hcmNhZGUuZW5hYmxlQm9keSh0aGlzKTtcbiAgICB0aGlzLmJvZHkuYWxsb3dHcmF2aXR5ID0gZmFsc2U7XG4gICAgdGhpcy5ib2R5LmltbW92YWJsZSA9IHRydWU7XG5cbiAgICAvLyBPbmx5IGFsbG93IGZvciBjb2xsaXNzaW9uIHVwXG4gICAgdGhpcy5ib2R5LmNoZWNrQ29sbGlzaW9uLnVwID0gdHJ1ZTtcbiAgICB0aGlzLmJvZHkuY2hlY2tDb2xsaXNpb24uZG93biA9IGZhbHNlO1xuICAgIHRoaXMuYm9keS5jaGVja0NvbGxpc2lvbi5sZWZ0ID0gZmFsc2U7XG4gICAgdGhpcy5ib2R5LmNoZWNrQ29sbGlzaW9uLnJpZ2h0ID0gZmFsc2U7XG5cbiAgICAvLyBEZXRlcm1pbmUgYW5jaG9yIHggYm91bmRzXG4gICAgdGhpcy5wYWRkaW5nWCA9IDEwO1xuICAgIHRoaXMuZ2V0QW5jaG9yQm91bmRzWCgpO1xuXG4gICAgLy8gU2V0dXAgYW5pbWF0aW9uc1xuICAgIHZhciBzbmFwRnJhbWVzID0gUGhhc2VyLkFuaW1hdGlvbi5nZW5lcmF0ZUZyYW1lTmFtZXMoXCJjYXJyb3Qtc25hcC1cIiwgMSwgNSwgXCIucG5nXCIsIDIpO1xuICAgIHRoaXMuc25hcEFuaW1hdGlvbiA9IHRoaXMuYW5pbWF0aW9ucy5hZGQoXCJzbmFwXCIsIHNuYXBGcmFtZXMpO1xuICAgIHRoaXMuc25hcEFuaW1hdGlvbi5vbkNvbXBsZXRlLmFkZCh0aGlzLnNuYXBwZWQsIHRoaXMpO1xuICB9O1xuXG4gIC8vIEV4dGVuZCBmcm9tIFNwcml0ZVxuICBDYXJyb3QucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQaGFzZXIuU3ByaXRlLnByb3RvdHlwZSk7XG4gIENhcnJvdC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBDYXJyb3Q7XG5cbiAgLy8gQWRkIG1ldGhvZHNcbiAgXy5leHRlbmQoQ2Fycm90LnByb3RvdHlwZSwge1xuICAgIHVwZGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICBpZiAodGhpcy5ob3Zlcikge1xuICAgICAgICB0aGlzLmJvZHkudmVsb2NpdHkueCA9IHRoaXMuYm9keS52ZWxvY2l0eS54IHx8IHRoaXMuaG92ZXJTcGVlZDtcbiAgICAgICAgdGhpcy5ib2R5LnZlbG9jaXR5LnggPSAodGhpcy54IDw9IHRoaXMubWluWCkgPyB0aGlzLmhvdmVyU3BlZWQgOlxuICAgICAgICAgICh0aGlzLnggPj0gdGhpcy5tYXhYKSA/IC10aGlzLmhvdmVyU3BlZWQgOiB0aGlzLmJvZHkudmVsb2NpdHkueDtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLy8gU2V0IGhvdmVyIHNwZWVkLiAgQWRkIGEgYml0IG9mIHZhcmlhbmNlXG4gICAgc2V0SG92ZXJTcGVlZDogZnVuY3Rpb24oc3BlZWQpIHtcbiAgICAgIHRoaXMuaG92ZXJTcGVlZCA9IHNwZWVkICsgdGhpcy5nYW1lLnJuZC5pbnRlZ2VySW5SYW5nZSgtNTAsIDUwKTtcbiAgICB9LFxuXG4gICAgLy8gR2V0IGFuY2hvciBib3VuZHNcbiAgICBnZXRBbmNob3JCb3VuZHNYOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMubWluWCA9IHRoaXMucGFkZGluZ1ggKyAodGhpcy53aWR0aCAvIDIpO1xuICAgICAgdGhpcy5tYXhYID0gdGhpcy5nYW1lLndpZHRoIC0gKHRoaXMucGFkZGluZ1ggKyAodGhpcy53aWR0aCAvIDIpKTtcbiAgICAgIHJldHVybiBbdGhpcy5taW5YLCB0aGlzLm1heFhdO1xuICAgIH0sXG5cbiAgICAvLyBSZXNldCB0aGluZ3NcbiAgICByZXNldFNldHRpbmdzOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMucmVzZXRJbWFnZSgpO1xuICAgICAgdGhpcy5yZXNldCgwLCAwKTtcbiAgICAgIHRoaXMuYm9keS52ZWxvY2l0eS54ID0gMDtcbiAgICAgIHRoaXMuaG92ZXIgPSBmYWxzZTtcbiAgICAgIHRoaXMuZ2V0QW5jaG9yQm91bmRzWCgpO1xuICAgIH0sXG5cbiAgICAvLyBSZXNldCBpbWFnZVxuICAgIHJlc2V0SW1hZ2U6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5hbHBoYSA9IDE7XG4gICAgICB0aGlzLmxvYWRUZXh0dXJlKFwiY2Fycm90LXNwcml0ZXNcIiwgXCJjYXJyb3Qtc25hcC0wMS5wbmdcIik7XG4gICAgfSxcblxuICAgIC8vIFNuYXAgY2Fycm90XG4gICAgc25hcDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLmFuaW1hdGlvbnMucGxheShcInNuYXBcIiwgMTUsIGZhbHNlLCBmYWxzZSk7XG4gICAgfSxcblxuICAgIC8vIFNuYXBwZWRcbiAgICBzbmFwcGVkOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciB0d2VlbiA9IHRoaXMuZ2FtZS5hZGQudHdlZW4odGhpcykudG8oe1xuICAgICAgICBhbHBoYTogMFxuICAgICAgfSwgMjAwLCBQaGFzZXIuRWFzaW5nLkxpbmVhci5Ob25lLCB0cnVlKTtcbiAgICAgIHR3ZWVuLm9uQ29tcGxldGUuYWRkKF8uYmluZChmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5yZXNldEltYWdlKCk7XG4gICAgICAgIHRoaXMua2lsbCgpO1xuICAgICAgfSwgdGhpcykpO1xuICAgIH1cbiAgfSk7XG5cbiAgLy8gRXhwb3J0XG4gIG1vZHVsZS5leHBvcnRzID0gQ2Fycm90O1xufSkoKTtcbiIsIi8qIGdsb2JhbCBfOmZhbHNlLCBQaGFzZXI6ZmFsc2UgKi9cblxuLyoqXG4gKiBQcmVmYWIgKG9iamVjdHMpIERpbGwgZm9yIGJvb3N0aW5nXG4gKi9cblxuKGZ1bmN0aW9uKCkge1xuICBcInVzZSBzdHJpY3RcIjtcblxuICAvLyBDb25zdHJ1Y3RvclxuICB2YXIgRGlsbCA9IGZ1bmN0aW9uKGdhbWUsIHgsIHkpIHtcbiAgICAvLyBDYWxsIGRlZmF1bHQgc3ByaXRlXG4gICAgUGhhc2VyLlNwcml0ZS5jYWxsKHRoaXMsIGdhbWUsIHgsIHksIFwiZ2FtZS1zcHJpdGVzXCIsIFwiZGlsbC5wbmdcIik7XG5cbiAgICAvLyBTaXplXG4gICAgdGhpcy5hbmNob3Iuc2V0VG8oMC41LCAwLjUpO1xuICAgIHRoaXMuc2NhbGUuc2V0VG8oKHRoaXMuZ2FtZS53aWR0aCAvIDkpIC8gdGhpcy53aWR0aCk7XG5cbiAgICAvLyBQaHlzaWNzXG4gICAgdGhpcy5nYW1lLnBoeXNpY3MuYXJjYWRlLmVuYWJsZUJvZHkodGhpcyk7XG4gICAgdGhpcy5ib2R5LmFsbG93R3Jhdml0eSA9IGZhbHNlO1xuICAgIHRoaXMuYm9keS5pbW1vdmFibGUgPSB0cnVlO1xuICB9O1xuXG4gIC8vIEV4dGVuZCBmcm9tIFNwcml0ZVxuICBEaWxsLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUGhhc2VyLlNwcml0ZS5wcm90b3R5cGUpO1xuICBEaWxsLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IERpbGw7XG5cbiAgLy8gQWRkIG1ldGhvZHNcbiAgXy5leHRlbmQoRGlsbC5wcm90b3R5cGUsIHtcbiAgICB1cGRhdGU6IGZ1bmN0aW9uKCkge1xuXG4gICAgfVxuICB9KTtcblxuICAvLyBFeHBvcnRcbiAgbW9kdWxlLmV4cG9ydHMgPSBEaWxsO1xufSkoKTtcbiIsIi8qIGdsb2JhbCBfOmZhbHNlLCBQaGFzZXI6ZmFsc2UgKi9cblxuLyoqXG4gKiBQcmVmYWIgSGVyby9jaGFyYWN0ZXJcbiAqL1xuXG4oZnVuY3Rpb24oKSB7XG4gIFwidXNlIHN0cmljdFwiO1xuXG4gIC8vIENvbnN0cnVjdG9yXG4gIHZhciBIZXJvID0gZnVuY3Rpb24oZ2FtZSwgeCwgeSkge1xuICAgIC8vIENhbGwgZGVmYXVsdCBzcHJpdGVcbiAgICBQaGFzZXIuU3ByaXRlLmNhbGwodGhpcywgZ2FtZSwgeCwgeSwgXCJwaWNrbGUtc3ByaXRlc1wiLCBcInBpY2tsZS1qdW1wLTAyLnBuZ1wiKTtcblxuICAgIC8vIENvbmZpZ3VyZVxuICAgIHRoaXMuYW5jaG9yLnNldFRvKDAuNSk7XG4gICAgdGhpcy5vcmlnaW5hbFNjYWxlID0gKHRoaXMuZ2FtZS53aWR0aCAvIDIyKSAvIHRoaXMud2lkdGg7XG4gICAgdGhpcy5zY2FsZS5zZXRUbyh0aGlzLm9yaWdpbmFsU2NhbGUpO1xuICAgIHRoaXMuZ2FtZS5waHlzaWNzLmFyY2FkZS5lbmFibGVCb2R5KHRoaXMpO1xuICAgIHRoaXMuaXNEZWFkID0gZmFsc2U7XG5cbiAgICAvLyBUcmFjayB3aGVyZSB0aGUgaGVybyBzdGFydGVkIGFuZCBob3cgbXVjaCB0aGUgZGlzdGFuY2VcbiAgICAvLyBoYXMgY2hhbmdlZCBmcm9tIHRoYXQgcG9pbnRcbiAgICB0aGlzLnlPcmlnID0gdGhpcy55O1xuICAgIHRoaXMueUNoYW5nZSA9IDA7XG5cbiAgICAvLyBBbmltYXRpb25zXG4gICAgdmFyIHVwRnJhbWVzID0gUGhhc2VyLkFuaW1hdGlvbi5nZW5lcmF0ZUZyYW1lTmFtZXMoXCJwaWNrbGUtanVtcC1cIiwgMSwgNCwgXCIucG5nXCIsIDIpO1xuICAgIHZhciBkb3duRnJhbWVzID0gUGhhc2VyLkFuaW1hdGlvbi5nZW5lcmF0ZUZyYW1lTmFtZXMoXCJwaWNrbGUtanVtcC1cIiwgNCwgMSwgXCIucG5nXCIsIDIpO1xuICAgIHRoaXMuanVtcFVwID0gdGhpcy5hbmltYXRpb25zLmFkZChcImp1bXAtdXBcIiwgdXBGcmFtZXMpO1xuICAgIHRoaXMuSnVtcERvd24gPSB0aGlzLmFuaW1hdGlvbnMuYWRkKFwianVtcC1kb3duXCIsIGRvd25GcmFtZXMpO1xuICAgIHRoaXMuanVtcCA9IHRoaXMuYW5pbWF0aW9ucy5hZGQoXCJqdW1wXCIsIHVwRnJhbWVzLmNvbmNhdChkb3duRnJhbWVzKSk7XG4gIH07XG5cbiAgLy8gRXh0ZW5kIGZyb20gU3ByaXRlXG4gIEhlcm8ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQaGFzZXIuU3ByaXRlLnByb3RvdHlwZSk7XG4gIEhlcm8ucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gSGVybztcblxuICAvLyBBZGQgbWV0aG9kc1xuICBfLmV4dGVuZChIZXJvLnByb3RvdHlwZSwge1xuICAgIHVwZGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgcng7XG4gICAgICB2YXIgcnk7XG5cbiAgICAgIC8vIFRyYWNrIHRoZSBtYXhpbXVtIGFtb3VudCB0aGF0IHRoZSBoZXJvIGhhcyB0cmF2ZWxsZWRcbiAgICAgIHRoaXMueUNoYW5nZSA9IE1hdGgubWF4KHRoaXMueUNoYW5nZSwgTWF0aC5hYnModGhpcy55IC0gdGhpcy55T3JpZykpO1xuXG4gICAgICAvLyBXcmFwIGFyb3VuZCBlZGdlcyBsZWZ0L3RpZ2h0IGVkZ2VzXG4gICAgICB0aGlzLmdhbWUud29ybGQud3JhcCh0aGlzLCB0aGlzLndpZHRoIC8gMiwgZmFsc2UsIHRydWUsIGZhbHNlKTtcblxuICAgICAgLy8gV2hlbiBoZWFkaW5nIGRvd24sIGFuaW1hdGUgdG8gZG93blxuICAgICAgaWYgKHRoaXMuYm9keS52ZWxvY2l0eS55ID4gMCAmJiB0aGlzLmdvaW5nVXApIHtcbiAgICAgICAgdGhpcy5vbkZpcmUgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5nb2luZ1VwID0gZmFsc2U7XG4gICAgICAgIHRoaXMuZG9KdW1wRG93bigpO1xuICAgICAgfVxuXG4gICAgICAvLyBFbHNlIHdoZW4gaGVhZGluZyB1cCwgbm90ZVxuICAgICAgZWxzZSBpZiAodGhpcy5ib2R5LnZlbG9jaXR5LnkgPCAwICYmICF0aGlzLmdvaW5nVXApIHtcbiAgICAgICAgdGhpcy5nb2luZ1VwID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5kb0p1bXBVcCgpO1xuICAgICAgfVxuXG4gICAgICAvLyBTaGFrZSB3aGVuIG9uIGZpcmVcbiAgICAgIGlmICh0aGlzLm9uRmlyZSkge1xuICAgICAgICByeCA9IHRoaXMuZ2FtZS5ybmQuaW50ZWdlckluUmFuZ2UoLTQsIDQpO1xuICAgICAgICByeSA9IHRoaXMuZ2FtZS5ybmQuaW50ZWdlckluUmFuZ2UoLTIsIDIpO1xuICAgICAgICB0aGlzLnBvc2l0aW9uLnggKz0gcng7XG4gICAgICAgIHRoaXMucG9zaXRpb24ueSArPSByeTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLy8gUmVzZXQgcGxhY2VtZW50IGN1c3RvbVxuICAgIHJlc2V0UGxhY2VtZW50OiBmdW5jdGlvbih4LCB5KSB7XG4gICAgICB0aGlzLnJlc2V0KHgsIHkpO1xuICAgICAgdGhpcy55T3JpZyA9IHRoaXMueTtcbiAgICAgIHRoaXMueUNoYW5nZSA9IDA7XG4gICAgfSxcblxuICAgIC8vIEp1bXAgdXBcbiAgICBkb0p1bXBVcDogZnVuY3Rpb24ocmF0ZSkge1xuICAgICAgaWYgKCF0aGlzLm9uRmlyZSAmJiAhdGhpcy5pc0RlYWQpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYW5pbWF0aW9ucy5wbGF5KFwianVtcC11cFwiLCByYXRlIHx8IDE1LCBmYWxzZSk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIC8vIEp1bXAgZG93blxuICAgIGRvSnVtcERvd246IGZ1bmN0aW9uKHJhdGUpIHtcbiAgICAgIGlmICghdGhpcy5vbkZpcmUgJiYgIXRoaXMuaXNEZWFkKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmFuaW1hdGlvbnMucGxheShcImp1bXAtZG93blwiLCByYXRlIHx8IDE1LCBmYWxzZSk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIC8vIEp1bXAgdXAgYW5kIGRvd25cbiAgICBkb0p1bXA6IGZ1bmN0aW9uKHJhdGUpIHtcbiAgICAgIGlmICghdGhpcy5vbkZpcmUgJiYgIXRoaXMuaXNEZWFkKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmFuaW1hdGlvbnMucGxheShcImp1bXBcIiwgcmF0ZSB8fCAxNSwgZmFsc2UpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICAvLyBPbiBmaXJlXG4gICAgc2V0T25GaXJlOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMub25GaXJlID0gdHJ1ZTtcbiAgICAgIHRoaXMubG9hZFRleHR1cmUoXCJwaWNrbGUtc3ByaXRlc1wiLCBcInBpY2tsZS1yb2NrZXQucG5nXCIpO1xuICAgICAgdGhpcy5zY2FsZS5zZXRUbyh0aGlzLm9yaWdpbmFsU2NhbGUgKiAxLjUpO1xuICAgIH0sXG5cbiAgICAvLyBPZmYgZmlyZVxuICAgIHB1dE91dEZpcmU6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zY2FsZS5zZXRUbyh0aGlzLm9yaWdpbmFsU2NhbGUpO1xuICAgICAgdGhpcy5vbkZpcmUgPSBmYWxzZTtcbiAgICB9LFxuXG4gICAgLy8gTXVyZGVyIHdpdGggYm90Y2h5XG4gICAgYm90Y2h5TXVyZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuaXNEZWFkID0gdHJ1ZTtcbiAgICAgIHRoaXMubG9hZFRleHR1cmUoXCJwaWNrbGUtc3ByaXRlc1wiLCBcInBpY2tsZS1ib3RjaHkucG5nXCIpO1xuXG4gICAgICB2YXIgdHdlZW4gPSB0aGlzLmdhbWUuYWRkLnR3ZWVuKHRoaXMpLnRvKHtcbiAgICAgICAgYW5nbGU6IDE3NVxuICAgICAgfSwgNTAwLCBQaGFzZXIuRWFzaW5nLkxpbmVhci5Ob25lLCB0cnVlKTtcblxuICAgICAgdHdlZW4ub25Db21wbGV0ZS5hZGQoXy5iaW5kKGZ1bmN0aW9uKCkge1xuICAgICAgICAvLyBEbyBzb21ldGhpbmdcbiAgICAgIH0sIHRoaXMpKTtcbiAgICB9XG4gIH0pO1xuXG4gIC8vIEV4cG9ydFxuICBtb2R1bGUuZXhwb3J0cyA9IEhlcm87XG59KSgpO1xuIiwiLyogZ2xvYmFsIF86ZmFsc2UsIFBoYXNlcjpmYWxzZSAqL1xuXG4vKipcbiAqIFByZWZhYiBqYXIgcGxhdGZvcm1cbiAqL1xuXG4oZnVuY3Rpb24oKSB7XG4gIFwidXNlIHN0cmljdFwiO1xuXG4gIC8vIENvbnN0cnVjdG9yXG4gIHZhciBKYXIgPSBmdW5jdGlvbihnYW1lLCB4LCB5KSB7XG4gICAgLy8gQ2FsbCBkZWZhdWx0IHNwcml0ZVxuICAgIFBoYXNlci5TcHJpdGUuY2FsbCh0aGlzLCBnYW1lLCB4LCB5LCBcImdhbWUtc3ByaXRlc1wiLCBcImphci5wbmdcIik7XG5cbiAgICAvLyBDb25maWd1cmVcbiAgICB0aGlzLmFuY2hvci5zZXRUbygwLjUsIDAuNSk7XG4gICAgdGhpcy5zY2FsZS5zZXRUbygodGhpcy5nYW1lLndpZHRoIC8gMikgLyB0aGlzLndpZHRoKTtcblxuICAgIC8vIFBoeXNpY3NcbiAgICB0aGlzLmdhbWUucGh5c2ljcy5hcmNhZGUuZW5hYmxlQm9keSh0aGlzKTtcbiAgICB0aGlzLmJvZHkuYWxsb3dHcmF2aXR5ID0gZmFsc2U7XG4gICAgdGhpcy5ib2R5LmltbW92YWJsZSA9IHRydWU7XG4gIH07XG5cbiAgLy8gRXh0ZW5kIGZyb20gU3ByaXRlXG4gIEphci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFBoYXNlci5TcHJpdGUucHJvdG90eXBlKTtcbiAgSmFyLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEphcjtcblxuICAvLyBBZGQgbWV0aG9kc1xuICBfLmV4dGVuZChKYXIucHJvdG90eXBlLCB7XG4gICAgdXBkYXRlOiBmdW5jdGlvbigpIHtcbiAgICB9XG4gIH0pO1xuXG4gIC8vIEV4cG9ydFxuICBtb2R1bGUuZXhwb3J0cyA9IEphcjtcbn0pKCk7XG4iLCIvKiBnbG9iYWwgXzpmYWxzZSwgUGhhc2VyOmZhbHNlICovXG5cbi8qKlxuICogUHJlZmFiIG1pbmkgcGlja2xlIChraW5kIG9mIGxpa2UgYSBjb2luLCBqdXN0IHBvaW50cylcbiAqL1xuXG4oZnVuY3Rpb24oKSB7XG4gIFwidXNlIHN0cmljdFwiO1xuXG4gIC8vIENvbnN0cnVjdG9yXG4gIHZhciBNaW5pID0gZnVuY3Rpb24oZ2FtZSwgeCwgeSkge1xuICAgIC8vIENhbGwgZGVmYXVsdCBzcHJpdGVcbiAgICBQaGFzZXIuU3ByaXRlLmNhbGwodGhpcywgZ2FtZSwgeCwgeSwgXCJnYW1lLXNwcml0ZXNcIiwgXCJtYWdpY2RpbGwucG5nXCIpO1xuXG4gICAgLy8gQ29uZmlndXJlXG4gICAgdGhpcy5hbmNob3Iuc2V0VG8oMC41LCAwLjUpO1xuICAgIHRoaXMuc2NhbGUuc2V0VG8oKHRoaXMuZ2FtZS53aWR0aCAvIDIwKSAvIHRoaXMud2lkdGgpO1xuXG4gICAgLy8gUGh5c2ljc1xuICAgIHRoaXMuZ2FtZS5waHlzaWNzLmFyY2FkZS5lbmFibGVCb2R5KHRoaXMpO1xuICAgIHRoaXMuYm9keS5hbGxvd0dyYXZpdHkgPSBmYWxzZTtcbiAgICB0aGlzLmJvZHkuaW1tb3ZhYmxlID0gdHJ1ZTtcbiAgfTtcblxuICAvLyBFeHRlbmQgZnJvbSBTcHJpdGVcbiAgTWluaS5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFBoYXNlci5TcHJpdGUucHJvdG90eXBlKTtcbiAgTWluaS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBNaW5pO1xuXG4gIC8vIEFkZCBtZXRob2RzXG4gIF8uZXh0ZW5kKE1pbmkucHJvdG90eXBlLCB7XG4gICAgdXBkYXRlOiBmdW5jdGlvbigpIHtcblxuICAgIH1cbiAgfSk7XG5cbiAgLy8gRXhwb3J0XG4gIG1vZHVsZS5leHBvcnRzID0gTWluaTtcbn0pKCk7XG4iLCIvKiBnbG9iYWwgXzpmYWxzZSwgUGhhc2VyOmZhbHNlICovXG5cbi8qKlxuICogUHJlZmFiIChvYmplY3RzKSBib29zdCBmb3IgcGVwcGVyXG4gKi9cblxuKGZ1bmN0aW9uKCkge1xuICBcInVzZSBzdHJpY3RcIjtcblxuICAvLyBDb25zdHJ1Y3RvciBmb3IgQm9vc3RcbiAgdmFyIFBlcHBlciA9IGZ1bmN0aW9uKGdhbWUsIHgsIHkpIHtcbiAgICAvLyBDYWxsIGRlZmF1bHQgc3ByaXRlXG4gICAgUGhhc2VyLlNwcml0ZS5jYWxsKHRoaXMsIGdhbWUsIHgsIHksIFwiZ2FtZS1zcHJpdGVzXCIsIFwiZ2hvc3QtcGVwcGVyLnBuZ1wiKTtcblxuICAgIC8vIFNpemVcbiAgICB0aGlzLmFuY2hvci5zZXRUbygwLjUsIDAuNSk7XG4gICAgdGhpcy5zY2FsZS5zZXRUbygodGhpcy5nYW1lLndpZHRoIC8gMTgpIC8gdGhpcy53aWR0aCk7XG5cbiAgICAvLyBQaHlzaWNzXG4gICAgdGhpcy5nYW1lLnBoeXNpY3MuYXJjYWRlLmVuYWJsZUJvZHkodGhpcyk7XG4gICAgdGhpcy5ib2R5LmFsbG93R3Jhdml0eSA9IGZhbHNlO1xuICAgIHRoaXMuYm9keS5pbW1vdmFibGUgPSB0cnVlO1xuICB9O1xuXG4gIC8vIEV4dGVuZCBmcm9tIFNwcml0ZVxuICBQZXBwZXIucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQaGFzZXIuU3ByaXRlLnByb3RvdHlwZSk7XG4gIFBlcHBlci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBQZXBwZXI7XG5cbiAgLy8gQWRkIG1ldGhvZHNcbiAgXy5leHRlbmQoUGVwcGVyLnByb3RvdHlwZSwge1xuICAgIHVwZGF0ZTogZnVuY3Rpb24oKSB7XG5cbiAgICB9XG4gIH0pO1xuXG4gIC8vIEV4cG9ydFxuICBtb2R1bGUuZXhwb3J0cyA9IFBlcHBlcjtcbn0pKCk7XG4iLCIvKiBnbG9iYWwgXzpmYWxzZSwgUGhhc2VyOmZhbHNlICovXG5cbi8qKlxuICogR2FtZW92ZXIgc3RhdGVcbiAqL1xuXG4oZnVuY3Rpb24oKSB7XG4gIFwidXNlIHN0cmljdFwiO1xuXG4gIC8vIENvbnN0cnVjdG9yXG4gIHZhciBHYW1lb3ZlciA9IGZ1bmN0aW9uKCkge1xuICAgIFBoYXNlci5TdGF0ZS5jYWxsKHRoaXMpO1xuICB9O1xuXG4gIC8vIEV4dGVuZCBmcm9tIFN0YXRlXG4gIEdhbWVvdmVyLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUGhhc2VyLlN0YXRlLnByb3RvdHlwZSk7XG4gIEdhbWVvdmVyLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEdhbWVvdmVyO1xuXG4gIC8vIEFkZCBtZXRob2RzXG4gIF8uZXh0ZW5kKEdhbWVvdmVyLnByb3RvdHlwZSwgUGhhc2VyLlN0YXRlLnByb3RvdHlwZSwge1xuICAgIC8vIFByZWxvYWRcbiAgICBwcmVsb2FkOiBmdW5jdGlvbigpIHtcbiAgICAgIC8vIExvYWQgdXAgZ2FtZSBpbWFnZXNcbiAgICAgIHRoaXMuZ2FtZS5sb2FkLmF0bGFzKFwiZ2FtZW92ZXItc3ByaXRlc1wiLCBcImFzc2V0cy9nYW1lb3Zlci1zcHJpdGVzLnBuZ1wiLCBcImFzc2V0cy9nYW1lb3Zlci1zcHJpdGVzLmpzb25cIik7XG4gICAgfSxcblxuICAgIC8vIENyZWF0ZVxuICAgIGNyZWF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAvLyBTZXQgYmFja2dyb3VuZFxuICAgICAgdGhpcy5nYW1lLnN0YWdlLmJhY2tncm91bmRDb2xvciA9IFwiIzhjYzYzZlwiO1xuXG4gICAgICAvLyBNYWtlIHBhZGRpbmcgZGVwZW5kZW50IG9uIHdpZHRoXG4gICAgICB0aGlzLnBhZGRpbmcgPSB0aGlzLmdhbWUud2lkdGggLyA1MDtcblxuICAgICAgLy8gUGxhY2UgdGl0bGVcbiAgICAgIHRoaXMudGl0bGVJbWFnZSA9IHRoaXMuZ2FtZS5hZGQuc3ByaXRlKDAsIDAsIFwiZ2FtZW92ZXItc3ByaXRlc1wiLCBcImdhbWVvdmVyLnBuZ1wiKTtcbiAgICAgIHRoaXMudGl0bGVJbWFnZS5hbmNob3Iuc2V0VG8oMC41LCAwKTtcbiAgICAgIHRoaXMudGl0bGVJbWFnZS5zY2FsZS5zZXRUbygodGhpcy5nYW1lLndpZHRoIC0gKHRoaXMucGFkZGluZyAqIDE2KSkgLyB0aGlzLnRpdGxlSW1hZ2Uud2lkdGgpO1xuICAgICAgdGhpcy50aXRsZUltYWdlLnJlc2V0KHRoaXMuY2VudGVyU3RhZ2VYKHRoaXMudGl0bGVJbWFnZSksIHRoaXMucGFkZGluZyAqIDIpO1xuICAgICAgdGhpcy5nYW1lLmFkZC5leGlzdGluZyh0aGlzLnRpdGxlSW1hZ2UpO1xuXG4gICAgICAvLyBIaWdoc2NvcmUgbGlzdC4gIENhbid0IHNlZW0gdG8gZmluZCBhIHdheSB0byBwYXNzIHRoZSBzY29yZVxuICAgICAgLy8gdmlhIGEgc3RhdGUgY2hhbmdlLlxuICAgICAgdGhpcy5zY29yZSA9IHRoaXMuZ2FtZS5waWNrbGUuc2NvcmU7XG5cbiAgICAgIC8vIFNob3cgc2NvcmVcbiAgICAgIHRoaXMuc2hvd1Njb3JlKCk7XG5cbiAgICAgIC8vIFNob3cgaW5wdXQgaWYgbmV3IGhpZ2hzY29yZSwgb3RoZXJ3aXNlIHNob3cgbGlzdFxuICAgICAgaWYgKHRoaXMuZ2FtZS5waWNrbGUuaXNIaWdoc2NvcmUodGhpcy5zY29yZSkpIHtcbiAgICAgICAgdGhpcy5oaWdoc2NvcmVJbnB1dCgpO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHRoaXMuaGlnaHNjb3JlTGlzdCgpO1xuICAgICAgfVxuXG4gICAgICAvLyBQbGFjZSByZS1wbGF5XG4gICAgICB0aGlzLnJlcGxheUltYWdlID0gdGhpcy5nYW1lLmFkZC5zcHJpdGUodGhpcy5nYW1lLndpZHRoIC0gdGhpcy5wYWRkaW5nICogMixcbiAgICAgICAgdGhpcy5nYW1lLmhlaWdodCAtIHRoaXMucGFkZGluZyAqIDIsIFwiZ2FtZW92ZXItc3ByaXRlc1wiLCBcInRpdGxlLXBsYXkucG5nXCIpO1xuICAgICAgdGhpcy5yZXBsYXlJbWFnZS5hbmNob3Iuc2V0VG8oMSwgMSk7XG4gICAgICB0aGlzLnJlcGxheUltYWdlLnNjYWxlLnNldFRvKCh0aGlzLmdhbWUud2lkdGggKiAwLjI1KSAvIHRoaXMucmVwbGF5SW1hZ2Uud2lkdGgpO1xuICAgICAgdGhpcy5nYW1lLmFkZC5leGlzdGluZyh0aGlzLnJlcGxheUltYWdlKTtcblxuICAgICAgLy8gQWRkIGhvdmVyIGZvciBtb3VzZVxuICAgICAgdGhpcy5yZXBsYXlJbWFnZS5pbnB1dEVuYWJsZWQgPSB0cnVlO1xuICAgICAgdGhpcy5yZXBsYXlJbWFnZS5ldmVudHMub25JbnB1dE92ZXIuYWRkKGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLnJlcGxheUltYWdlLm9yaWdpbmFsVGludCA9IHRoaXMucmVwbGF5SW1hZ2UudGludDtcbiAgICAgICAgdGhpcy5yZXBsYXlJbWFnZS50aW50ID0gMC41ICogMHhGRkZGRkY7XG4gICAgICB9LCB0aGlzKTtcblxuICAgICAgdGhpcy5yZXBsYXlJbWFnZS5ldmVudHMub25JbnB1dE91dC5hZGQoZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMucmVwbGF5SW1hZ2UudGludCA9IHRoaXMucmVwbGF5SW1hZ2Uub3JpZ2luYWxUaW50O1xuICAgICAgfSwgdGhpcyk7XG5cbiAgICAgIC8vIEFkZCBpbnRlcmFjdGlvbnMgZm9yIHN0YXJ0aW5nXG4gICAgICB0aGlzLnJlcGxheUltYWdlLmV2ZW50cy5vbklucHV0RG93bi5hZGQodGhpcy5yZXBsYXksIHRoaXMpO1xuXG4gICAgICAvLyBJbnB1dFxuICAgICAgdGhpcy5sZWZ0QnV0dG9uID0gdGhpcy5nYW1lLmlucHV0LmtleWJvYXJkLmFkZEtleShQaGFzZXIuS2V5Ym9hcmQuTEVGVCk7XG4gICAgICB0aGlzLnJpZ2h0QnV0dG9uID0gdGhpcy5nYW1lLmlucHV0LmtleWJvYXJkLmFkZEtleShQaGFzZXIuS2V5Ym9hcmQuUklHSFQpO1xuICAgICAgdGhpcy51cEJ1dHRvbiA9IHRoaXMuZ2FtZS5pbnB1dC5rZXlib2FyZC5hZGRLZXkoUGhhc2VyLktleWJvYXJkLlVQKTtcbiAgICAgIHRoaXMuZG93bkJ1dHRvbiA9IHRoaXMuZ2FtZS5pbnB1dC5rZXlib2FyZC5hZGRLZXkoUGhhc2VyLktleWJvYXJkLkRPV04pO1xuICAgICAgdGhpcy5hY3Rpb25CdXR0b24gPSB0aGlzLmdhbWUuaW5wdXQua2V5Ym9hcmQuYWRkS2V5KFBoYXNlci5LZXlib2FyZC5TUEFDRUJBUik7XG5cbiAgICAgIHRoaXMubGVmdEJ1dHRvbi5vbkRvd24uYWRkKGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAodGhpcy5oSW5wdXQpIHtcbiAgICAgICAgICB0aGlzLm1vdmVDdXJzb3IoLTEpO1xuICAgICAgICB9XG4gICAgICB9LCB0aGlzKTtcblxuICAgICAgdGhpcy5yaWdodEJ1dHRvbi5vbkRvd24uYWRkKGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAodGhpcy5oSW5wdXQpIHtcbiAgICAgICAgICB0aGlzLm1vdmVDdXJzb3IoMSk7XG4gICAgICAgIH1cbiAgICAgIH0sIHRoaXMpO1xuXG4gICAgICB0aGlzLnVwQnV0dG9uLm9uRG93bi5hZGQoZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICh0aGlzLmhJbnB1dCkge1xuICAgICAgICAgIHRoaXMubW92ZUxldHRlcigxKTtcbiAgICAgICAgfVxuICAgICAgfSwgdGhpcyk7XG5cbiAgICAgIHRoaXMuZG93bkJ1dHRvbi5vbkRvd24uYWRkKGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAodGhpcy5oSW5wdXQpIHtcbiAgICAgICAgICB0aGlzLm1vdmVMZXR0ZXIoLTEpO1xuICAgICAgICB9XG4gICAgICB9LCB0aGlzKTtcblxuICAgICAgdGhpcy5hY3Rpb25CdXR0b24ub25Eb3duLmFkZChmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHNhdmVkO1xuXG4gICAgICAgIGlmICh0aGlzLmhJbnB1dCkge1xuICAgICAgICAgIHNhdmVkID0gdGhpcy5zYXZlSGlnaHNjb3JlKCk7XG4gICAgICAgICAgaWYgKHNhdmVkKSB7XG4gICAgICAgICAgICB0aGlzLmhpZ2hzY29yZUxpc3QoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgdGhpcy5yZXBsYXkoKTtcbiAgICAgICAgfVxuICAgICAgfSwgdGhpcyk7XG4gICAgfSxcblxuICAgIC8vIFVwZGF0ZVxuICAgIHVwZGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgfSxcblxuICAgIC8vIFNodXRkb3duLCBjbGVhbiB1cCBvbiBzdGF0ZSBjaGFuZ2VcbiAgICBzaHV0ZG93bjogZnVuY3Rpb24oKSB7XG4gICAgICBbXCJ0aXRsZVRleHRcIiwgXCJyZXBsYXlUZXh0XCJdLmZvckVhY2goXy5iaW5kKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgaWYgKHRoaXNbaXRlbV0gJiYgdGhpc1tpdGVtXS5kZXN0cm95KSB7XG4gICAgICAgICAgdGhpc1tpdGVtXS5kZXN0cm95KCk7XG4gICAgICAgICAgdGhpc1tpdGVtXSA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgIH0sIHRoaXMpKTtcbiAgICB9LFxuXG4gICAgLy8gSGFuZGxlIHJlcGxheVxuICAgIHJlcGxheTogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLmdhbWUuc3RhdGUuc3RhcnQoXCJtZW51XCIpO1xuICAgIH0sXG5cbiAgICAvLyBTaG93IGhpZ2hzY29yZVxuICAgIHNob3dTY29yZTogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnNjb3JlR3JvdXAgPSB0aGlzLmdhbWUuYWRkLmdyb3VwKCk7XG5cbiAgICAgIC8vIFBsYWNlIGxhYmVsXG4gICAgICB0aGlzLnlvdXJTY29yZUltYWdlID0gbmV3IFBoYXNlci5TcHJpdGUodGhpcy5nYW1lLCAwLCAwLCBcImdhbWVvdmVyLXNwcml0ZXNcIiwgXCJ5b3VyLXNjb3JlLnBuZ1wiKTtcbiAgICAgIHRoaXMueW91clNjb3JlSW1hZ2UuYW5jaG9yLnNldFRvKDAuNSwgMCk7XG4gICAgICB0aGlzLnlvdXJTY29yZUltYWdlLnNjYWxlLnNldFRvKCgodGhpcy5nYW1lLndpZHRoICogMC41KSAtICh0aGlzLnBhZGRpbmcgKiA2KSkgLyB0aGlzLnlvdXJTY29yZUltYWdlLndpZHRoKTtcbiAgICAgIHRoaXMueW91clNjb3JlSW1hZ2UucmVzZXQodGhpcy5jZW50ZXJTdGFnZVgodGhpcy55b3VyU2NvcmVJbWFnZSksXG4gICAgICAgIHRoaXMudGl0bGVJbWFnZS5oZWlnaHQgKyAodGhpcy5wYWRkaW5nICogOCkpO1xuXG4gICAgICAvLyBTY29yZVxuICAgICAgdGhpcy5zY29yZVRleHQgPSBuZXcgUGhhc2VyLlRleHQodGhpcy5nYW1lLCAwLCAwLFxuICAgICAgICB0aGlzLnNjb3JlLnRvTG9jYWxlU3RyaW5nKCksIHtcbiAgICAgICAgICBmb250OiBcIlwiICsgKHRoaXMuZ2FtZS53b3JsZC5oZWlnaHQgLyAxMCkgKyBcInB4IE9tbmVzUm9tYW4tOTAwXCIsXG4gICAgICAgICAgZmlsbDogXCIjMzliNTRhXCIsXG4gICAgICAgICAgYWxpZ246IFwiY2VudGVyXCIsXG4gICAgICAgIH0pO1xuICAgICAgdGhpcy5zY29yZVRleHQuYW5jaG9yLnNldFRvKDAuNSwgMCk7XG4gICAgICB0aGlzLnNjb3JlVGV4dC5yZXNldCh0aGlzLmNlbnRlclN0YWdlWCh0aGlzLnNjb3JlVGV4dCksXG4gICAgICAgIHRoaXMudGl0bGVJbWFnZS5oZWlnaHQgKyB0aGlzLnlvdXJTY29yZUltYWdlLmhlaWdodCArICh0aGlzLnBhZGRpbmcgKiA3KSk7XG5cbiAgICAgIC8vIEFkZCBncm91cHNcbiAgICAgIF8uZGVsYXkoXy5iaW5kKGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLnNjb3JlR3JvdXAuYWRkKHRoaXMueW91clNjb3JlSW1hZ2UpO1xuICAgICAgICB0aGlzLnNjb3JlR3JvdXAuYWRkKHRoaXMuc2NvcmVUZXh0KTtcbiAgICAgIH0sIHRoaXMpLCAxMDAwKTtcbiAgICB9LFxuXG4gICAgLy8gTWFrZSBoaWdoZXN0IHNjb3JlIGlucHV0XG4gICAgaGlnaHNjb3JlSW5wdXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5oSW5wdXQgPSB0cnVlO1xuICAgICAgdGhpcy5oSW5wdXRJbmRleCA9IDA7XG4gICAgICB0aGlzLmhJbnB1dHMgPSB0aGlzLmdhbWUuYWRkLmdyb3VwKCk7XG4gICAgICB2YXIgeSA9IHRoaXMuZ2FtZS53b3JsZC5oZWlnaHQgKiAwLjc7XG5cbiAgICAgIC8vIEZpcnN0IGlucHV0XG4gICAgICB2YXIgb25lID0gbmV3IFBoYXNlci5UZXh0KFxuICAgICAgICB0aGlzLmdhbWUsXG4gICAgICAgIHRoaXMuZ2FtZS53b3JsZC53aWR0aCAqIDAuMzMzMzMsXG4gICAgICAgIHksXG4gICAgICAgIFwiQVwiLCB7XG4gICAgICAgICAgZm9udDogXCJcIiArICh0aGlzLmdhbWUud29ybGQuaGVpZ2h0IC8gMTUpICsgXCJweCBPbW5lc1JvbWFuLWJvbGRcIixcbiAgICAgICAgICBmaWxsOiBcIiNGRkZGRkZcIixcbiAgICAgICAgICBhbGlnbjogXCJjZW50ZXJcIixcbiAgICAgICAgfSk7XG4gICAgICBvbmUuYW5jaG9yLnNldCgwLjUpO1xuICAgICAgdGhpcy5oSW5wdXRzLmFkZChvbmUpO1xuXG4gICAgICAvLyBTZWNvbmQgaW5wdXRcbiAgICAgIHZhciBzZWNvbmQgPSBuZXcgUGhhc2VyLlRleHQoXG4gICAgICAgIHRoaXMuZ2FtZSxcbiAgICAgICAgdGhpcy5nYW1lLndvcmxkLndpZHRoICogMC41LFxuICAgICAgICB5LFxuICAgICAgICBcIkFcIiwge1xuICAgICAgICAgIGZvbnQ6IFwiXCIgKyAodGhpcy5nYW1lLndvcmxkLmhlaWdodCAvIDE1KSArIFwicHggT21uZXNSb21hbi1ib2xkXCIsXG4gICAgICAgICAgZmlsbDogXCIjRkZGRkZGXCIsXG4gICAgICAgICAgYWxpZ246IFwiY2VudGVyXCIsXG4gICAgICAgIH0pO1xuICAgICAgc2Vjb25kLmFuY2hvci5zZXQoMC41KTtcbiAgICAgIHRoaXMuaElucHV0cy5hZGQoc2Vjb25kKTtcblxuICAgICAgLy8gU2Vjb25kIGlucHV0XG4gICAgICB2YXIgdGhpcmQgPSBuZXcgUGhhc2VyLlRleHQoXG4gICAgICAgIHRoaXMuZ2FtZSxcbiAgICAgICAgdGhpcy5nYW1lLndvcmxkLndpZHRoICogMC42NjY2NixcbiAgICAgICAgeSxcbiAgICAgICAgXCJBXCIsIHtcbiAgICAgICAgICBmb250OiBcIlwiICsgKHRoaXMuZ2FtZS53b3JsZC5oZWlnaHQgLyAxNSkgKyBcInB4IE9tbmVzUm9tYW4tYm9sZFwiLFxuICAgICAgICAgIGZpbGw6IFwiI0ZGRkZGRlwiLFxuICAgICAgICAgIGFsaWduOiBcImNlbnRlclwiLFxuICAgICAgICB9KTtcbiAgICAgIHRoaXJkLmFuY2hvci5zZXQoMC41KTtcbiAgICAgIHRoaXMuaElucHV0cy5hZGQodGhpcmQpO1xuXG4gICAgICAvLyBDdXJzb3JcbiAgICAgIHRoaXMuaEN1cnNvciA9IHRoaXMuZ2FtZS5hZGQudGV4dChcbiAgICAgICAgb25lLngsXG4gICAgICAgIG9uZS55IC0gKHRoaXMuZ2FtZS53b3JsZC5oZWlnaHQgLyAyMCksXG4gICAgICAgIFwiX1wiLCB7XG4gICAgICAgICAgZm9udDogXCJib2xkIFwiICsgKHRoaXMuZ2FtZS53b3JsZC5oZWlnaHQgLyA1KSArIFwicHggQXJpYWxcIixcbiAgICAgICAgICBmaWxsOiBcIiNGRkZGRkZcIixcbiAgICAgICAgICBhbGlnbjogXCJjZW50ZXJcIixcbiAgICAgICAgfSk7XG4gICAgICB0aGlzLmhDdXJzb3IuYW5jaG9yLnNldCgwLjUpO1xuXG4gICAgICAvLyBIYW5kbGUgaW5pdGFsIGN1cnNvclxuICAgICAgdGhpcy5tb3ZlQ3Vyc29yKDApO1xuICAgIH0sXG5cbiAgICAvLyBNb3ZlIGN1cnNvclxuICAgIG1vdmVDdXJzb3I6IGZ1bmN0aW9uKGFtb3VudCkge1xuICAgICAgdmFyIG5ld0luZGV4ID0gdGhpcy5oSW5wdXRJbmRleCArIGFtb3VudDtcbiAgICAgIHRoaXMuaElucHV0SW5kZXggPSAobmV3SW5kZXggPCAwKSA/IHRoaXMuaElucHV0cy5sZW5ndGggLSAxIDpcbiAgICAgICAgKG5ld0luZGV4ID49IHRoaXMuaElucHV0cy5sZW5ndGgpID8gMCA6IG5ld0luZGV4O1xuICAgICAgdmFyIGkgPSB0aGlzLmhJbnB1dHMuZ2V0Q2hpbGRBdCh0aGlzLmhJbnB1dEluZGV4KTtcblxuICAgICAgLy8gTW92ZSBjdXJzb3JcbiAgICAgIHRoaXMuaEN1cnNvci54ID0gaS54O1xuICAgICAgdGhpcy5oSW5wdXRzLmZvckVhY2goZnVuY3Rpb24oaW5wdXQpIHtcbiAgICAgICAgaW5wdXQuZmlsbCA9IFwiI0ZGRkZGRlwiO1xuICAgICAgfSk7XG5cbiAgICAgIGkuZmlsbCA9IFwiI0ZGRERCQlwiO1xuXG4gICAgICAvLyBUT0RPOiBIaWdobGlnaHQgaW5wdXQuXG4gICAgfSxcblxuICAgIC8vIE1vdmUgbGV0dGVyXG4gICAgbW92ZUxldHRlcjogZnVuY3Rpb24oYW1vdW50KSB7XG4gICAgICB2YXIgaSA9IHRoaXMuaElucHV0cy5nZXRDaGlsZEF0KHRoaXMuaElucHV0SW5kZXgpO1xuICAgICAgdmFyIHQgPSBpLnRleHQ7XG4gICAgICB2YXIgbiA9ICh0ID09PSBcIkFcIiAmJiBhbW91bnQgPT09IC0xKSA/IFwiWlwiIDpcbiAgICAgICAgKHQgPT09IFwiWlwiICYmIGFtb3VudCA9PT0gMSkgPyBcIkFcIiA6XG4gICAgICAgIFN0cmluZy5mcm9tQ2hhckNvZGUodC5jaGFyQ29kZUF0KDApICsgYW1vdW50KTtcblxuICAgICAgaS50ZXh0ID0gbjtcbiAgICB9LFxuXG4gICAgLy8gU2F2ZSBoaWdoc2NvcmVcbiAgICBzYXZlSGlnaHNjb3JlOiBmdW5jdGlvbigpIHtcbiAgICAgIC8vIEdldCBuYW1lXG4gICAgICB2YXIgbmFtZSA9IFwiXCI7XG4gICAgICB0aGlzLmhJbnB1dHMuZm9yRWFjaChmdW5jdGlvbihpbnB1dCkge1xuICAgICAgICBuYW1lID0gbmFtZSArIGlucHV0LnRleHQ7XG4gICAgICB9KTtcblxuICAgICAgLy8gRG9uJ3QgYWxsb3cgQUFBXG4gICAgICBpZiAobmFtZSA9PT0gXCJBQUFcIikge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIC8vIFNhdmUgaGlnaHNjb3JlXG4gICAgICB0aGlzLmdhbWUucGlja2xlLnNldEhpZ2hzY29yZSh0aGlzLnNjb3JlLCBuYW1lKTtcblxuICAgICAgLy8gUmVtb3ZlIGlucHV0XG4gICAgICB0aGlzLmhJbnB1dCA9IGZhbHNlO1xuICAgICAgdGhpcy5oSW5wdXRzLmRlc3Ryb3koKTtcbiAgICAgIHRoaXMuaEN1cnNvci5kZXN0cm95KCk7XG5cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0sXG5cbiAgICAvLyBIaWdoc2NvcmUgbGlzdFxuICAgIGhpZ2hzY29yZUxpc3Q6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5oaWdoc2NvcmVMaW1pdCA9IHRoaXMuZ2FtZS5waWNrbGUuaGlnaHNjb3JlTGltaXQgfHwgMztcbiAgICAgIHRoaXMuaGlnaHNjb3JlTGlzdEdyb3VwID0gdGhpcy5nYW1lLmFkZC5ncm91cCgpO1xuICAgICAgdGhpcy5nYW1lLnBpY2tsZS5zb3J0SGlnaHNjb3JlcygpO1xuICAgICAgdmFyIGZvbnRTaXplID0gdGhpcy5nYW1lLndvcmxkLmhlaWdodCAvIDI1O1xuICAgICAgdmFyIGJhc2VZID0gdGhpcy50aXRsZUltYWdlLmhlaWdodCArIHRoaXMueW91clNjb3JlSW1hZ2UuaGVpZ2h0ICtcbiAgICAgICAgdGhpcy5zY29yZVRleHQuaGVpZ2h0ICsgdGhpcy5wYWRkaW5nICogMTA7XG4gICAgICB2YXIgeE9mZnNldCA9IC10aGlzLnBhZGRpbmcgKiAyO1xuXG4gICAgICAvLyBBZGQgbGFiZWxcbiAgICAgIHRoaXMuaGlnaHNjb3JlTGlzdExhYmVsID0gbmV3IFBoYXNlci5UZXh0KHRoaXMuZ2FtZSwgMCwgMCxcbiAgICAgICAgXCJIaWdoIFNjb3Jlc1wiLCB7XG4gICAgICAgICAgZm9udDogXCJcIiArICh0aGlzLmdhbWUud29ybGQuaGVpZ2h0IC8gMTcuNSkgKyBcInB4IE9tbmVzUm9tYW4tYm9sZFwiLFxuICAgICAgICAgIGZpbGw6IFwiI2I4ZjRiY1wiLFxuICAgICAgICAgIGFsaWduOiBcInJpZ2h0XCIsXG4gICAgICAgIH0pO1xuICAgICAgdGhpcy5oaWdoc2NvcmVMaXN0TGFiZWwuYW5jaG9yLnNldFRvKDAuNSwgMCk7XG4gICAgICB0aGlzLmhpZ2hzY29yZUxpc3RMYWJlbC5yZXNldCh0aGlzLmNlbnRlclN0YWdlWCh0aGlzLmhpZ2hzY29yZUxpc3RMYWJlbCksIGJhc2VZKTtcbiAgICAgIHRoaXMuaGlnaHNjb3JlTGlzdEdyb3VwLmFkZCh0aGlzLmhpZ2hzY29yZUxpc3RMYWJlbCk7XG5cbiAgICAgIC8vIE5ldyBiYXNlIGhlaWdodFxuICAgICAgYmFzZVkgPSBiYXNlWSArIHRoaXMuaGlnaHNjb3JlTGlzdExhYmVsLmhlaWdodCArIHRoaXMucGFkZGluZyAqIDAuMjU7XG5cbiAgICAgIC8vIEFkZCBoaWdoIHNjb3Jlc1xuICAgICAgaWYgKHRoaXMuZ2FtZS5waWNrbGUuaGlnaHNjb3Jlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgIF8uZWFjaCh0aGlzLmdhbWUucGlja2xlLmhpZ2hzY29yZXMucmV2ZXJzZSgpLnNsaWNlKDAsIHRoaXMuaGlnaHNjb3JlTGltaXQpLFxuICAgICAgICAgIF8uYmluZChmdW5jdGlvbihoLCBpKSB7XG4gICAgICAgICAgLy8gTmFtZVxuICAgICAgICAgIHZhciBuYW1lID0gbmV3IFBoYXNlci5UZXh0KFxuICAgICAgICAgICAgdGhpcy5nYW1lLFxuICAgICAgICAgICAgdGhpcy5nYW1lLndpZHRoIC8gMiAtIHRoaXMucGFkZGluZyArIHhPZmZzZXQsXG4gICAgICAgICAgICBiYXNlWSArICgoZm9udFNpemUgKyB0aGlzLnBhZGRpbmcgLyAyKSAqIGkpLFxuICAgICAgICAgICAgaC5uYW1lLCB7XG4gICAgICAgICAgICAgIGZvbnQ6IFwiXCIgKyBmb250U2l6ZSArIFwicHggT21uZXNSb21hblwiLFxuICAgICAgICAgICAgICBmaWxsOiBcIiNiOGY0YmNcIixcbiAgICAgICAgICAgICAgYWxpZ246IFwicmlnaHRcIixcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIG5hbWUuYW5jaG9yLnNldFRvKDEsIDApO1xuXG4gICAgICAgICAgLy8gU2NvcmVcbiAgICAgICAgICB2YXIgc2NvcmUgPSBuZXcgUGhhc2VyLlRleHQoXG4gICAgICAgICAgICB0aGlzLmdhbWUsXG4gICAgICAgICAgICB0aGlzLmdhbWUud2lkdGggLyAyICsgdGhpcy5wYWRkaW5nICsgeE9mZnNldCxcbiAgICAgICAgICAgIGJhc2VZICsgKChmb250U2l6ZSArIHRoaXMucGFkZGluZyAvIDIpICogaSksXG4gICAgICAgICAgICBoLnNjb3JlLnRvTG9jYWxlU3RyaW5nKCksIHtcbiAgICAgICAgICAgICAgZm9udDogXCJcIiArIGZvbnRTaXplICsgXCJweCBPbW5lc1JvbWFuXCIsXG4gICAgICAgICAgICAgIGZpbGw6IFwiI2I4ZjRiY1wiLFxuICAgICAgICAgICAgICBhbGlnbjogXCJsZWZ0XCIsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICBzY29yZS5hbmNob3Iuc2V0VG8oMCwgMCk7XG5cbiAgICAgICAgICAvLyBBZGQgdG8gZ3JvdXBzXG4gICAgICAgICAgdGhpcy5oaWdoc2NvcmVMaXN0R3JvdXAuYWRkKG5hbWUpO1xuICAgICAgICAgIHRoaXMuaGlnaHNjb3JlTGlzdEdyb3VwLmFkZChzY29yZSk7XG4gICAgICAgIH0sIHRoaXMpKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLy8gQ2VudGVyIHggb24gc3RhZ2VcbiAgICBjZW50ZXJTdGFnZVg6IGZ1bmN0aW9uKG9iaikge1xuICAgICAgcmV0dXJuICgodGhpcy5nYW1lLndpZHRoIC0gb2JqLndpZHRoKSAvIDIpICsgKG9iai53aWR0aCAvIDIpO1xuICAgIH0sXG5cbiAgICAvLyBDZW50ZXIgeCBvbiBzdGFnZVxuICAgIGNlbnRlclN0YWdlWTogZnVuY3Rpb24ob2JqKSB7XG4gICAgICByZXR1cm4gKCh0aGlzLmdhbWUuaGVpZ2h0IC0gb2JqLmhlaWdodCkgLyAyKSArIChvYmouaGVpZ2h0IC8gMik7XG4gICAgfVxuICB9KTtcblxuICAvLyBFeHBvcnRcbiAgbW9kdWxlLmV4cG9ydHMgPSBHYW1lb3Zlcjtcbn0pKCk7XG4iLCIvKiBnbG9iYWwgXzpmYWxzZSwgUGhhc2VyOmZhbHNlICovXG5cbi8qKlxuICogTWVudSBzdGF0ZVxuICovXG5cbihmdW5jdGlvbigpIHtcbiAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgLy8gRGVwZW5kZW5jaWVzXG4gIHZhciBwcmVmYWJzID0ge1xuICAgIEJvdHVsaXNtOiByZXF1aXJlKFwiLi9wcmVmYWItYm90dWxpc20uanNcIiksXG4gICAgSGVybzogcmVxdWlyZShcIi4vcHJlZmFiLWhlcm8uanNcIilcbiAgfTtcblxuICAvLyBDb25zdHJ1Y3RvclxuICB2YXIgTWVudSA9IGZ1bmN0aW9uKCkge1xuICAgIFBoYXNlci5TdGF0ZS5jYWxsKHRoaXMpO1xuICB9O1xuXG4gIC8vIEV4dGVuZCBmcm9tIFN0YXRlXG4gIE1lbnUucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQaGFzZXIuU3RhdGUucHJvdG90eXBlKTtcbiAgTWVudS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBNZW51O1xuXG4gIC8vIEFkZCBtZXRob2RzXG4gIF8uZXh0ZW5kKE1lbnUucHJvdG90eXBlLCBQaGFzZXIuU3RhdGUucHJvdG90eXBlLCB7XG4gICAgLy8gUHJlbG9hZFxuICAgIHByZWxvYWQ6IGZ1bmN0aW9uKCkge1xuICAgICAgLy8gTG9hZCB1cCBnYW1lIGltYWdlc1xuICAgICAgdGhpcy5nYW1lLmxvYWQuYXRsYXMoXCJ0aXRsZS1zcHJpdGVzXCIsIFwiYXNzZXRzL3RpdGxlLXNwcml0ZXMucG5nXCIsIFwiYXNzZXRzL3RpdGxlLXNwcml0ZXMuanNvblwiKTtcbiAgICAgIHRoaXMuZ2FtZS5sb2FkLmF0bGFzKFwicGlja2xlLXNwcml0ZXNcIiwgXCJhc3NldHMvcGlja2xlLXNwcml0ZXMucG5nXCIsIFwiYXNzZXRzL3BpY2tsZS1zcHJpdGVzLmpzb25cIik7XG4gICAgICB0aGlzLmdhbWUubG9hZC5hdGxhcyhcImdhbWUtc3ByaXRlc1wiLCBcImFzc2V0cy9nYW1lLXNwcml0ZXMucG5nXCIsIFwiYXNzZXRzL2dhbWUtc3ByaXRlcy5qc29uXCIpO1xuICAgIH0sXG5cbiAgICAvLyBDcmVhdGVcbiAgICBjcmVhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgLy8gU2V0IGJhY2tncm91bmRcbiAgICAgIHRoaXMuZ2FtZS5zdGFnZS5iYWNrZ3JvdW5kQ29sb3IgPSBcIiNiOGY0YmNcIjtcblxuICAgICAgLy8gTWFrZSBwYWRkaW5nIGRlcGVuZGVudCBvbiB3aWR0aFxuICAgICAgdGhpcy5wYWRkaW5nID0gdGhpcy5nYW1lLndpZHRoIC8gNTA7XG5cbiAgICAgIC8vIFBsYWNlIHRpdGxlXG4gICAgICB0aGlzLnRpdGxlSW1hZ2UgPSB0aGlzLmdhbWUuYWRkLnNwcml0ZSgwLCAwLCBcInRpdGxlLXNwcml0ZXNcIiwgXCJ0aXRsZS5wbmdcIik7XG4gICAgICB0aGlzLnRpdGxlSW1hZ2UuYW5jaG9yLnNldFRvKDAuNSwgMC41KTtcbiAgICAgIHRoaXMudGl0bGVJbWFnZS5zY2FsZS5zZXRUbygodGhpcy5nYW1lLndpZHRoIC0gKHRoaXMucGFkZGluZyAqIDYpKSAvIHRoaXMudGl0bGVJbWFnZS53aWR0aCk7XG4gICAgICB0aGlzLnRpdGxlSW1hZ2UucmVzZXQodGhpcy5jZW50ZXJTdGFnZVgodGhpcy50aXRsZUltYWdlKSxcbiAgICAgICAgdGhpcy5jZW50ZXJTdGFnZVkodGhpcy50aXRsZUltYWdlKSAtIHRoaXMucGFkZGluZyAqIDgpO1xuICAgICAgdGhpcy5nYW1lLmFkZC5leGlzdGluZyh0aGlzLnRpdGxlSW1hZ2UpO1xuXG4gICAgICAvLyBQbGFjZSBwbGF5XG4gICAgICB0aGlzLnBsYXlJbWFnZSA9IHRoaXMuZ2FtZS5hZGQuc3ByaXRlKDAsIDAsIFwidGl0bGUtc3ByaXRlc1wiLCBcInRpdGxlLXBsYXkucG5nXCIpO1xuICAgICAgdGhpcy5wbGF5SW1hZ2UuYW5jaG9yLnNldFRvKDAuNCwgMSk7XG4gICAgICB0aGlzLnBsYXlJbWFnZS5zY2FsZS5zZXRUbygodGhpcy5nYW1lLndpZHRoICogMC41KSAvIHRoaXMudGl0bGVJbWFnZS53aWR0aCk7XG4gICAgICB0aGlzLnBsYXlJbWFnZS5yZXNldCh0aGlzLmNlbnRlclN0YWdlWCh0aGlzLnBsYXlJbWFnZSksIHRoaXMuZ2FtZS5oZWlnaHQgLSB0aGlzLnBhZGRpbmcgKiAyKTtcbiAgICAgIHRoaXMuZ2FtZS5hZGQuZXhpc3RpbmcodGhpcy5wbGF5SW1hZ2UpO1xuXG4gICAgICAvLyBBZGQgaG92ZXIgZm9yIG1vdXNlXG4gICAgICB0aGlzLnBsYXlJbWFnZS5pbnB1dEVuYWJsZWQgPSB0cnVlO1xuICAgICAgdGhpcy5wbGF5SW1hZ2UuZXZlbnRzLm9uSW5wdXRPdmVyLmFkZChmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5wbGF5SW1hZ2Uub3JpZ2luYWxUaW50ID0gdGhpcy5wbGF5SW1hZ2UudGludDtcbiAgICAgICAgdGhpcy5wbGF5SW1hZ2UudGludCA9IDAuNSAqIDB4RkZGRkZGO1xuICAgICAgfSwgdGhpcyk7XG5cbiAgICAgIHRoaXMucGxheUltYWdlLmV2ZW50cy5vbklucHV0T3V0LmFkZChmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5wbGF5SW1hZ2UudGludCA9IHRoaXMucGxheUltYWdlLm9yaWdpbmFsVGludDtcbiAgICAgIH0sIHRoaXMpO1xuXG4gICAgICAvLyBBZGQgbW91c2UgaW50ZXJhY3Rpb25cbiAgICAgIHRoaXMucGxheUltYWdlLmV2ZW50cy5vbklucHV0RG93bi5hZGQodGhpcy5nbywgdGhpcyk7XG5cbiAgICAgIC8vIEFkZCBrZXlib2FyZCBpbnRlcmFjdGlvblxuICAgICAgdGhpcy5hY3Rpb25CdXR0b24gPSB0aGlzLmdhbWUuaW5wdXQua2V5Ym9hcmQuYWRkS2V5KFBoYXNlci5LZXlib2FyZC5TUEFDRUJBUik7XG4gICAgICB0aGlzLmFjdGlvbkJ1dHRvbi5vbkRvd24uYWRkKGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLmdvKCk7XG4gICAgICB9LCB0aGlzKTtcblxuICAgICAgLy8gU2hvdyBhbnkgb3ZlcmxheXNcbiAgICAgIHRoaXMuZ2FtZS5waWNrbGUuc2hvd092ZXJsYXkoXCIuc3RhdGUtbWVudVwiKTtcblxuICAgICAgLy8gTWFrZSBjaGFzZSBzY2VuZSBldmVyeSBmZXcgc2Vjb25kc1xuICAgICAgLy90aGlzLmNoYXNlKCk7XG4gICAgICB0aGlzLmNoYXNlVGltZXIgPSB0aGlzLmdhbWUudGltZS5jcmVhdGUoZmFsc2UpO1xuICAgICAgdGhpcy5jaGFzZVRpbWVyLmxvb3AoMTAwMDAsIHRoaXMuY2hhc2UsIHRoaXMpO1xuICAgICAgdGhpcy5jaGFzZVRpbWVyLnN0YXJ0KCk7XG4gICAgfSxcblxuICAgIC8vIFN0YXJ0IHBsYXlpbmdcbiAgICBnbzogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLmdhbWUucGlja2xlLmhpZGVPdmVybGF5KFwiLnN0YXRlLW1lbnVcIik7XG5cbiAgICAgIC8vIEtpbGwgYW55IHRoaW5nXG4gICAgICBpZiAodGhpcy5oZXJvKSB7XG4gICAgICAgIHRoaXMuaGVyby5raWxsKCk7XG4gICAgICAgIHRoaXMuYm90LmtpbGwoKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5nYW1lLnRpbWUuZXZlbnRzLnJlbW92ZSh0aGlzLmNoYXNlVGltZXIpO1xuICAgICAgdGhpcy5nYW1lLnN0YXRlLnN0YXJ0KFwicGxheVwiKTtcbiAgICB9LFxuXG4gICAgLy8gVXBkYXRlXG4gICAgdXBkYXRlOiBmdW5jdGlvbigpIHtcbiAgICB9LFxuXG4gICAgLy8gQ2VudGVyIHggb24gc3RhZ2VcbiAgICBjZW50ZXJTdGFnZVg6IGZ1bmN0aW9uKG9iaikge1xuICAgICAgcmV0dXJuICgodGhpcy5nYW1lLndpZHRoIC0gb2JqLndpZHRoKSAvIDIpICsgKG9iai53aWR0aCAvIDIpO1xuICAgIH0sXG5cbiAgICAvLyBDZW50ZXIgeCBvbiBzdGFnZVxuICAgIGNlbnRlclN0YWdlWTogZnVuY3Rpb24ob2JqKSB7XG4gICAgICByZXR1cm4gKCh0aGlzLmdhbWUuaGVpZ2h0IC0gb2JqLmhlaWdodCkgLyAyKSArIChvYmouaGVpZ2h0IC8gMik7XG4gICAgfSxcblxuICAgIC8vIE1ha2UgY2hhc2Ugc2NlbmVcbiAgICAvLyBUd2VlbiB0bzogZnVuY3Rpb24gKHByb3BlcnRpZXMsIGR1cmF0aW9uLCBlYXNlLCBhdXRvU3RhcnQsIGRlbGF5LCByZXBlYXQsIHlveW8pXG4gICAgY2hhc2U6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHkgPSB0aGlzLnRpdGxlSW1hZ2UueCArICh0aGlzLnRpdGxlSW1hZ2UuaGVpZ2h0IC8gMikgKyB0aGlzLnBhZGRpbmcgKiA0O1xuXG4gICAgICAvLyBBZGQgaWYgbmVlZGVkXG4gICAgICBpZiAoIXRoaXMucGlja2xlIHx8ICF0aGlzLnBpY2tsZS5hbGl2ZSkge1xuICAgICAgICB0aGlzLmhlcm8gPSBuZXcgcHJlZmFicy5IZXJvKHRoaXMuZ2FtZSwgLTEwMDAsIC0xMDAwKTtcblxuICAgICAgICAvLyBHcmF2aXR5IGdldHMgc3RhcnRlZCBpbnQgaGUgZ2FtZVxuICAgICAgICB0aGlzLmhlcm8uYm9keS5hbGxvd0dyYXZpdHkgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5oZXJvLmJvZHkuaW1tb3ZhYmxlID0gdHJ1ZTtcblxuICAgICAgICB0aGlzLmdhbWUuYWRkLmV4aXN0aW5nKHRoaXMuaGVybyk7XG4gICAgICB9XG5cbiAgICAgIGlmICghdGhpcy5ib3QgfHwgIXRoaXMuYm90LmFsaXZlKSB7XG4gICAgICAgIHRoaXMuYm90ID0gbmV3IHByZWZhYnMuQm90dWxpc20odGhpcy5nYW1lLCAtMTAwMCwgLTEwMDApO1xuICAgICAgICB0aGlzLmJvdC5ob3ZlciA9IGZhbHNlO1xuICAgICAgICB0aGlzLmdhbWUuYWRkLmV4aXN0aW5nKHRoaXMuYm90KTtcbiAgICAgIH1cblxuICAgICAgLy8gUmVzZXQgcGxhY2VtZW50XG4gICAgICB0aGlzLmhlcm8ucmVzZXRQbGFjZW1lbnQoLXRoaXMuaGVyby53aWR0aCwgeSAtIHRoaXMucGFkZGluZyAqIDYpO1xuICAgICAgdGhpcy5ib3QucmVzZXRQbGFjZW1lbnQodGhpcy5nYW1lLndpZHRoICsgdGhpcy5wYWRkaW5nICogNiwgeSk7XG5cbiAgICAgIC8vIE1ha2Ugc3VyZSBib3QgaXMgbm90IHNoYWtpbmdcbiAgICAgIHRoaXMuYm90LnNoYWtlT2ZmKCk7XG5cbiAgICAgIC8vIE1vdmUgcGlja2xlIGluXG4gICAgICB0aGlzLmdhbWUuYWRkLnR3ZWVuKHRoaXMuaGVybykudG8oeyB4OiB0aGlzLnBhZGRpbmcgKiA2LCB5OiB5IH0sIDEwMDAsXG4gICAgICAgIFBoYXNlci5FYXNpbmcuUXVhZHJhdGljLkluT3V0LCB0cnVlLCAwKTtcblxuICAgICAgdGhpcy5oZXJvLmRvSnVtcFVwKCk7XG4gICAgICB0aGlzLmdhbWUudGltZS5ldmVudHMuYWRkKDQwMCwgZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuaGVyby5kb0p1bXBEb3duKCk7XG4gICAgICB9LCB0aGlzKTtcblxuICAgICAgLy8gQnJpbmcgaW4gYm90XG4gICAgICB0aGlzLmdhbWUuYWRkLnR3ZWVuKHRoaXMuYm90KS50byh7IHg6IHRoaXMuZ2FtZS53aWR0aCAtIHRoaXMucGFkZGluZyAqIDYgfSwgMTAwMCxcbiAgICAgICAgUGhhc2VyLkVhc2luZy5RdWFkcmF0aWMuSW5PdXQsIHRydWUsIDE1MDApXG4gICAgICAgIC5vbkNvbXBsZXRlLmFkZE9uY2UoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgLy8gU2hha2UgaXQgdXBcbiAgICAgICAgICB0aGlzLmdhbWUudGltZS5ldmVudHMuYWRkKDMwMCwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLmJvdC5zaGFrZU9uKCk7XG4gICAgICAgICAgfSwgdGhpcyk7XG5cbiAgICAgICAgICAvLyBDaGFzZSBwaWNrbGVcbiAgICAgICAgICB0aGlzLmdhbWUuYWRkLnR3ZWVuKHRoaXMuYm90KS50byh7IHg6IHRoaXMuYm90LndpZHRoICogLTQgfSwgMjAwMCxcbiAgICAgICAgICAgIFBoYXNlci5FYXNpbmcuRXhwb25lbnRpYWwuSW4sIHRydWUsIDEwMDApO1xuXG4gICAgICAgICAgLy8gUGlja2xlIGp1bXAgYXdheVxuICAgICAgICAgIHRoaXMuZ2FtZS5hZGQudHdlZW4odGhpcy5oZXJvKS50byh7IHg6IC10aGlzLmhlcm8ud2lkdGgsIHk6IHkgLSB0aGlzLnBhZGRpbmcgKiA2IH0sIDUwMCxcbiAgICAgICAgICAgIFBoYXNlci5FYXNpbmcuUXVhZHJhdGljLkluT3V0LCB0cnVlLCAyMjAwKTtcblxuICAgICAgICAgIC8vIEFuaW1hdGUgcGlja2xlXG4gICAgICAgICAgdGhpcy5nYW1lLnRpbWUuZXZlbnRzLmFkZCgyMjAwLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuaGVyby5kb0p1bXBVcCgpO1xuICAgICAgICAgIH0sIHRoaXMpO1xuICAgICAgICB9LCB0aGlzKTtcbiAgICB9XG4gIH0pO1xuXG4gIC8vIEV4cG9ydFxuICBtb2R1bGUuZXhwb3J0cyA9IE1lbnU7XG59KSgpO1xuIiwiLyogZ2xvYmFsIF86ZmFsc2UsIFBoYXNlcjpmYWxzZSAqL1xuXG4vKipcbiAqIFBsYXkgc3RhdGVcbiAqL1xuXG4oZnVuY3Rpb24oKSB7XG4gIFwidXNlIHN0cmljdFwiO1xuXG4gIC8vIERlcGVuZGVuY2llc1xuICB2YXIgcHJlZmFicyA9IHtcbiAgICBEaWxsOiByZXF1aXJlKFwiLi9wcmVmYWItZGlsbC5qc1wiKSxcbiAgICBQZXBwZXI6IHJlcXVpcmUoXCIuL3ByZWZhYi1wZXBwZXIuanNcIiksXG4gICAgQm90dWxpc206IHJlcXVpcmUoXCIuL3ByZWZhYi1ib3R1bGlzbS5qc1wiKSxcbiAgICBNaW5pOiByZXF1aXJlKFwiLi9wcmVmYWItbWluaS5qc1wiKSxcbiAgICBIZXJvOiByZXF1aXJlKFwiLi9wcmVmYWItaGVyby5qc1wiKSxcbiAgICBCZWFuOiByZXF1aXJlKFwiLi9wcmVmYWItYmVhbi5qc1wiKSxcbiAgICBDYXJyb3Q6IHJlcXVpcmUoXCIuL3ByZWZhYi1jYXJyb3QuanNcIiksXG4gICAgSmFyOiByZXF1aXJlKFwiLi9wcmVmYWItamFyLmpzXCIpXG4gIH07XG5cbiAgLy8gQ29uc3RydWN0b3JcbiAgdmFyIFBsYXkgPSBmdW5jdGlvbigpIHtcbiAgICBQaGFzZXIuU3RhdGUuY2FsbCh0aGlzKTtcbiAgfTtcblxuICAvLyBFeHRlbmQgZnJvbSBTdGF0ZVxuICBQbGF5LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUGhhc2VyLlN0YXRlLnByb3RvdHlwZSk7XG4gIFBsYXkucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gUGxheTtcblxuICAvLyBBZGQgbWV0aG9kc1xuICBfLmV4dGVuZChQbGF5LnByb3RvdHlwZSwgUGhhc2VyLlN0YXRlLnByb3RvdHlwZSwge1xuICAgIC8vIFByZWxvYWRcbiAgICBwcmVsb2FkOiBmdW5jdGlvbigpIHtcbiAgICAgIC8vIExvYWQgdXAgZ2FtZSBpbWFnZXNcbiAgICAgIHRoaXMuZ2FtZS5sb2FkLmF0bGFzKFwiZ2FtZS1zcHJpdGVzXCIsIFwiYXNzZXRzL2dhbWUtc3ByaXRlcy5wbmdcIiwgXCJhc3NldHMvZ2FtZS1zcHJpdGVzLmpzb25cIik7XG4gICAgICB0aGlzLmdhbWUubG9hZC5hdGxhcyhcInBpY2tsZS1zcHJpdGVzXCIsIFwiYXNzZXRzL3BpY2tsZS1zcHJpdGVzLnBuZ1wiLCBcImFzc2V0cy9waWNrbGUtc3ByaXRlcy5qc29uXCIpO1xuICAgICAgdGhpcy5nYW1lLmxvYWQuYXRsYXMoXCJjYXJyb3Qtc3ByaXRlc1wiLCBcImFzc2V0cy9jYXJyb3Qtc3ByaXRlcy5wbmdcIiwgXCJhc3NldHMvY2Fycm90LXNwcml0ZXMuanNvblwiKTtcbiAgICB9LFxuXG4gICAgLy8gQ3JlYXRlXG4gICAgY3JlYXRlOiBmdW5jdGlvbigpIHtcbiAgICAgIC8vIFNldCBpbml0aWFsIGRpZmZpY3VsdHkgYW5kIGxldmVsIHNldHRpbmdzXG4gICAgICB0aGlzLmNyZWF0ZVN1cGVyTGV2ZWxCRygpO1xuICAgICAgdGhpcy51cGRhdGVEaWZmaWN1bHR5KCk7XG5cbiAgICAgIC8vIFNjb3JpbmdcbiAgICAgIHRoaXMuc2NvcmVNaW5pID0gMTAwO1xuICAgICAgdGhpcy5zY29yZURpbGwgPSA1MDA7XG4gICAgICB0aGlzLnNjb3JlUGVwcGVyID0gNzUwO1xuICAgICAgdGhpcy5zY29yZUJvdCA9IDEwMDA7XG5cbiAgICAgIC8vIFNwYWNpbmdcbiAgICAgIHRoaXMucGFkZGluZyA9IDEwO1xuXG4gICAgICAvLyBEZXRlcm1pbmUgd2hlcmUgZmlyc3QgcGxhdGZvcm0gYW5kIGhlcm8gd2lsbCBiZS5cbiAgICAgIHRoaXMuc3RhcnRZID0gdGhpcy5nYW1lLmhlaWdodCAtIDU7XG5cbiAgICAgIC8vIEluaXRpYWxpemUgdHJhY2tpbmcgdmFyaWFibGVzXG4gICAgICB0aGlzLnJlc2V0Vmlld1RyYWNraW5nKCk7XG5cbiAgICAgIC8vIFNjYWxpbmdcbiAgICAgIHRoaXMuZ2FtZS5zY2FsZS5zY2FsZU1vZGUgPSBQaGFzZXIuU2NhbGVNYW5hZ2VyLlNIT1dfQUxMO1xuICAgICAgdGhpcy5nYW1lLnNjYWxlLm1heFdpZHRoID0gdGhpcy5nYW1lLndpZHRoO1xuICAgICAgdGhpcy5nYW1lLnNjYWxlLm1heEhlaWdodCA9IHRoaXMuZ2FtZS5oZWlnaHQ7XG4gICAgICB0aGlzLmdhbWUuc2NhbGUucGFnZUFsaWduSG9yaXpvbnRhbGx5ID0gdHJ1ZTtcbiAgICAgIHRoaXMuZ2FtZS5zY2FsZS5wYWdlQWxpZ25WZXJ0aWNhbGx5ID0gdHJ1ZTtcblxuICAgICAgLy8gUGh5c2ljc1xuICAgICAgdGhpcy5nYW1lLnBoeXNpY3Muc3RhcnRTeXN0ZW0oUGhhc2VyLlBoeXNpY3MuQVJDQURFKTtcbiAgICAgIHRoaXMuZ2FtZS5waHlzaWNzLmFyY2FkZS5ncmF2aXR5LnkgPSAxMDAwO1xuXG4gICAgICAvLyBDb250YWluZXJzXG4gICAgICB0aGlzLmJlYW5zID0gdGhpcy5nYW1lLmFkZC5ncm91cCgpO1xuICAgICAgdGhpcy5jYXJyb3RzID0gdGhpcy5nYW1lLmFkZC5ncm91cCgpO1xuICAgICAgdGhpcy5taW5pcyA9IHRoaXMuZ2FtZS5hZGQuZ3JvdXAoKTtcbiAgICAgIHRoaXMuZGlsbHMgPSB0aGlzLmdhbWUuYWRkLmdyb3VwKCk7XG4gICAgICB0aGlzLnBlcHBlcnMgPSB0aGlzLmdhbWUuYWRkLmdyb3VwKCk7XG4gICAgICB0aGlzLmJvdHMgPSB0aGlzLmdhbWUuYWRkLmdyb3VwKCk7XG5cbiAgICAgIC8vIFBsYXRmb3Jtc1xuICAgICAgdGhpcy5hZGRQbGF0Zm9ybXMoKTtcblxuICAgICAgLy8gQWRkIGhlcm8gaGVyZSBzbyBpcyBhbHdheXMgb24gdG9wLlxuICAgICAgdGhpcy5oZXJvID0gbmV3IHByZWZhYnMuSGVybyh0aGlzLmdhbWUsIDAsIDApO1xuICAgICAgdGhpcy5oZXJvLnJlc2V0UGxhY2VtZW50KHRoaXMuZ2FtZS53aWR0aCAqIDAuNSwgdGhpcy5zdGFydFkgLSB0aGlzLmhlcm8uaGVpZ2h0IC0gNTApO1xuICAgICAgdGhpcy5nYW1lLmFkZC5leGlzdGluZyh0aGlzLmhlcm8pO1xuXG4gICAgICAvLyBJbml0aWFsaXplIHNjb3JlXG4gICAgICB0aGlzLnJlc2V0U2NvcmUoKTtcbiAgICAgIHRoaXMudXBkYXRlU2NvcmUoKTtcblxuICAgICAgLy8gQ3Vyc29ycywgaW5wdXRcbiAgICAgIHRoaXMuY3Vyc29ycyA9IHRoaXMuZ2FtZS5pbnB1dC5rZXlib2FyZC5jcmVhdGVDdXJzb3JLZXlzKCk7XG4gICAgICB0aGlzLmFjdGlvbkJ1dHRvbiA9IHRoaXMuZ2FtZS5pbnB1dC5rZXlib2FyZC5hZGRLZXkoUGhhc2VyLktleWJvYXJkLlNQQUNFQkFSKTtcbiAgICB9LFxuXG4gICAgLy8gVXBkYXRlXG4gICAgdXBkYXRlOiBmdW5jdGlvbigpIHtcbiAgICAgIC8vIFRoaXMgaXMgd2hlcmUgdGhlIG1haW4gbWFnaWMgaGFwcGVuc1xuICAgICAgLy8gdGhlIHkgb2Zmc2V0IGFuZCB0aGUgaGVpZ2h0IG9mIHRoZSB3b3JsZCBhcmUgYWRqdXN0ZWRcbiAgICAgIC8vIHRvIG1hdGNoIHRoZSBoaWdoZXN0IHBvaW50IHRoZSBoZXJvIGhhcyByZWFjaGVkXG4gICAgICB0aGlzLndvcmxkLnNldEJvdW5kcygwLCAtdGhpcy5oZXJvLnlDaGFuZ2UsIHRoaXMuZ2FtZS53b3JsZC53aWR0aCxcbiAgICAgICAgdGhpcy5nYW1lLmhlaWdodCArIHRoaXMuaGVyby55Q2hhbmdlKTtcblxuICAgICAgLy8gVGhlIGJ1aWx0IGluIGNhbWVyYSBmb2xsb3cgbWV0aG9kcyB3b24ndCB3b3JrIGZvciBvdXIgbmVlZHNcbiAgICAgIC8vIHRoaXMgaXMgYSBjdXN0b20gZm9sbG93IHN0eWxlIHRoYXQgd2lsbCBub3QgZXZlciBtb3ZlIGRvd24sIGl0IG9ubHkgbW92ZXMgdXBcbiAgICAgIHRoaXMuY2FtZXJhWU1pbiA9IE1hdGgubWluKHRoaXMuY2FtZXJhWU1pbiwgdGhpcy5oZXJvLnkgLSB0aGlzLmdhbWUuaGVpZ2h0IC8gMik7XG4gICAgICB0aGlzLmNhbWVyYS55ID0gdGhpcy5jYW1lcmFZTWluO1xuXG4gICAgICAvLyBJZiBoZXJvIGZhbGxzIGJlbG93IGNhbWVyYVxuICAgICAgaWYgKHRoaXMuaGVyby55ID4gdGhpcy5jYW1lcmFZTWluICsgdGhpcy5nYW1lLmhlaWdodCArIDIwMCkge1xuICAgICAgICB0aGlzLmdhbWVPdmVyKCk7XG4gICAgICB9XG5cbiAgICAgIC8vIElmIGhlcm8gaXMgZ29pbmcgZG93biwgdGhlbiBubyBsb25nZXIgb24gZmlyZVxuICAgICAgaWYgKHRoaXMuaGVyby5ib2R5LnZlbG9jaXR5LnkgPiAwKSB7XG4gICAgICAgIHRoaXMucHV0T3V0RmlyZSgpO1xuICAgICAgfVxuXG4gICAgICAvLyBNb3ZlIGhlcm9cbiAgICAgIHRoaXMuaGVyby5ib2R5LnZlbG9jaXR5LnggPVxuICAgICAgICAodGhpcy5jdXJzb3JzLmxlZnQuaXNEb3duKSA/IC0odGhpcy5nYW1lLnBoeXNpY3MuYXJjYWRlLmdyYXZpdHkueSAvIDUpIDpcbiAgICAgICAgKHRoaXMuY3Vyc29ycy5yaWdodC5pc0Rvd24pID8gKHRoaXMuZ2FtZS5waHlzaWNzLmFyY2FkZS5ncmF2aXR5LnkgLyA1KSA6IDA7XG5cbiAgICAgIC8vIENvbGxpc2lvbnNcbiAgICAgIHRoaXMudXBkYXRlQ29sbGlzaW9ucygpO1xuXG4gICAgICAvLyBJdGVtcyAocGxhdGZvcm1zIGFuZCBpdGVtcylcbiAgICAgIHRoaXMudXBkYXRlSXRlbXMoKTtcblxuICAgICAgLy8gVXBkYXRlIHNjb3JlXG4gICAgICB0aGlzLnVwZGF0ZVNjb3JlKCk7XG5cbiAgICAgIC8vIFVwZGF0ZSBkaWZmaWN1bHRcbiAgICAgIHRoaXMudXBkYXRlRGlmZmljdWx0eSgpO1xuXG4gICAgICAvLyBTaGFrZVxuICAgICAgdGhpcy51cGRhdGVXb3JsZFNoYWtlKCk7XG5cbiAgICAgIC8vIERlYnVnXG4gICAgICBpZiAodGhpcy5nYW1lLnBpY2tsZS5vcHRpb25zLmRlYnVnKSB7XG4gICAgICAgIHRoaXMuZ2FtZS5kZWJ1Zy5ib2R5KHRoaXMuaGVybyk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIC8vIEhhbmRsZSBjb2xsaXNpb25zXG4gICAgdXBkYXRlQ29sbGlzaW9uczogZnVuY3Rpb24oKSB7XG4gICAgICAvLyBXaGVuIGRlYWQsIG5vIGNvbGxpc2lvbnMsIGp1c3QgZmFsbCB0byBkZWF0aC5cbiAgICAgIGlmICh0aGlzLmhlcm8uaXNEZWFkKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gUGxhdGZvcm0gY29sbGlzaW9uc1xuICAgICAgdGhpcy5nYW1lLnBoeXNpY3MuYXJjYWRlLmNvbGxpZGUodGhpcy5oZXJvLCB0aGlzLmJlYW5zLCB0aGlzLnVwZGF0ZUhlcm9QbGF0Zm9ybSwgbnVsbCwgdGhpcyk7XG4gICAgICB0aGlzLmdhbWUucGh5c2ljcy5hcmNhZGUuY29sbGlkZSh0aGlzLmhlcm8sIHRoaXMuY2Fycm90cywgdGhpcy51cGRhdGVIZXJvUGxhdGZvcm0sIG51bGwsIHRoaXMpO1xuICAgICAgdGhpcy5nYW1lLnBoeXNpY3MuYXJjYWRlLmNvbGxpZGUodGhpcy5oZXJvLCB0aGlzLmJhc2UsIHRoaXMudXBkYXRlSGVyb1BsYXRmb3JtLCBudWxsLCB0aGlzKTtcblxuICAgICAgLy8gTWluaSBjb2xsaXNpb25zXG4gICAgICB0aGlzLmdhbWUucGh5c2ljcy5hcmNhZGUub3ZlcmxhcCh0aGlzLmhlcm8sIHRoaXMubWluaXMsIGZ1bmN0aW9uKGhlcm8sIG1pbmkpIHtcbiAgICAgICAgbWluaS5raWxsKCk7XG4gICAgICAgIHRoaXMudXBkYXRlU2NvcmUodGhpcy5zY29yZU1pbmkpO1xuICAgICAgfSwgbnVsbCwgdGhpcyk7XG5cbiAgICAgIC8vIERpbGwgY29sbGlzaW9ucy4gIERvbid0IGRvIGFueXRoaW5nIGlmIG9uIGZpcmVcbiAgICAgIGlmICghdGhpcy5vbkZpcmUpIHtcbiAgICAgICAgdGhpcy5nYW1lLnBoeXNpY3MuYXJjYWRlLm92ZXJsYXAodGhpcy5oZXJvLCB0aGlzLmRpbGxzLCBmdW5jdGlvbihoZXJvLCBkaWxsKSB7XG4gICAgICAgICAgZGlsbC5raWxsKCk7XG4gICAgICAgICAgdGhpcy51cGRhdGVTY29yZSh0aGlzLnNjb3JlRGlsbCk7XG4gICAgICAgICAgaGVyby5ib2R5LnZlbG9jaXR5LnkgPSB0aGlzLmdhbWUucGh5c2ljcy5hcmNhZGUuZ3Jhdml0eS55ICogLTEgKiAxLjU7XG4gICAgICAgIH0sIG51bGwsIHRoaXMpO1xuICAgICAgfVxuXG4gICAgICAvLyBQZXBwZXIgY29sbGlzaW9uc1xuICAgICAgdGhpcy5nYW1lLnBoeXNpY3MuYXJjYWRlLm92ZXJsYXAodGhpcy5oZXJvLCB0aGlzLnBlcHBlcnMsIGZ1bmN0aW9uKGhlcm8sIHBlcHBlcikge1xuICAgICAgICBwZXBwZXIua2lsbCgpO1xuICAgICAgICB0aGlzLnVwZGF0ZVNjb3JlKHRoaXMuc2NvcmVQZXBwZXIpO1xuICAgICAgICB0aGlzLnNldE9uRmlyZSgpO1xuICAgICAgICBoZXJvLmJvZHkudmVsb2NpdHkueSA9IHRoaXMuZ2FtZS5waHlzaWNzLmFyY2FkZS5ncmF2aXR5LnkgKiAtMSAqIDM7XG4gICAgICB9LCBudWxsLCB0aGlzKTtcblxuICAgICAgLy8gQm90dWxpc20gY29sbGlzaW9ucy4gIElmIGhlcm8ganVtcHMgb24gdG9wLCB0aGVuIGtpbGwsIG90aGVyd2lzZSBkaWUsIGFuZFxuICAgICAgLy8gaWdub3JlIGlmIG9uIGZpcmUuXG4gICAgICBpZiAoIXRoaXMub25GaXJlKSB7XG4gICAgICAgIHRoaXMuZ2FtZS5waHlzaWNzLmFyY2FkZS5jb2xsaWRlKHRoaXMuaGVybywgdGhpcy5ib3RzLCBmdW5jdGlvbihoZXJvLCBib3QpIHtcbiAgICAgICAgICBpZiAoaGVyby5ib2R5LnRvdWNoaW5nLmRvd24pIHtcbiAgICAgICAgICAgIGJvdC5tdXJkZXIoKTtcbiAgICAgICAgICAgIHRoaXMudXBkYXRlU2NvcmUodGhpcy5zY29yZUJvdCk7XG4gICAgICAgICAgICBoZXJvLmJvZHkudmVsb2NpdHkueSA9IHRoaXMuZ2FtZS5waHlzaWNzLmFyY2FkZS5ncmF2aXR5LnkgKiAtMSAqIDAuNTtcbiAgICAgICAgICB9XG4gICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBoZXJvLmJvdGNoeU11cmRlcigpO1xuICAgICAgICAgICAgYm90Lm11cmRlcigpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSwgbnVsbCwgdGhpcyk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIC8vIFBsYXRmb3JtIGNvbGxpc2lvblxuICAgIHVwZGF0ZUhlcm9QbGF0Zm9ybTogZnVuY3Rpb24oaGVybywgaXRlbSkge1xuICAgICAgLy8gTWFrZSBzdXJlIG5vIGxvbmdlciBvbiBmaXJlXG4gICAgICB0aGlzLnB1dE91dEZpcmUoKTtcblxuICAgICAgLy8gSnVtcFxuICAgICAgaGVyby5ib2R5LnZlbG9jaXR5LnkgPSB0aGlzLmdhbWUucGh5c2ljcy5hcmNhZGUuZ3Jhdml0eS55ICogLTEgKiAwLjc7XG5cbiAgICAgIC8vIElmIGNhcnJvdCwgc25hcFxuICAgICAgaWYgKGl0ZW0gaW5zdGFuY2VvZiBwcmVmYWJzLkNhcnJvdCkge1xuICAgICAgICBpdGVtLnNuYXAoKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLy8gSGFuZGxlIGl0ZW1zXG4gICAgdXBkYXRlSXRlbXM6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGhpZ2hlc3Q7XG4gICAgICB2YXIgYmVhbjtcbiAgICAgIHZhciBjYXJyb3Q7XG5cbiAgICAgIC8vIFJlbW92ZSBhbnkgcG9vbCBpdGVtcyB0aGF0IGFyZSBvZmYgc2NyZWVuXG4gICAgICBbXCJtaW5pc1wiLCBcImRpbGxzXCIsIFwiYm90c1wiLCBcInBlcHBlcnNcIiwgXCJiZWFuc1wiLCBcImNhcnJvdHNcIl0uZm9yRWFjaChfLmJpbmQoZnVuY3Rpb24ocG9vbCkge1xuICAgICAgICB0aGlzW3Bvb2xdLmZvckVhY2hBbGl2ZShmdW5jdGlvbihwKSB7XG4gICAgICAgICAgLy8gQ2hlY2sgaWYgdGhpcyBvbmUgaXMgb2YgdGhlIHNjcmVlblxuICAgICAgICAgIGlmIChwLnkgPiB0aGlzLmNhbWVyYS55ICsgdGhpcy5nYW1lLmhlaWdodCkge1xuICAgICAgICAgICAgcC5raWxsKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9LCB0aGlzKTtcbiAgICAgIH0sIHRoaXMpKTtcblxuICAgICAgLy8gUmVtb3ZlIGFueSByZWd1bGFyIGl0ZW1zIHRoYXQgYXJlIG9mZiBzY3JlZW5cbiAgICAgIFtcImJhc2VcIl0uZm9yRWFjaChfLmJpbmQoZnVuY3Rpb24ocCkge1xuICAgICAgICBpZiAodGhpc1twXSAmJiB0aGlzW3BdLmFsaXZlICYmIHRoaXNbcF0ueSA+IHRoaXMuY2FtZXJhLnkgKyB0aGlzLmdhbWUuaGVpZ2h0ICogMikge1xuICAgICAgICAgIHRoaXNbcF0ua2lsbCgpO1xuICAgICAgICB9XG4gICAgICB9LCB0aGlzKSk7XG5cbiAgICAgIC8vIERldGVybWluZSB3aGVyZSB0aGUgbGFzdCBwbGF0Zm9ybSBpc1xuICAgICAgW1wiYmVhbnNcIiwgXCJjYXJyb3RzXCJdLmZvckVhY2goXy5iaW5kKGZ1bmN0aW9uKGdyb3VwKSB7XG4gICAgICAgIHRoaXNbZ3JvdXBdLmZvckVhY2hBbGl2ZShmdW5jdGlvbihwKSB7XG4gICAgICAgICAgaWYgKHAueSA8IHRoaXMucGxhdGZvcm1ZTWluKSB7XG4gICAgICAgICAgICB0aGlzLnBsYXRmb3JtWU1pbiA9IHAueTtcbiAgICAgICAgICAgIGhpZ2hlc3QgPSBwO1xuICAgICAgICAgIH1cbiAgICAgICAgfSwgdGhpcyk7XG4gICAgICB9LCB0aGlzKSk7XG5cbiAgICAgIC8vIEFkZCBuZXcgcGxhdGZvcm0gaWYgbmVlZGVkXG4gICAgICBjYXJyb3QgPSB0aGlzLmNhcnJvdHMuZ2V0Rmlyc3REZWFkKCk7XG4gICAgICBiZWFuID0gdGhpcy5iZWFucy5nZXRGaXJzdERlYWQoKTtcbiAgICAgIGlmIChjYXJyb3QgJiYgYmVhbikge1xuICAgICAgICBpZiAodGhpcy5jaGFuY2UoXCJwbGF0Zm9ybXNcIikgPT09IFwiY2Fycm90XCIpIHtcbiAgICAgICAgICB0aGlzLnBsYWNlUGxhdGZvcm0oY2Fycm90LCBoaWdoZXN0LCB1bmRlZmluZWQsIFwiY2Fycm90XCIpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIHRoaXMucGxhY2VQbGF0Zm9ybShiZWFuLCBoaWdoZXN0LCB1bmRlZmluZWQsIFwiYmVhblwiKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG5cbiAgICAvLyBTaGFrZSB3b3JsZCBlZmZlY3RcbiAgICB1cGRhdGVXb3JsZFNoYWtlOiBmdW5jdGlvbigpIHtcbiAgICAgIGlmICh0aGlzLnNoYWtlV29ybGRDb3VudGVyID4gMCkge1xuICAgICAgICB2YXIgbWFnbml0dWRlID0gTWF0aC5tYXgodGhpcy5zaGFrZVdvcmxkQ291bnRlciAvIDUwLCAxKSArIDE7XG4gICAgICAgIHZhciByeCA9IHRoaXMuZ2FtZS5ybmQuaW50ZWdlckluUmFuZ2UoLTQgKiBtYWduaXR1ZGUsIDQgKiBtYWduaXR1ZGUpO1xuICAgICAgICB2YXIgcnkgPSB0aGlzLmdhbWUucm5kLmludGVnZXJJblJhbmdlKC0yICogbWFnbml0dWRlLCAyICogbWFnbml0dWRlKTtcbiAgICAgICAgdGhpcy5nYW1lLmNhbWVyYS54ICs9IHJ4O1xuICAgICAgICB0aGlzLmdhbWUuY2FtZXJhLnkgKz0gcnk7XG4gICAgICAgIHRoaXMuc2hha2VXb3JsZENvdW50ZXItLTtcblxuICAgICAgICBpZiAodGhpcy5zaGFrZVdvcmxkQ291bnRlciA8PSAwKSB7XG4gICAgICAgICAgdGhpcy5nYW1lLmNhbWVyYS54ID0gMDtcbiAgICAgICAgICB0aGlzLmdhbWUuY2FtZXJhLnkgPSAwO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcblxuICAgIC8vIFNodXRkb3duXG4gICAgc2h1dGRvd246IGZ1bmN0aW9uKCkge1xuICAgICAgLy8gUmVzZXQgZXZlcnl0aGluZywgb3IgdGhlIHdvcmxkIHdpbGwgYmUgbWVzc2VkIHVwXG4gICAgICB0aGlzLndvcmxkLnNldEJvdW5kcygwLCAwLCB0aGlzLmdhbWUud2lkdGgsIHRoaXMuZ2FtZS5oZWlnaHQpO1xuICAgICAgdGhpcy5jdXJzb3IgPSBudWxsO1xuICAgICAgdGhpcy5yZXNldFZpZXdUcmFja2luZygpO1xuICAgICAgdGhpcy5yZXNldFNjb3JlKCk7XG5cbiAgICAgIFtcImhlcm9cIiwgXCJiZWFuc1wiLCBcIm1pbmlzXCIsIFwiZGlsbHNcIiwgXCJwZXBwZXJzXCIsXG4gICAgICAgIFwiY2Fycm90c1wiLCBcInNjb3JlR3JvdXBcIl0uZm9yRWFjaChfLmJpbmQoZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICBpZiAodGhpc1tpdGVtXSkge1xuICAgICAgICAgIHRoaXNbaXRlbV0uZGVzdHJveSgpO1xuICAgICAgICAgIHRoaXNbaXRlbV0gPSBudWxsO1xuICAgICAgICB9XG4gICAgICB9LCB0aGlzKSk7XG4gICAgfSxcblxuICAgIC8vIEdhbWUgb3ZlclxuICAgIGdhbWVPdmVyOiBmdW5jdGlvbigpIHtcbiAgICAgIC8vIENhbid0IHNlZW0gdG8gZmluZCBhIHdheSB0byBwYXNzIHRoZSBzY29yZVxuICAgICAgLy8gdmlhIGEgc3RhdGUgY2hhbmdlLlxuICAgICAgdGhpcy5nYW1lLnBpY2tsZS5zY29yZSA9IHRoaXMuc2NvcmU7XG4gICAgICB0aGlzLmdhbWUuc3RhdGUuc3RhcnQoXCJnYW1lb3ZlclwiKTtcbiAgICB9LFxuXG4gICAgLy8gU2hha2Ugd29ybGRcbiAgICBzaGFrZTogZnVuY3Rpb24obGVuZ3RoKSB7XG4gICAgICB0aGlzLnNoYWtlV29ybGRDb3VudGVyID0gKCFsZW5ndGgpID8gMCA6IHRoaXMuc2hha2VXb3JsZENvdW50ZXIgKyBsZW5ndGg7XG4gICAgfSxcblxuICAgIC8vIEFkZCBwbGF0Zm9ybSBwb29sIGFuZCBjcmVhdGUgaW5pdGlhbCBvbmVcbiAgICBhZGRQbGF0Zm9ybXM6IGZ1bmN0aW9uKCkge1xuICAgICAgLy8gQWRkIGJhc2UgcGxhdGZvcm0gKGphcikuXG4gICAgICB0aGlzLmJhc2UgPSBuZXcgcHJlZmFicy5KYXIodGhpcy5nYW1lLCB0aGlzLmdhbWUud2lkdGggKiAwLjUsIHRoaXMuc3RhcnRZLCB0aGlzLmdhbWUud2lkdGggKiAyKTtcbiAgICAgIHRoaXMuZ2FtZS5hZGQuZXhpc3RpbmcodGhpcy5iYXNlKTtcblxuICAgICAgLy8gQWRkIHNvbWUgYmFzZSBjYXJyb3RzIChidXQgaGF2ZSB0aGVtIG9mZiBzY3JlZW4pXG4gICAgICBfLmVhY2goXy5yYW5nZSgxMCksIF8uYmluZChmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHAgPSBuZXcgcHJlZmFicy5DYXJyb3QodGhpcy5nYW1lLCAtOTk5LCB0aGlzLmdhbWUuaGVpZ2h0ICogMik7XG4gICAgICAgIHRoaXMuY2Fycm90cy5hZGQocCk7XG4gICAgICB9LCB0aGlzKSk7XG5cbiAgICAgIC8vIEFkZCBzb21lIGJhc2UgYmVhbnNcbiAgICAgIHZhciBwcmV2aW91cztcbiAgICAgIF8uZWFjaChfLnJhbmdlKDIwKSwgXy5iaW5kKGZ1bmN0aW9uKGkpIHtcbiAgICAgICAgdmFyIHAgPSBuZXcgcHJlZmFicy5CZWFuKHRoaXMuZ2FtZSwgMCwgMCk7XG4gICAgICAgIHRoaXMucGxhY2VQbGF0Zm9ybShwLCBwcmV2aW91cywgdGhpcy53b3JsZC5oZWlnaHQgLSB0aGlzLnBsYXRmb3JtU3BhY2VZIC0gdGhpcy5wbGF0Zm9ybVNwYWNlWSAqIGkpO1xuICAgICAgICB0aGlzLmJlYW5zLmFkZChwKTtcbiAgICAgICAgcHJldmlvdXMgPSBwO1xuICAgICAgfSwgdGhpcykpO1xuICAgIH0sXG5cbiAgICAvLyBQbGFjZSBwbGF0Zm9ybVxuICAgIHBsYWNlUGxhdGZvcm06IGZ1bmN0aW9uKHBsYXRmb3JtLCBwcmV2aW91c1BsYXRmb3JtLCBvdmVycmlkZVksIHBsYXRmb3JtVHlwZSkge1xuICAgICAgcGxhdGZvcm0ucmVzZXRTZXR0aW5ncygpO1xuICAgICAgcGxhdGZvcm1UeXBlID0gKHBsYXRmb3JtVHlwZSA9PT0gdW5kZWZpbmVkKSA/IFwiYmVhblwiIDogcGxhdGZvcm1UeXBlO1xuICAgICAgdmFyIHkgPSBvdmVycmlkZVkgfHwgdGhpcy5wbGF0Zm9ybVlNaW4gLSB0aGlzLnBsYXRmb3JtU3BhY2VZO1xuICAgICAgdmFyIG1pblggPSBwbGF0Zm9ybS5taW5YO1xuICAgICAgdmFyIG1heFggPSBwbGF0Zm9ybS5tYXhYO1xuXG4gICAgICAvLyBEZXRlcm1pbmUgeCBiYXNlZCBvbiBwcmV2aW91c1BsYXRmb3JtXG4gICAgICB2YXIgeCA9IHRoaXMucm5kLmludGVnZXJJblJhbmdlKG1pblgsIG1heFgpO1xuICAgICAgaWYgKHByZXZpb3VzUGxhdGZvcm0pIHtcbiAgICAgICAgeCA9IHRoaXMucm5kLmludGVnZXJJblJhbmdlKHByZXZpb3VzUGxhdGZvcm0ueCAtIHRoaXMucGxhdGZvcm1HYXBNYXgsIHByZXZpb3VzUGxhdGZvcm0ueCArIHRoaXMucGxhdGZvcm1HYXBNYXgpO1xuXG4gICAgICAgIC8vIFNvbWUgbG9naWMgdG8gdHJ5IHRvIHdyYXBcbiAgICAgICAgeCA9ICh4IDwgMCkgPyBNYXRoLm1pbihtYXhYLCB0aGlzLndvcmxkLndpZHRoICsgeCkgOiBNYXRoLm1heCh4LCBtaW5YKTtcbiAgICAgICAgeCA9ICh4ID4gdGhpcy53b3JsZC53aWR0aCkgPyBNYXRoLm1heChtaW5YLCB4IC0gdGhpcy53b3JsZC53aWR0aCkgOiBNYXRoLm1pbih4LCBtYXhYKTtcbiAgICAgIH1cblxuICAgICAgLy8gUGxhY2VcbiAgICAgIHBsYXRmb3JtLnJlc2V0KHgsIHkpO1xuXG4gICAgICAvLyBBZGQgc29tZSBmbHVmZlxuICAgICAgdGhpcy5mbHVmZlBsYXRmb3JtKHBsYXRmb3JtLCBwbGF0Zm9ybVR5cGUpO1xuICAgIH0sXG5cbiAgICAvLyBBZGQgcG9zc2libGUgZmx1ZmYgdG8gcGxhdGZvcm1cbiAgICBmbHVmZlBsYXRmb3JtOiBmdW5jdGlvbihwbGF0Zm9ybSwgcGxhdGZvcm1UeXBlKSB7XG4gICAgICB2YXIgeCA9IHBsYXRmb3JtLng7XG4gICAgICB2YXIgeSA9IHBsYXRmb3JtLnkgLSBwbGF0Zm9ybS5oZWlnaHQgLyAyIC0gMzA7XG4gICAgICB2YXIgaXRlbUNoYW5jZSA9IHRoaXMuY2hhbmNlKHBsYXRmb3JtVHlwZSArIFwiSXRlbXNcIik7XG5cbiAgICAgIC8vIEhvdmVyLiAgRG9uJ3QgQWRkIGl0ZW1zXG4gICAgICBpZiAodGhpcy5jaGFuY2UoXCJob3ZlclwiKSA9PT0gXCJob3ZlclwiKSB7XG4gICAgICAgIHBsYXRmb3JtLmhvdmVyID0gdHJ1ZTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBJdGVtc1xuICAgICAgaWYgKGl0ZW1DaGFuY2UgPT09IFwibWluaVwiKSB7XG4gICAgICAgIHRoaXMuYWRkV2l0aFBvb2wodGhpcy5taW5pcywgXCJNaW5pXCIsIHgsIHkpO1xuICAgICAgfVxuICAgICAgZWxzZSBpZiAoaXRlbUNoYW5jZSA9PT0gXCJkaWxsXCIpIHtcbiAgICAgICAgdGhpcy5hZGRXaXRoUG9vbCh0aGlzLmRpbGxzLCBcIkRpbGxcIiwgeCwgeSk7XG4gICAgICB9XG4gICAgICBlbHNlIGlmIChpdGVtQ2hhbmNlID09PSBcInBlcHBlclwiKSB7XG4gICAgICAgIHRoaXMuYWRkV2l0aFBvb2wodGhpcy5wZXBwZXJzLCBcIlBlcHBlclwiLCB4LCB5KTtcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKGl0ZW1DaGFuY2UgPT09IFwiYm90XCIpIHtcbiAgICAgICAgdGhpcy5hZGRXaXRoUG9vbCh0aGlzLmJvdHMsIFwiQm90dWxpc21cIiwgeCwgeSk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIC8vIEdlbmVyaWMgYWRkIHdpdGggcG9vbGluZyBmdW5jdGlvbmFsbGl0eVxuICAgIGFkZFdpdGhQb29sOiBmdW5jdGlvbihwb29sLCBwcmVmYWIsIHgsIHkpIHtcbiAgICAgIHZhciBvID0gcG9vbC5nZXRGaXJzdERlYWQoKTtcbiAgICAgIG8gPSBvIHx8IG5ldyBwcmVmYWJzW3ByZWZhYl0odGhpcy5nYW1lLCB4LCB5KTtcblxuICAgICAgLy8gVXNlIGN1c3RvbSByZXNldCBpZiBhdmFpbGFibGVcbiAgICAgIGlmIChvLnJlc2V0UGxhY2VtZW50KSB7XG4gICAgICAgIG8ucmVzZXRQbGFjZW1lbnQoeCwgeSk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgby5yZXNldCh4LCB5KTtcbiAgICAgIH1cblxuICAgICAgcG9vbC5hZGQobyk7XG4gICAgfSxcblxuICAgIC8vIFVwZGF0ZSBzY29yZS4gIFNjb3JlIGlzIHRoZSBzY29yZSB3aXRob3V0IGhvdyBmYXIgdGhleSBoYXZlIGdvbmUgdXAuXG4gICAgdXBkYXRlU2NvcmU6IGZ1bmN0aW9uKGFkZGl0aW9uKSB7XG4gICAgICBhZGRpdGlvbiA9IGFkZGl0aW9uIHx8IDA7XG4gICAgICB0aGlzLnNjb3JlVXAgPSAoLXRoaXMuY2FtZXJhWU1pbiA+PSA5OTk5OTk5KSA/IDAgOlxuICAgICAgICBNYXRoLm1pbihNYXRoLm1heCgwLCAtdGhpcy5jYW1lcmFZTWluKSwgOTk5OTk5OSAtIDEpO1xuICAgICAgdGhpcy5zY29yZUNvbGxlY3QgPSAodGhpcy5zY29yZUNvbGxlY3QgfHwgMCkgKyBhZGRpdGlvbjtcbiAgICAgIHRoaXMuc2NvcmUgPSBNYXRoLnJvdW5kKHRoaXMuc2NvcmVVcCArIHRoaXMuc2NvcmVDb2xsZWN0KTtcblxuICAgICAgLy8gU2NvcmUgdGV4dFxuICAgICAgaWYgKCF0aGlzLnNjb3JlR3JvdXApIHtcbiAgICAgICAgdGhpcy5zY29yZUdyb3VwID0gdGhpcy5nYW1lLmFkZC5ncm91cCgpO1xuXG4gICAgICAgIC8vIFNjb3JlIHRleHRcbiAgICAgICAgdGhpcy5zY29yZVRleHQgPSBuZXcgUGhhc2VyLlRleHQodGhpcy5nYW1lLCB0aGlzLnBhZGRpbmcsIDAsXG4gICAgICAgICAgdGhpcy5zY29yZS50b0xvY2FsZVN0cmluZygpLCB7XG4gICAgICAgICAgICBmb250OiBcIlwiICsgKHRoaXMuZ2FtZS53b3JsZC5oZWlnaHQgLyAzMCkgKyBcInB4IE9tbmVzUm9tYW4tYm9sZFwiLFxuICAgICAgICAgICAgZmlsbDogXCIjMzliNTRhXCIsXG4gICAgICAgICAgICBhbGlnbjogXCJsZWZ0XCIsXG4gICAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuc2NvcmVUZXh0LmFuY2hvci5zZXRUbygwLCAwKTtcbiAgICAgICAgdGhpcy5zY29yZVRleHQuc2V0U2hhZG93KDEsIDEsIFwicmdiYSgwLCAwLCAwLCAwLjMpXCIsIDIpO1xuXG4gICAgICAgIC8vIEZpeCBzY29yZSB0byB0b3BcbiAgICAgICAgdGhpcy5zY29yZUdyb3VwLmZpeGVkVG9DYW1lcmEgPSB0cnVlO1xuICAgICAgICB0aGlzLnNjb3JlR3JvdXAuY2FtZXJhT2Zmc2V0LnNldFRvKHRoaXMucGFkZGluZywgdGhpcy5wYWRkaW5nKTtcblxuICAgICAgICAvLyBIYWNrIGFyb3VuZCBmb250LWxvYWRpbmcgaXNzdWVzXG4gICAgICAgIF8uZGVsYXkoXy5iaW5kKGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHRoaXMuc2NvcmVHcm91cC5hZGQodGhpcy5zY29yZVRleHQpO1xuICAgICAgICB9LCB0aGlzKSwgMTAwMCk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgdGhpcy5zY29yZVRleHQudGV4dCA9IHRoaXMuc2NvcmUudG9Mb2NhbGVTdHJpbmcoKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLy8gUmVzZXQgc2NvcmVcbiAgICByZXNldFNjb3JlOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2NvcmVVcCA9IDA7XG4gICAgICB0aGlzLnNjb3JlQ29sbGVjdCA9IDA7XG4gICAgICB0aGlzLnNjb3JlID0gMDtcbiAgICB9LFxuXG4gICAgLy8gUmVzZXQgdmlldyB0cmFja2luZ1xuICAgIHJlc2V0Vmlld1RyYWNraW5nOiBmdW5jdGlvbigpIHtcbiAgICAgIC8vIENhbWVyYSBhbmQgcGxhdGZvcm0gdHJhY2tpbmcgdmFyc1xuICAgICAgdGhpcy5jYW1lcmFZTWluID0gOTk5OTk5OTtcbiAgICAgIHRoaXMucGxhdGZvcm1ZTWluID0gOTk5OTk5OTtcbiAgICB9LFxuXG4gICAgLy8gR2VuZXJhbCB0b3VjaGluZ1xuICAgIGlzVG91Y2hpbmc6IGZ1bmN0aW9uKGJvZHkpIHtcbiAgICAgIGlmIChib2R5ICYmIGJvZHkudG91Y2gpIHtcbiAgICAgICAgcmV0dXJuIChib2R5LnRvdWNoaW5nLnVwIHx8IGJvZHkudG91Y2hpbmcuZG93biB8fFxuICAgICAgICAgIGJvZHkudG91Y2hpbmcubGVmdCB8fCBib2R5LnRvdWNoaW5nLnJpZ2h0KTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0sXG5cbiAgICAvLyBJbml0aWFsL2Jhc2UgZGlmZmljdWx0eS4gIENoYW5jZSBpcyBwcm9wYmFibGl0eS4gIEVhY2ggc2V0IGlzIGFkZGl0aXZlXG4gICAgLy8gc28gaXQgZG9lcyBub3QgaGF2ZSB0byBhZGQgdG8gMSwgYnV0IGl0J3MgZWFzaWVyIHRvIHRoaW5rIGluIHRoaXNcbiAgICAvLyB3YXkuXG4gICAgY2hhbmNlczoge1xuICAgICAgcGxhdGZvcm1zOiBbXG4gICAgICAgIFtcImNhcnJvdFwiLCAwXSxcbiAgICAgICAgW1wiYmVhblwiLCAxXVxuICAgICAgXSxcbiAgICAgIGhvdmVyOiBbXG4gICAgICAgIFtcIm5vbmVcIiwgMTVdLFxuICAgICAgICBbXCJob3ZlclwiLCAxXVxuICAgICAgXSxcbiAgICAgIGNhcnJvdEl0ZW1zOiBbXG4gICAgICAgIFtcIm5vbmVcIiwgMV0sXG4gICAgICAgIFtcIm1pbmlcIiwgMF0sXG4gICAgICAgIFtcImRpbGxcIiwgMF0sXG4gICAgICAgIFtcInBlcHBlclwiLCAwXSxcbiAgICAgICAgW1wiYm90XCIsIDBdXG4gICAgICBdLFxuICAgICAgYmVhbkl0ZW1zOiBbXG4gICAgICAgIFtcIm5vbmVcIiwgMTBdLFxuICAgICAgICBbXCJtaW5pXCIsIDNdLFxuICAgICAgICBbXCJkaWxsXCIsIDFdLFxuICAgICAgICBbXCJwZXBwZXJcIiwgMF0sXG4gICAgICAgIFtcImJvdFwiLCAwXVxuICAgICAgXVxuICAgIH0sXG5cbiAgICAvLyBMZXZlbHMuICBMZXZlbCBpZCwgYW1vdW50IHVwXG4gICAgbGV2ZWxzOiBbXG4gICAgICBbMCwgLTEwMF0sXG4gICAgICBbMSwgLTIwMDAwXSxcbiAgICAgIFsyLCAtNDUwMDBdLFxuICAgICAgWzMsIC04MDAwMF0sXG4gICAgICBbNCwgLTEyMDAwMF0sXG4gICAgICBbNSwgLTk5OTk5OV1cbiAgICBdLFxuXG4gICAgLy8gQ3VycmVudCBsZXZlbFxuICAgIGN1cnJlbnRMZXZlbDogMCxcblxuICAgIC8vIERldGVybWluZSBkaWZmaWN1bHR5XG4gICAgdXBkYXRlRGlmZmljdWx0eTogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgY2hhbmNlcztcblxuICAgICAgLy8gQ2FsY3VsYXRlIGxldmVsXG4gICAgICB0aGlzLmN1cnJlbnRMZXZlbCA9IF8uZmluZCh0aGlzLmxldmVscywgXy5iaW5kKGZ1bmN0aW9uKGwpIHtcbiAgICAgICAgcmV0dXJuIChsWzBdID09PSAwICYmICF0aGlzLmNhbWVyYVlNaW4pIHx8ICh0aGlzLmNhbWVyYVlNaW4gPiBsWzFdKTtcbiAgICAgIH0sIHRoaXMpKTtcblxuICAgICAgdGhpcy5jdXJyZW50TGV2ZWwgPSB0aGlzLmN1cnJlbnRMZXZlbCA/IHRoaXMuY3VycmVudExldmVsWzBdIDogdGhpcy5sZXZlbHNbdGhpcy5sZXZlbHMubGVuZ3RoIC0gMV1bMF07XG5cbiAgICAgIC8vIERldGVybWluZSBpZiB3ZSBuZWVkIHRvIHVwZGF0ZSBsZXZlbFxuICAgICAgaWYgKCFfLmlzVW5kZWZpbmVkKHRoaXMucHJldmlvdXNMZXZlbCkgJiYgdGhpcy5wcmV2aW91c0xldmVsID09PSB0aGlzLmN1cnJlbnRMZXZlbCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIE90aGVyIGRpZmZpY3VsdCBzZXR0aW5nc1xuICAgICAgdGhpcy5wbGF0Zm9ybVNwYWNlWSA9IDExMDtcbiAgICAgIHRoaXMucGxhdGZvcm1HYXBNYXggPSAyMDA7XG5cbiAgICAgIC8vIFNldCBpbml0aWFsIGJhY2tncm91bmRcbiAgICAgIHRoaXMuZ2FtZS5zdGFnZS5iYWNrZ3JvdW5kQ29sb3IgPSBcIiNiOGY0YmNcIjtcblxuICAgICAgLy8gWmVybyBsZXZlbCAoaW5pdGlhbCBzY3JlZW4pXG4gICAgICBpZiAodGhpcy5jdXJyZW50TGV2ZWwgPT09IDApIHtcbiAgICAgICAgLy8gRGVmYXVsdFxuICAgICAgICBjaGFuY2VzID0gXy5leHRlbmQoe30sIHRoaXMuY2hhbmNlcyk7XG4gICAgICB9XG5cbiAgICAgIC8vIEZpcnN0IGxldmVsXG4gICAgICBlbHNlIGlmICh0aGlzLmN1cnJlbnRMZXZlbCA9PT0gMSkge1xuICAgICAgICBjaGFuY2VzID0ge1xuICAgICAgICAgIHBsYXRmb3JtczogW1xuICAgICAgICAgICAgW1wiY2Fycm90XCIsIDFdLFxuICAgICAgICAgICAgW1wiYmVhblwiLCAxNV1cbiAgICAgICAgICBdLFxuICAgICAgICAgIGhvdmVyOiBbXG4gICAgICAgICAgICBbXCJub25lXCIsIDldLFxuICAgICAgICAgICAgW1wiaG92ZXJcIiwgMV1cbiAgICAgICAgICBdLFxuICAgICAgICAgIGJlYW5JdGVtczogW1xuICAgICAgICAgICAgW1wibm9uZVwiLCAxNV0sXG4gICAgICAgICAgICBbXCJtaW5pXCIsIDVdLFxuICAgICAgICAgICAgW1wiZGlsbFwiLCA1XSxcbiAgICAgICAgICAgIFtcInBlcHBlclwiLCAxXSxcbiAgICAgICAgICAgIFtcImJvdFwiLCAxXVxuICAgICAgICAgIF0sXG4gICAgICAgICAgY2Fycm90SXRlbXM6IFtcbiAgICAgICAgICAgIFtcIm5vbmVcIiwgMTVdLFxuICAgICAgICAgICAgW1wibWluaVwiLCA1XSxcbiAgICAgICAgICAgIFtcImRpbGxcIiwgNV0sXG4gICAgICAgICAgICBbXCJwZXBwZXJcIiwgMV0sXG4gICAgICAgICAgICBbXCJib3RcIiwgMV1cbiAgICAgICAgICBdXG4gICAgICAgIH07XG4gICAgICB9XG5cbiAgICAgIC8vIFNlY29uZCBsZXZlbFxuICAgICAgZWxzZSBpZiAodGhpcy5jdXJyZW50TGV2ZWwgPT09IDIpIHtcbiAgICAgICAgdGhpcy5nYW1lLnN0YWdlLmJhY2tncm91bmRDb2xvciA9IFwiIzg4ZDFkMFwiO1xuXG4gICAgICAgIGNoYW5jZXMgPSB7XG4gICAgICAgICAgcGxhdGZvcm1zOiBbXG4gICAgICAgICAgICBbXCJjYXJyb3RcIiwgMV0sXG4gICAgICAgICAgICBbXCJiZWFuXCIsIDldXG4gICAgICAgICAgXSxcbiAgICAgICAgICBob3ZlcjogW1xuICAgICAgICAgICAgW1wibm9uZVwiLCA4XSxcbiAgICAgICAgICAgIFtcImhvdmVyXCIsIDFdXG4gICAgICAgICAgXSxcbiAgICAgICAgICBjYXJyb3RJdGVtczogW1xuICAgICAgICAgICAgW1wibm9uZVwiLCA4XSxcbiAgICAgICAgICAgIFtcIm1pbmlcIiwgMi41XSxcbiAgICAgICAgICAgIFtcImRpbGxcIiwgMl0sXG4gICAgICAgICAgICBbXCJwZXBwZXJcIiwgMV0sXG4gICAgICAgICAgICBbXCJib3RcIiwgMS41XVxuICAgICAgICAgIF0sXG4gICAgICAgICAgYmVhbkl0ZW1zOiBbXG4gICAgICAgICAgICBbXCJub25lXCIsIDhdLFxuICAgICAgICAgICAgW1wibWluaVwiLCAyLjVdLFxuICAgICAgICAgICAgW1wiZGlsbFwiLCAyXSxcbiAgICAgICAgICAgIFtcInBlcHBlclwiLCAxXSxcbiAgICAgICAgICAgIFtcImJvdFwiLCAxLjVdXG4gICAgICAgICAgXVxuICAgICAgICB9O1xuICAgICAgfVxuXG4gICAgICAvLyBUaGlyZCBsZXZlbFxuICAgICAgZWxzZSBpZiAodGhpcy5jdXJyZW50TGV2ZWwgPT09IDMpIHtcbiAgICAgICAgdGhpcy5nYW1lLnN0YWdlLmJhY2tncm91bmRDb2xvciA9IFwiIzU5YWNjNlwiO1xuXG4gICAgICAgIGNoYW5jZXMgPSB7XG4gICAgICAgICAgcGxhdGZvcm1zOiBbXG4gICAgICAgICAgICBbXCJjYXJyb3RcIiwgNF0sXG4gICAgICAgICAgICBbXCJiZWFuXCIsIDZdXG4gICAgICAgICAgXSxcbiAgICAgICAgICBob3ZlcjogW1xuICAgICAgICAgICAgW1wibm9uZVwiLCA3XSxcbiAgICAgICAgICAgIFtcImhvdmVyXCIsIDFdXG4gICAgICAgICAgXSxcbiAgICAgICAgICBjYXJyb3RJdGVtczogW1xuICAgICAgICAgICAgW1wibm9uZVwiLCA2XSxcbiAgICAgICAgICAgIFtcIm1pbmlcIiwgMV0sXG4gICAgICAgICAgICBbXCJkaWxsXCIsIDJdLFxuICAgICAgICAgICAgW1wicGVwcGVyXCIsIDAuNV0sXG4gICAgICAgICAgICBbXCJib3RcIiwgMl1cbiAgICAgICAgICBdLFxuICAgICAgICAgIGJlYW5JdGVtczogW1xuICAgICAgICAgICAgW1wibm9uZVwiLCA2XSxcbiAgICAgICAgICAgIFtcIm1pbmlcIiwgMV0sXG4gICAgICAgICAgICBbXCJkaWxsXCIsIDJdLFxuICAgICAgICAgICAgW1wicGVwcGVyXCIsIDAuNV0sXG4gICAgICAgICAgICBbXCJib3RcIiwgMl1cbiAgICAgICAgICBdXG4gICAgICAgIH07XG4gICAgICB9XG5cbiAgICAgIC8vIEZvdXJ0aCBsZXZlbFxuICAgICAgZWxzZSBpZiAodGhpcy5jdXJyZW50TGV2ZWwgPT09IDQpIHtcbiAgICAgICAgdGhpcy5iZ0dyb3VwLnZpc2libGUgPSB0cnVlO1xuXG4gICAgICAgIGNoYW5jZXMgPSB7XG4gICAgICAgICAgcGxhdGZvcm1zOiBbXG4gICAgICAgICAgICBbXCJjYXJyb3RcIiwgOF0sXG4gICAgICAgICAgICBbXCJiZWFuXCIsIDJdXG4gICAgICAgICAgXSxcbiAgICAgICAgICBob3ZlcjogW1xuICAgICAgICAgICAgW1wibm9uZVwiLCA3XSxcbiAgICAgICAgICAgIFtcImhvdmVyXCIsIDFdXG4gICAgICAgICAgXSxcbiAgICAgICAgICBjYXJyb3RJdGVtczogW1xuICAgICAgICAgICAgW1wibm9uZVwiLCAzXSxcbiAgICAgICAgICAgIFtcIm1pbmlcIiwgMV0sXG4gICAgICAgICAgICBbXCJkaWxsXCIsIDJdLFxuICAgICAgICAgICAgW1wicGVwcGVyXCIsIDAuNV0sXG4gICAgICAgICAgICBbXCJib3RcIiwgM11cbiAgICAgICAgICBdLFxuICAgICAgICAgIGJlYW5JdGVtczogW1xuICAgICAgICAgICAgW1wibm9uZVwiLCAzXSxcbiAgICAgICAgICAgIFtcIm1pbmlcIiwgMV0sXG4gICAgICAgICAgICBbXCJkaWxsXCIsIDJdLFxuICAgICAgICAgICAgW1wicGVwcGVyXCIsIDAuNV0sXG4gICAgICAgICAgICBbXCJib3RcIiwgM11cbiAgICAgICAgICBdXG4gICAgICAgIH07XG4gICAgICB9XG5cbiAgICAgIC8vIEZvdXJ0aCBsZXZlbFxuICAgICAgZWxzZSB7XG4gICAgICAgIHRoaXMuYmdHcm91cC52aXNpYmxlID0gZmFsc2U7XG4gICAgICAgIHRoaXMuZ2FtZS5zdGFnZS5iYWNrZ3JvdW5kQ29sb3IgPSBcIiMxMjEyMTJcIjtcblxuICAgICAgICBjaGFuY2VzID0ge1xuICAgICAgICAgIHBsYXRmb3JtczogW1xuICAgICAgICAgICAgW1wiY2Fycm90XCIsIDMwXSxcbiAgICAgICAgICAgIFtcImJlYW5cIiwgMV1cbiAgICAgICAgICBdLFxuICAgICAgICAgIGhvdmVyOiBbXG4gICAgICAgICAgICBbXCJub25lXCIsIDRdLFxuICAgICAgICAgICAgW1wiaG92ZXJcIiwgMV1cbiAgICAgICAgICBdLFxuICAgICAgICAgIGNhcnJvdEl0ZW1zOiBbXG4gICAgICAgICAgICBbXCJub25lXCIsIDBdLFxuICAgICAgICAgICAgW1wibWluaVwiLCAwXSxcbiAgICAgICAgICAgIFtcImRpbGxcIiwgMF0sXG4gICAgICAgICAgICBbXCJwZXBwZXJcIiwgMF0sXG4gICAgICAgICAgICBbXCJib3RcIiwgMV1cbiAgICAgICAgICBdLFxuICAgICAgICAgIGJlYW5JdGVtczogW1xuICAgICAgICAgICAgW1wibm9uZVwiLCAwXSxcbiAgICAgICAgICAgIFtcIm1pbmlcIiwgMF0sXG4gICAgICAgICAgICBbXCJkaWxsXCIsIDBdLFxuICAgICAgICAgICAgW1wicGVwcGVyXCIsIDBdLFxuICAgICAgICAgICAgW1wiYm90XCIsIDFdXG4gICAgICAgICAgXVxuICAgICAgICB9O1xuICAgICAgfVxuXG4gICAgICAvLyBNYWtlIGNoYW5jZSBmdW5jdGlvblxuICAgICAgdGhpcy5nZW5lcmF0ZUNoYW5jZShjaGFuY2VzKTtcblxuICAgICAgLy8gS2VlcCB0cmFjayBvZiBsZXZlbCB0byBzZWUgaWYgaXQgY2hhbmdlc1xuICAgICAgdGhpcy5wcmV2aW91c0xldmVsID0gdGhpcy5jdXJyZW50TGV2ZWw7XG4gICAgfSxcblxuICAgIC8vIEdlbmVyYXRlIGNoYW5jZSBmdW5jdGlvblxuICAgIGdlbmVyYXRlQ2hhbmNlOiBmdW5jdGlvbihjaGFuY2VzKSB7XG4gICAgICAvLyBBZGQgdXAgc2V0c1xuICAgICAgdmFyIHNldHMgPSB7fTtcbiAgICAgIF8uZWFjaChjaGFuY2VzLCBmdW5jdGlvbihzZXQsIHNpKSB7XG4gICAgICAgIC8vIEdldCB0b3RhbFxuICAgICAgICB2YXIgdG90YWwgPSBfLnJlZHVjZShzZXQsIGZ1bmN0aW9uKHRvdGFsLCBjaGFuY2UpIHtcbiAgICAgICAgICByZXR1cm4gdG90YWwgKyBjaGFuY2VbMV07XG4gICAgICAgIH0sIDApO1xuXG4gICAgICAgIC8vIENyZWF0ZSBuZXcgYXJyYXkgd2l0aCBtaW4gYW5kIG1heFxuICAgICAgICB2YXIgaXRlbXMgPSBbXTtcbiAgICAgICAgXy5yZWR1Y2Uoc2V0LCBmdW5jdGlvbih0b3RhbCwgY2hhbmNlKSB7XG4gICAgICAgICAgaXRlbXMucHVzaCh7XG4gICAgICAgICAgICBtaW46IHRvdGFsLFxuICAgICAgICAgICAgbWF4OiB0b3RhbCArIGNoYW5jZVsxXSxcbiAgICAgICAgICAgIHZhbDogY2hhbmNlWzBdXG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICByZXR1cm4gdG90YWwgKyBjaGFuY2VbMV07XG4gICAgICAgIH0sIDApO1xuXG4gICAgICAgIHNldHNbc2ldID0ge1xuICAgICAgICAgIHRvdGFsOiB0b3RhbCxcbiAgICAgICAgICByYW5kb206IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIE1hdGgucmFuZG9tKCkgKiB0b3RhbDtcbiAgICAgICAgICB9LFxuXG4gICAgICAgICAgaXRlbXM6IGl0ZW1zXG4gICAgICAgIH07XG4gICAgICB9KTtcblxuICAgICAgLy8gTWFrZSBmdW5jdGlvblxuICAgICAgdGhpcy5jaGFuY2UgPSBmdW5jdGlvbihzZXQpIHtcbiAgICAgICAgdmFyIGMgPSBzZXRzW3NldF0ucmFuZG9tKCk7XG4gICAgICAgIHZhciBmID0gXy5maW5kKHNldHNbc2V0XS5pdGVtcywgZnVuY3Rpb24oaSkge1xuICAgICAgICAgIHJldHVybiAoYyA+PSBpLm1pbiAmJiBjIDwgaS5tYXgpO1xuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gZi52YWw7XG4gICAgICB9O1xuXG4gICAgICAvKlxuICAgICAgXy5lYWNoKF8ucmFuZ2UoMTAwKSwgXy5iaW5kKGZ1bmN0aW9uKCkge1xuICAgICAgICBjb25zb2xlLmxvZyh0aGlzLmNoYW5jZShcImJlYW5JdGVtc1wiKSk7XG4gICAgICB9LCB0aGlzKSk7XG4gICAgICAqL1xuICAgIH0sXG5cbiAgICAvLyBDcmVhdGUgc3VwZXIgbGV2ZWwgZ3JhZGllbnRcbiAgICBjcmVhdGVTdXBlckxldmVsQkc6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zbGJnQk0gPSB0aGlzLmdhbWUubWFrZS5iaXRtYXBEYXRhKHRoaXMuZ2FtZS53aWR0aCwgdGhpcy5nYW1lLmhlaWdodCk7XG5cbiAgICAgIC8vIENyZWF0ZSBncmFkaWVudFxuICAgICAgdmFyIGdyYWRpZW50ID0gdGhpcy5zbGJnQk0uY29udGV4dC5jcmVhdGVMaW5lYXJHcmFkaWVudChcbiAgICAgICAgMCwgdGhpcy5nYW1lLmhlaWdodCAvIDIsIHRoaXMuZ2FtZS53aWR0aCwgdGhpcy5nYW1lLmhlaWdodCAvIDIpO1xuICAgICAgZ3JhZGllbnQuYWRkQ29sb3JTdG9wKDAsIFwiIzRGM0Y5QVwiKTtcbiAgICAgIGdyYWRpZW50LmFkZENvbG9yU3RvcCgxLCBcIiNFNzBCOERcIik7XG5cbiAgICAgIC8vIEFkZCB0byBiaXRtYXBcbiAgICAgIHRoaXMuc2xiZ0JNLmNvbnRleHQuZmlsbFN0eWxlID0gZ3JhZGllbnQ7XG4gICAgICB0aGlzLnNsYmdCTS5jb250ZXh0LmZpbGxSZWN0KDAsIDAsIHRoaXMuZ2FtZS53aWR0aCwgdGhpcy5nYW1lLmhlaWdodCk7XG5cbiAgICAgIC8vIENyZWF0ZSBiYWNrZ3JvdW5kIGdyb3VwIHNvIHRoYXQgd2UgY2FuIHB1dCB0aGlzIHRoZXJlIGxhdGVyXG4gICAgICB0aGlzLmJnR3JvdXAgPSB0aGlzLmdhbWUuYWRkLmdyb3VwKCk7XG4gICAgICB0aGlzLmJnR3JvdXAuZml4ZWRUb0NhbWVyYSA9IHRydWU7XG5cbiAgICAgIC8vIEFkZCBjcmF6eSBiYWNrZ3JvdW5kIGFuZCB0aGVuIGhpZGUgc2luY2UgYWRkaW5nIGluIG1pZGRsZVxuICAgICAgLy8gcmVhbGx5IG1lc3NlcyB3aXRoIHRoaW5nc1xuICAgICAgdGhpcy5iZ0dyb3VwLmNyZWF0ZSgwLCAwLCB0aGlzLnNsYmdCTSk7XG4gICAgICB0aGlzLmJnR3JvdXAudmlzaWJsZSA9IGZhbHNlO1xuICAgIH0sXG5cbiAgICAvLyBTZXQgb24gZmlyZVxuICAgIHNldE9uRmlyZTogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLm9uRmlyZSA9IHRydWU7XG4gICAgICB0aGlzLmhlcm8uc2V0T25GaXJlKCk7XG4gICAgfSxcblxuICAgIC8vIFNldCBvZmYgZmlyZVxuICAgIHB1dE91dEZpcmU6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5vbkZpcmUgPSBmYWxzZTtcbiAgICAgIHRoaXMuaGVyby5wdXRPdXRGaXJlKCk7XG4gICAgfVxuICB9KTtcblxuICAvLyBFeHBvcnRcbiAgbW9kdWxlLmV4cG9ydHMgPSBQbGF5O1xufSkoKTtcbiJdfQ==
