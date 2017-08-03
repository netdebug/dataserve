"use strict"

const Hooks = require("./hooks");

class Module {

    constructor(model) {
        this.model = model;
        
        this.hooks = {};

        this.validator = null;
    }

    get_hooks(command) {
        if (typeof this.hooks[command] !== "undefined") {
            return this.hooks[command];
        }
        let hooks = new Hooks(this.model);
        this[command](hooks);
        return this.hooks[command] = hooks;
    }

    get_validator() {
        if (!this.validator) {
            this.validator = require('validator');
        }
        return this.validator;
    }
   
    add(hooks) {
        hooks.add_pre(query => {
            return new Promise((resolve, reject) => {
                let validator = this.get_validator();
                let errors = {};
                
                for (let field in query.fields) {
                    if (!this.model.get_field(field).validate) {
                        continue;
                    }
                    if (!this.model.get_field(field).validate.add) {
                        continue;
                    }
                    let rules = this.model.get_field(field).validate.add.split("|");
                    for (let split of rules) {
                        let [rule, extra] = split.split(":");
                        if (rule == "min") {
                            if (parseInt(query.fields[field], 10)
                            errors[field] = "MIN FAILED";
                        } else if (rule == "max") {
                            
                        } else if (rule == "required") {
                        } else if (rule == "email") {
                        }
                        console.log(rule);
                    }
                }
                if (errors) {
                    return reject(errors);
                }
                resolve();
            });
        });
    }

    get(hooks) {
    }

    get_count(hooks) {
    }

    get_multi(hooks) {
    }
    
    lookup(hooks) {
        hooks.add_pre(query => {
            return new Promise((resolve, reject) => {
                let table_config = this.model.table_config();
                let where = [], bind = {}, input = null;
                if (input = query.raw('=')) {
                    for (let field in input) {
                        if (!this.model.get_field(field)) {
                            continue;
                        }
                        let vals = input[field];
                        if (!Array.isArray(vals)) {
                            vals = [vals];
                        }
                        if (this.model.get_field(field).type == "int") {
                            vals = int_array(vals);
                            where.push(query.alias + "." + field + " IN (" + vals.join(",") + ") ");
                        } else {
                            vals = [...new Set(vals)];
                            let wh = [], cnt = 1;
                            for (let val of vals) {
                                wh.push(":" + field + cnt);
                                bind[field + cnt] = val;
                                ++cnt;
                            }
                            where.push(field + " IN (" + wh.join(",") + ")");
                        }
                    }
                }
                if (input = query.raw("%search")) {
                    for (let field in input) {
                        if (!this.model.get_field(field)) {
                            continue;
                        }
                        where.push(query.alias + "." + field + " LIKE :" + field);
                        bind[field] = "%" + input[field];
                    }
                }
                if (input = query.raw("search%")) {
                    for (let field in input) {
                        if (!this.model.get_field(field)) {
                            continue;
                        }
                        where.push(query.alias + "." + field + " LIKE :" + field);
                        bind[field] = input[field] + "%";
                    }
                }
                if (input = query.raw("%search%")) {
                    for (let field in input) {
                        if (!this.model.get_field(field)) {
                            continue;
                        }
                        where.push(query.alias + "." + field + " LIKE :" + field);
                        bind[field] = "%" + input[field] + "%";
                    }
                }
                if (input = query.raw(">")) {
                    for (let field in input) {
                        if (!this.model.get_field(field)) {
                            continue;
                        }
                        where.push(":" + field + "_greater < " + query.alias + "." + field);
                        bind[field + "_greater"] = parseInt(input[field], 10);
                    }
                }
                if (input = query.raw(">=")) {
                    for (let field in input) {
                        if (!this.model.get_field(field)) {
                            continue;
                        }
                        where.push(":" + field + "_greater_equal <= " + query.alias + "." + field);
                        bind[field + "_greater_equal"] = parseInt(input[field], 10);
                    }
                }
                if (input = query.raw("<")) {
                    for (let field in input) {
                        if (!this.model.get_field(field)) {
                            continue;
                        }
                        where.push(query.alias + "." + field + " < :" + field + "_less");
                        bind[field + "_less"] = parseInt(input[field], 10);
                    }
                }
                if (input = query.raw("<=")) {
                    for (let field in input) {
                        if (!this.model.get_field(field)) {
                            continue;
                        }
                        where.push(query.alias + "." + field + ". <= :" + field + "_less_equal");
                        bind[field + "_less_equal"] = parseInt(input[field], 10);
                    }
                }
                if (input = query.raw("modulo")) {
                    for (let field in input) {
                        if (!this.model.get_field(field)) {
                            continue;
                        }
                        where.push(query.alias + "." + field + " % :" + field + "_modulo_mod = :" + field + "_modulo_val");
                        bind[field + "_modulo_mod"] = parseInt(input[field]["mod"], 10);
                        bind[field + "_modulo_val"] = parseInt(input[field]["val"], 10);
                    }
                }
                query.add_where(where, bind);
                resolve();
            });
        });
        hooks.add_post(result => {
            
            return result;
        });
    }

    remove(hooks) {
    }

    set(hooks) {
        hooks.add_pre(query => {
            
        });
    }
    
}

module.exports = Module;
