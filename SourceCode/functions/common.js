module.exports.findAllInArray = (model, nameColumn, extras) => {
    return new Promise((resolve, reject) => {
        var dataArray = [];
        model.findAll().then((data) => {
            data.forEach(element => {
                var entry = element.dataValues;
                entry.index = index;
                dataArray.push(element.dataValues);
            });

            dataArray.sort((a,b) => {
                var nameA = a[nameColumn].toUpperCase();
                var nameB = b[nameColumn].toUpperCase();

                if(nameA < nameB){
                    return -1;
                } else if(nameA > nameB){
                    return 1;
                } else {
                    return 0;
                }
            });

            var index = 1;
            dataArray.forEach((element) => {
                element.index = index;

                if(extras != null){
                    extras.forEach(ex => {
                        var model = ex.model;
                        var idColumn = ex.idColumn;
                        var nameColumn = ex.nameColumn;
    
                        model.findByPk(element[idColumn]).then((data) => {
                            element[nameColumn] = data.get()[nameColumn];
                        });
                    });
                }

                index++;
            });

            resolve(dataArray);
        }).catch((e) => {
            reject(e);
        });
    });
}

module.exports.findOneAndCreate = (model, columnName, name, object, req, res, redirect, messages) => {
    var query = {
        where: {}
    };
    query.where[columnName] = name;
    model.findOne(query).then((data) => {
        if(data == null){
            model.create(object).then(() => {
                req.flash('success_msg', messages.success_mgs);
                res.redirect(redirect);
            });
        } else {
            req.flash('error_msg', messages.error_msg);
            res.redirect(redirect);
        }
    }).catch((e) => {
        req.flash('error_msg', e.message);
        res.redirect(redirect);
    });
}