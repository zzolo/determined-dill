/**
 * pickle-jumper - Pickle Jumper!
 * @version v0.0.1
 * @link https://github.com/zzolo/pickle-jumper#readme
 * @license MIT
 */
/* global _:false, Phaser:false */

/**
 * Prefab (objects) object for main character
 */

"use strict";

(function () {
  "use strict";
  var pj = window.pickleJumper = window.pickleJumper || {};
  pj.prefabs = pj.prefabs || {};

  // Constructor for main character
  pj.prefabs.main = function (game, x, y, texture) {
    // Call default sprite
    this.sprite = Phaser.Sprite.call(this, game, x, y, texture);
    this.game = game;
    this.game.physics.arcade.enable(this);
  };

  // Extend from state prototype
  _.extend(pj.states.game.prototype, Phaser.Sprite.prototype, {
    // Update
    update: function update() {}
  });
})();