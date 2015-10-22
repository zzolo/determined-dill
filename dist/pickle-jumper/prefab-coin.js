/**
 * pickle-jumper - Pickle Jumper!
 * @version v0.0.1
 * @link https://github.com/zzolo/pickle-jumper#readme
 * @license MIT
 */
/* global _:false, Phaser:false */

/**
 * Prefab (objects) coin for platforms
 */

"use strict";

(function () {
  "use strict";
  var pj = window.pickleJumper = window.pickleJumper || {};
  pj.prefabs = pj.prefabs || {};

  // Constructor for coin
  pj.prefabs.Coin = function (game, x, y) {
    // Call default sprite
    Phaser.Sprite.call(this, game, x, y, "play-sprites", "magicdill.png");

    // Configure
    this.anchor.setTo(0.5, 0.5);
    this.scale.setTo(this.game.width / 20 / this.width);

    // Physics
    this.game.physics.arcade.enableBody(this);
    this.body.allowGravity = false;
    this.body.immovable = true;
  };

  // Extend from Sprite
  pj.prefabs.Coin.prototype = Object.create(Phaser.Sprite.prototype);
  pj.prefabs.Coin.prototype.constructor = pj.prefabs.Coin;

  // Add methods
  _.extend(pj.prefabs.Coin.prototype, {
    update: function update() {}
  });
})();