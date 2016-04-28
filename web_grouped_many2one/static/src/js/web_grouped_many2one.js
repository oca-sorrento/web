odoo.define('web_grouped_many2one.form_relational', function(require) { 
"use strict";

var form_relational = require('web.form_relational');
var core = require('web.core');
var data = require('web.data');

var FieldMany2One = core.form_widget_registry.get('many2one');

FieldMany2One.include({
    get_search_result: function() {
        var self = this;
        var group_by = this.options.group_by;
        var result = this._super.apply(this, arguments);
        if (typeof this.options.group_by == 'undefined') return result;
        return result.then(function(d) {
            //Get group by field values
            var dataset = new data.DataSet(self, self.field.relation, self.build_context());
            //Remove the undefined ids (Search more buttons)
            var dr = _.filter(d, function(r) {
                return typeof r.id != 'undefined';
            });
            //Get list of ids
            var ids = _.map(dr, function(r) {
                return r.id;
            });
            var read = dataset.read_ids(ids, [group_by]);
            
            return read.then(function(records) {
                //Get the groups
                var groups = _.groupBy(records, function(r) { 
                    return r[group_by][1];
                });
                var items = [];
                //For each group add the group and the records of it
                for (var group in groups) {
                    items.push({
                        label: group,
                        value: group,
                        name: group,
                        id: null,
                        classname: 'o_grouped_many2one_group'
                    });
                    for (var i in groups[group]) {
                        //Find the already fetched name of the record
                        var get = _.filter(dr, function(d) { return d.id == groups[group][i].id; })[0];
                        items.push({
                            label: get['label'],
                            value: get['value'],
                            name: get['name'],
                            id: get['id']
                        });
                    }
                }
                //Add 'Search More' and 'Create and Edit' buttons
                items.push(d[d.length-2]);
                items.push(d[d.length-1]);
                return items;
            });
            
        });
    }
});

//core.form_widget_registry.add('grouped_many2one', FieldGroupedMany2One)
});