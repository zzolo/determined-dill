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
