/**
 * @description An libary to mock an player.
 * @author Jaenster
 */


(function (module, require) {

	/** @class MockItem */
	const MockItem = require('MockItem');
	const Skills = require('Skills');

	function MockPlayer(settings) {
		Object.keys(settings).forEach(key => this[key] = settings[key]);
		const getTotal = (...args) => {
			const onMe = this.getStat.apply(this, args);
			const onItems = settings.gear.reduce((a, c) => a + (c.getStat.apply(c, args) || 0), 0);
			return onMe + onItems;
		};
		Object.defineProperties(this, {
			maxhp: {
				get: function () {
					return getTotal(sdk.stats.Maxhp) * (1 + (getTotal(sdk.stats.MaxhpPercent) / 100));
				}
			},
			maxmp: {
				get: function () {
					return getTotal(sdk.stats.Maxmana) * (1 + (getTotal(sdk.stats.MaxmanaPercent) / 100));
				}
			},
		});

		const softSkills = skillId => {
// soft skills
			const classType = Skills.class[skillId];
			const tabType = Skills.tab[skillId];
			const weaponswitch = this.weaponswitch;
			const ignoreSlots = [[sdk.body.LeftArmSecondary, sdk.body.RightArmSecondary], [sdk.body.LeftArm, sdk.body.RightArm]][me.weaponswitch];

			return this.gear.reduce((acc, item) => {
				const directSkills = item.getStat(sdk.stats.Singleskill, skillId) || 0;
				const oSkills = (item.getStat(sdk.stats.Nonclassskill, skillId) || 0);
				const classSkills = item.getStat(sdk.stats.Addclassskills, this.classid) || 0;
				const tabSkills = item.getStat(sdk.stats.AddskillTab, tabType) || 0;
				const allSkills = (item.getStat(sdk.stats.Allskills) || 0);
				// Check if its on our "other" slot, so we cant calculate its skill
				if (item.location === sdk.storage.Equipment && ignoreSlots.includes(item.bodylocation)) return acc;

				let total = 0;
				print('------> '+item.fname);

				// If this skillId, is part or our class,
				if (classType === this.classid) {
					print('directSkills:'+directSkills);
					print('classSkills:'+classSkills);
					print('tabSkills:'+tabSkills);

					// We can use direct skills
					total += directSkills;

					// We can use class skills aswell
					total += classSkills;

					// And the tab skills
					total += tabSkills;
				}
				print('oSkills:'+oSkills);
				print('allSkills:'+allSkills);

				// oskills always work no matter the class
				total += oSkills;

				// And "all skills" work on all ;)
				total += allSkills;

				print(total);
				return acc + total;
			}, 0)

		};

		this.getSkill = (...args) => {
			const [skillId, type] = args;
			if (type === undefined) {
				switch (skillId) {
					case 0: // right hand skill?
					case 1: // left hand skill?
					case 2: // ?
					case 3:	// ?
						break;
					case 4:// ?
						//ToDo; fix for items
						return this.overrides.skill; // just return all the skills the player has
				}
			}

			print(args);
			print(this.overrides.skill);
			print(skillId);
			const hardskills = (this.overrides.skill.find(skill => {
				print(skill[0]);
				print(skill[0] === skillId);
				return skill[0] === skillId;
			}) || [skillId, 0])[1];
			print(hardskills);
			print(type);
			if (!type) return hardskills;
			if (type === 1) return softSkills(skillId) + hardskills;
		}


	}


	MockPlayer.fromUnit = function (unit = me, settings = {}) {
		const gear = settings.gear = MockItem.fromGear(); // get Gear
		Object.keys(unit).forEach(key => typeof unit[key] !== 'function' && typeof unit[key] !== 'object' && (settings[key] = unit[key]));

		const states = [];
		for (let x = 0; x < 1000; x++) {
			const zero = me.getStat(x, 0);
			zero && states.push([x, 0, zero]);
			for (let y = 1; y < 1000; y++) {
				const second = me.getStat(x, y);
				second && second !== zero && states.push([x, y, zero]);
			}
		}
		const skills = me.getSkill(4).map(data => {
			// We need to just store the amount of harded skills
			return [data[0], data[1]];
		}).filter(data => data[1]); // only those the char actually has


		settings.overrides = {
			stat: states.map(stat => {
				const [major, minor, value] = stat;

				let gearStats = gear.reduce((acc, item) => acc + (item.getStat(major, minor) || 0), 0);
				let realValue;

				if ([sdk.stats.Maxhp, sdk.stats.Maxmana].includes(major)) {
					gearStats /= 256;
					const procentName = sdk.stats[Object.keys(sdk.stats).find(key => sdk.stats[key] === major) + 'Percent'];
					const otherStats = gear.reduce((acc, item) => acc + (item.getStat(procentName, minor) || 0), 0);

					// For max hp, we need to first remove the % life modifiers
					realValue = value / (100 + otherStats) * 100;

					// After that, we need to remove the remaining life given by items
					realValue -= gearStats;
				} else {
					realValue = value - gearStats;
				}
				return [major, minor, realValue];
			}).filter(x => x[2] && x[2] > 0),
			skill: skills,
		};
		return new MockPlayer(settings);
	};

	module.exports = MockPlayer;
}).call(null, module, require);