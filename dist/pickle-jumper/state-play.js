/**
 * pickle-jumper - Pickle Jumper!
 * @version v0.0.1
 * @link https://github.com/zzolo/pickle-jumper#readme
 * @license MIT
 */
/* global _:false, Phaser:false */

/**
 * Play state for Pickle Jumper
 */

"use strict";

(function () {
  "use strict";
  var pj = window.pickleJumper = window.pickleJumper || {};
  pj.states = pj.states || {};

  // Constructor for menu
  pj.states.Play = function () {
    Phaser.State.call(this);
  };

  // Extend from State
  pj.states.Play.prototype = Object.create(Phaser.State.prototype);
  pj.states.Play.prototype.constructor = pj.states.Game;

  // Add methods
  _.extend(pj.states.Play.prototype, Phaser.State.prototype, {
    // Preload
    preload: function preload() {
      // Load up game images
      this.game.load.atlas("play-sprites", "assets/determined-dill-sprites.png", "assets/determined-dill-sprites.json");
    },

    // Create
    create: function create() {
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
      this.hero = new pj.prefabs.Hero(this.game, 0, 0);
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
    update: function update() {
      // This is where the main magic happens
      // the y offset and the height of the world are adjusted
      // to match the highest point the hero has reached
      this.world.setBounds(0, -this.hero.yChange, this.game.world.width, this.game.height + this.hero.yChange);

      // The built in camera follow methods won't work for our needs
      // this is a custom follow style that will not ever move down, it only moves up
      this.cameraYMin = Math.min(this.cameraYMin, this.hero.y - this.game.height / 2);
      this.camera.y = this.cameraYMin;

      // If hero falls below camera
      if (this.hero.y > this.cameraYMin + this.game.height + 200) {
        this.gameOver();
      }

      // Move hero
      this.hero.body.velocity.x = this.cursors.left.isDown ? -(this.game.physics.arcade.gravity.y / 5) : this.cursors.right.isDown ? this.game.physics.arcade.gravity.y / 5 : 0;

      // Platform collisions
      this.game.physics.arcade.collide(this.hero, this.platforms, this.updateHeroPlatform, null, this);
      this.game.physics.arcade.collide(this.hero, this.base, this.updateHeroPlatform, null, this);

      // Coin collisions
      this.game.physics.arcade.overlap(this.hero, this.coins, function (hero, coin) {
        coin.kill();
        this.updateScore(this.scoreCoin);
      }, null, this);

      // Boosts collisions
      this.game.physics.arcade.overlap(this.hero, this.boosts, function (hero, boost) {
        boost.kill();
        this.updateScore(this.scoreBoost);
        hero.body.velocity.y = this.game.physics.arcade.gravity.y * -1 * 1.5;
      }, null, this);

      // Botulism collisions.  If herok jumps on top, then kill, otherwise die
      this.game.physics.arcade.collide(this.hero, this.bots, function (hero, bot) {
        if (hero.body.touching.down) {
          bot.kill();
          this.updateScore(this.scoreBot);
          hero.body.velocity.y = this.game.physics.arcade.gravity.y * -1 * 0.5;
        } else {
          this.gameOver();
        }
      }, null, this);

      // For each platform, find out which is the highest
      // if one goes below the camera view, then create a new
      // one at a distance from the highest one
      // these are pooled so they are very performant.
      this.platforms.forEachAlive(function (p) {
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
      ["coins", "boosts", "bots"].forEach(_.bind(function (pool) {
        this[pool].forEachAlive(function (p) {
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
    updateHeroPlatform: function updateHeroPlatform(hero) {
      hero.body.velocity.y = this.game.physics.arcade.gravity.y * -1 * 0.7;
    },

    // Shutdown
    shutdown: function shutdown() {
      // Reset everything, or the world will be messed up
      this.world.setBounds(0, 0, this.game.width, this.game.height);
      this.cursor = null;
      this.resetViewTracking();
      this.resetScore();

      ["hero", "platforms", "coins", "boosts", "scoreText"].forEach(_.bind(function (item) {
        this[item].destroy();
        this[item] = null;
      }, this));
    },

    // Game over
    gameOver: function gameOver() {
      // Can't seem to find a way to pass the score
      // via a state change.
      this.game.pickle.score = this.score;
      this.game.state.start("gameover");
    },

    // Add platform pool and create initial one
    addPlatforms: function addPlatforms() {
      this.platforms = this.game.add.group();

      // Add first platform.  TODO: Change to its own prefab, sprite
      this.base = new pj.prefabs.Platform(this.game, this.game.width * 0.5, this.startY, this.game.width * 2);
      this.game.add.existing(this.base);

      // Add some base platforms
      var previous;
      _.each(_.range(20), _.bind(function (i) {
        var p = new pj.prefabs.Platform(this.game, 0, 0);
        this.placePlatform(p, previous, this.world.height - this.platformSpaceY - this.platformSpaceY * i);
        this.platforms.add(p);
        previous = p;
      }, this));
    },

    // Place platform
    placePlatform: function placePlatform(platform, previousPlatform, overrideY) {
      platform.resetSettings();
      var y = overrideY || this.platformYMin - this.platformSpaceY;
      var minX = platform.minX;
      var maxX = platform.maxX;

      // Determine x based on previousPlatform
      var x = this.rnd.integerInRange(minX, maxX);
      if (previousPlatform) {
        x = this.rnd.integerInRange(previousPlatform.x - this.platformGapMax, previousPlatform.x + this.platformGapMax);

        // Some logic to try to wrap
        x = x < 0 ? Math.min(maxX, this.world.width + x) : Math.max(x, minX);
        x = x > this.world.width ? Math.max(minX, x - this.world.width) : Math.min(x, maxX);
      }

      // Place
      platform.reset(x, y);

      // Add some fluff
      this.fluffPlatform(platform);
    },

    // Add possible fluff to platform
    fluffPlatform: function fluffPlatform(platform) {
      var x = platform.x;
      var y = platform.y - platform.height / 2 - 30;

      // Add fluff
      if (Math.random() <= this.hoverChance) {
        platform.hover = true;
      } else if (Math.random() <= this.coinChance) {
        this.addWithPool(this.coins, "Coin", x, y);
      } else if (Math.random() <= this.boostChance) {
        this.addWithPool(this.boosts, "Boost", x, y);
      } else if (Math.random() <= this.botChance) {
        this.addWithPool(this.bots, "Botulism", x, y);
      }
    },

    // Generic add with pooling functionallity
    addWithPool: function addWithPool(pool, prefab, x, y) {
      var o = pool.getFirstDead();
      o = o || new pj.prefabs[prefab](this.game, x, y);

      // Use custom reset if available
      if (o.resetPlacement) {
        o.resetPlacement(x, y);
      } else {
        o.reset(x, y);
      }

      pool.add(o);
    },

    // Update score.  Score is the score without how far they have gone up.
    updateScore: function updateScore(addition) {
      addition = addition || 0;
      this.scoreUp = -this.cameraYMin >= 9999999 ? 0 : Math.min(Math.max(0, -this.cameraYMin), 9999999 - 1);
      this.scoreCollect = (this.scoreCollect || 0) + addition;
      this.score = Math.round(this.scoreUp + this.scoreCollect);

      // Score text
      if (!this.scoreText) {
        this.scoreText = this.game.add.text(10, this.game.height - 10, "Score: " + this.score, {
          font: "bold " + this.game.world.height / 25 + "px Arial",
          fill: "#fff",
          align: "center"
        });
        this.scoreText.anchor.set(0, 1);
        this.scoreText.fixedToCamera = true;
        this.scoreText.cameraOffset.setTo(10, this.game.height - 10);
      } else {
        this.scoreText.text = "Score: " + this.score;
      }
    },

    // Reset score
    resetScore: function resetScore() {
      this.scoreUp = 0;
      this.scoreCollect = 0;
      this.score = 0;
    },

    // Reset view tracking
    resetViewTracking: function resetViewTracking() {
      // Camera and platform tracking vars
      this.cameraYMin = 9999999;
      this.platformYMin = 9999999;
    },

    // General touching
    isTouching: function isTouching(body) {
      if (body && body.touch) {
        return body.touching.up || body.touching.down || body.touching.left || body.touching.right;
      }

      return false;
    }
  });
})();