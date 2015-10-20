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
      this.game.load.atlas("game-sprites", "/assets/pickle-jumper-sprites.png", "/assets/pickle-jumper-sprites.json");
    },

    // Create
    create: function create() {
      // Set background
      this.game.stage.backgroundColor = "#33CCFF";

      // Config for difficulty
      this.platformSpaceY = 110;
      this.platformGapMax = 200;

      // Scaling
      this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
      this.game.scale.maxWidth = this.game.width;
      this.game.scale.maxHeight = this.game.height;
      this.game.scale.pageAlignHorizontally = true;
      this.game.scale.pageAlignVertically = true;

      // Camera and platform tracking vars
      this.cameraYMin = 9999999;
      this.platformYMin = 9999999;

      // Physics
      this.game.physics.startSystem(Phaser.Physics.ARCADE);
      this.game.physics.arcade.gravity.y = 1000;

      // Determine where first platform and hero will be
      this.startY = this.game.height - 50;
      this.hero = new pj.prefabs.Hero(this.game, this.game.width * 0.5, this.startY - 50);
      this.game.add.existing(this.hero);

      // Platforms
      this.addPlatforms();

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

      // Handle collisions
      this.game.physics.arcade.collide(this.hero, this.platforms);

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
    },

    // Game over
    gameOver: function gameOver() {
      console.log("gameover");
    },

    // Add platform pool and create initial one
    addPlatforms: function addPlatforms() {
      this.platforms = this.game.add.group();

      // Add first platform
      var first = new pj.prefabs.Platform(this.game, this.game.width * 0.5, this.startY);
      this.platforms.add(first);

      // Add new platforms
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
      var y = overrideY || this.platformYMin - this.platformSpaceY;
      var minX = platform.width / 2 + 10;
      var maxX = this.world.width - minX;

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
    },

    // Update score
    updateScore: function updateScore(change) {
      this.score = this.score || 0;
      this.score = this.score + change;

      // Score text
      if (!this.scoreText) {
        this.scoreText = this.game.add.text(this.game.world.width * 0.5, 20, "Score: " + this.score, {
          font: "bold " + this.game.world.height / 25 + "px Arial",
          fill: "#fff",
          align: "center"
        });
        this.scoreText.anchor.set(0.5);
      }

      // TODO: Update text
    }
  });
})();