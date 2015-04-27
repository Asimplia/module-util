
import Manager = require('../Manager');
import Sequence = require('./Sequence');
import ISequenceObject = require('./ISequenceObject');
import List = require('../../../Entity/List');
import mongoose = require('mongoose'); // only for typing

export = SequenceManager;
class SequenceManager extends Manager<Sequence, ISequenceObject, List<Sequence>> {

	constructor(connection: mongoose.Mongoose) {
		super(Sequence, List, connection);
	}
}
