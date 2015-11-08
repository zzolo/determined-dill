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
