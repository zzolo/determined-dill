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
      this.scoreMini = 250;
      this.scoreDill = 500;
      this.scorePepper = 750;
      this.scoreBot = 2000;

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
        // The super background is realy tough on non-hardware-accelarted
        // machines
        // this.bgGroup.visible = true;
        this.bgGroup.visible = false;
        this.game.stage.backgroundColor = "#000000";

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
            ["bot", 4]
          ],
          beanItems: [
            ["none", 3],
            ["mini", 1],
            ["dill", 2],
            ["pepper", 0.5],
            ["bot", 4]
          ]
        };
      }

      // Fourth level
      else {
        this.bgGroup.visible = false;
        this.game.stage.backgroundColor = "#000000";

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
