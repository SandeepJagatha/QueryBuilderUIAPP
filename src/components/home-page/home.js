import ko from 'knockout';
import homeTemplate from 'text!./home.html';
import dateService from '../services/service';
import Caret from '../../bower_modules/Caret.js/dist/jquery.caret';
import atJS from '../../bower_modules/At.js/dist/js/jquery.atwho';
import fontawesome from '../../bower_modules/fontawesome5/svg-with-js/js/fontawesome-all';
import XRegExp from '../../../node_modules/xregexp/xregexp-all';
import 'jquery-ui';

class HomeViewModel {

    constructor(route) {
        var self = this;
        self.message = ko.observable('Welcome to QueryBuilderApp!');
        self.tables = ko.observableArray();
        self.schemas = ko.observableArray();

        self.tableData = ko.observableArray();

        self.showSchemasList = ko.observable(true);
        self.showSelectedSchemasList = ko.observable(false);
        self.showSelectedTypeList = ko.observable(false);

        self.mysqlKeywords = ko.observableArray();
        self.colNames = ko.observableArray();
        self.getDatabases();
        self.schemaOptions = ko.observableArray([{
                name: "Tables",
                imgUrl: "https://bizforce.com/wp-content/uploads/icon-db-maintenance-teal.png",
                className: "fas fa-cogs"
            },
            {
                name: "Procedures",
                imgUrl: "https://bizforce.com/wp-content/uploads/icon-tools-teal.png",
                className: "fas fa-pencil-alt"
            },
            {
                name: "Views",
                imgUrl: "https://bizforce.com/wp-content/uploads/icon-check-green.png",
                className: "fas fa-cogs"
            }
        ]);
        self.breadCrumbs = ko.observableArray([{
            title: "showSchemas",
            displayName: "Schemas",
            active: ko.observable(true)
        }]);
        self.afterRender = function () {
            $("#showSelectedTypeList li").draggable({
                helper: "clone"
            });
        };

        self.typeSelected = ko.observable();
        self.selectedSchema = ko.observableArray();
        self.selectedType = ko.observableArray();
        self.selectedTable = ko.observableArray();
        self.someValue = ko.observable();

        // Update breadcrumbs on each item selection
        self.breadCrumbClicked = function (selectedBC, event) {
            console.log(selectedBC);
            console.log(self.breadCrumbs());
            var context = ko.contextFor(event.target);
            var index = context.$index() + 1;

            if (selectedBC.title == "showSchemas") {
                self.showSchemasListClicked();
            } else if (selectedBC.title == "showTypes") {
                self.itemClicked(self.selectedSchema());
            }
            console.log(index);
            if (index >= 1) {
                self.breadCrumbs.splice(index);
                self.breadCrumbs()[index - 1].active(false);
            }
            console.log(self.breadCrumbs());
        }

        // show list of schemas list in UI
        self.showSchemasListClicked = function () {
            // self.getDatabases();

            console.log(self.schemas());
            self.tableData(self.schemas());
            console.log(self.tableData());

            self.showSelectedSchemasList(false);
            self.showSelectedTypeList(false);
            self.showSchemasList(true);
        }

        // When schema is selected
        self.itemClicked = function (selectedItem) {
            console.log(selectedItem);

            self.showSchemasList(false);
            self.showSelectedSchemasList(true);
            self.showSelectedTypeList(false);

            ko.utils.arrayForEach(self.breadCrumbs(), function (bc) {
                bc.active(true)
            });
            self.breadCrumbs.push({
                title: "showTypes",
                displayName: selectedItem.name,
                active: ko.observable(false)
            });
            self.selectedSchema(selectedItem);
        }

        // When 'Tables'/'Procedures'/'View' tile is clicked
        self.typeClicked = function (type) {
            console.log(type);
            self.showSchemasList(false);
            self.showSelectedSchemasList(false);
            self.showSelectedTypeList(true);

            self.selectedType(type);

            var obj = {
                title: "showTypesList",
                displayName: null,
                active: ko.observable(false)
            };

            if (type.name == "Tables") {
                self.tableData(self.selectedSchema().tableNames);
                obj.displayName = "Tables";
            } else if (type.name == "Procedures") {
                obj.displayName = "Procedures";
                self.tableData(self.selectedSchema().storedProcedures);
            } else if (type.name == "Views") {
                obj.displayName = "Views";
                self.tableData(self.selectedSchema().views);
            }
            ko.utils.arrayForEach(self.breadCrumbs(), function (bc) {
                bc.active(true)
            });
            self.breadCrumbs.push(obj);

            self.renderVisualQueryBox();
        }

        self.fieldTypeClicked = function (fieldType) {
            console.log(fieldType);
        }
    }

    // webservice call to get all schema details
    getDatabases() {
        var self = this;

        $.ajax({
            type: "GET",
            contentType: "application/json",
            url: 'http://localhost:8080/queryBuilder/getDatabaseTables',
            dataType: "json",
            success: function (data) {
                console.log(data);
                self.schemas(data);
                self.tableData(data);
            }
        });
    }

    //When tables are selected making li elements as droppable and activating autocomplete
    renderVisualQueryBox() {
        var self = this;
        // making #inputor as a droppable
        $("#inputor").droppable({
            accept: "#showSelectedTypeList li",
            drop: function (event, ui) {
                console.log(ui.draggable.text());

                var $txt = $("#inputor");
                var caretPos = $txt[0].selectionStart;
                var textAreaTxt = $txt.val();
                var txtToAdd = ui.draggable.text();
                $txt.val(textAreaTxt.substring(0, caretPos) + " , " + txtToAdd + textAreaTxt.substring(caretPos));
            }
        });

        self.mysqlKeywords.removeAll();

        // creating a list of all keywords
        var mKeywords = ['ADD', 'AND', 'BEFORE', 'BY', 'CALL', 'FROM', 'LIKE', 'CREATE', 'CURRENT_DATE', 'DROP', 'FOR', 'EXISTS', 'INNER', 'JOIN', 'IF',
            'CASE', 'CONDITION', 'DELETE', 'DESC', 'DESCRIBE', 'FROM', 'GROUP', 'IN', 'INDEX', 'INSERT', 'INTERVAL', 'IS', 'KEY', 'LIKE', 'LIMIT',
            'LONG', 'MATCH', 'NOT', 'OPTION', 'OR', 'ORDER', 'PARTITION', 'REFERENCES', 'SELECT', 'TABLE', 'TO',
            'UPDATE',
            'WHERE'
        ];
        var tableNamesList = [];
        var colNamesList = [];
        var dataArr = [];

        ko.utils.arrayPushAll(self.mysqlKeywords, mKeywords);

        self.schemas().forEach(function (element) {
            tableNamesList.push(...element.tableNamesList);

            for (var i = 0; i < element.tableNames.length; i++) {
                var tablename = element.tableNames[i].name;
                var columns = element.tableNames[i].columns;

                for (var x = 0; x < columns.length; x++) {
                    colNamesList.push(element.tableNames[i].name + '.' + columns[x].name);
                }
            }

        });

        ko.utils.arrayPushAll(self.mysqlKeywords, tableNamesList);
        ko.utils.arrayPushAll(self.mysqlKeywords, colNamesList);

        // remove duplicates
        var uniqueKeyWords = self.mysqlKeywords().filter(function (item, pos) {
            return self.mysqlKeywords().indexOf(item) == pos;
        });

        console.log(colNamesList);

        // textarea autocomplete
        var atWhoObj = {
            at: '',
            data: uniqueKeyWords,
            limit: 5,
            maxLen: 20,
            minLen: 1,
            startWithSpace: true,
            suffix: '',
            callbacks: {
                beforeInsert: function (value, $li) {
                    if ($($li[0]).children("span").length > 0) {
                        var tableName = $($li[0]).children("span").html();
                        return tableName + '.' + value;
                    } else {
                        return value;
                    }
                },
                filter: function (query, data, searchKey) {
                    if (!self.fileteredData) {
                        for (var i = 0; i < data.length; i++) {
                            dataArr.push(data[i].name.toString());
                        }

                        //
                        //
                        for (var i = 0, j = mKeywords.length; i < j; i++) {
                            if (data[dataArr.indexOf(mKeywords[i])].name == mKeywords[i]) {
                                data[dataArr.indexOf(mKeywords[i])].type = "keyword";
                            }
                        }
                        for (var i = 0, j = colNamesList.length; i < j; i++) {
                            if (data[dataArr.indexOf(colNamesList[i])].name == colNamesList[i]) {
                                data[dataArr.indexOf(colNamesList[i])].type = "colnames";

                                var arr = colNamesList[i].split('.');
                                data[dataArr.indexOf(colNamesList[i])].tableName = arr[0];
                                data[dataArr.indexOf(colNamesList[i])].colName = arr[1];
                                data[dataArr.indexOf(colNamesList[i])].name = arr[1];
                            }
                        }
                        for (var i = 0, j = tableNamesList.length; i < j; i++) {
                            if (data[dataArr.indexOf(tableNamesList[i])].name == tableNamesList[i]) {
                                data[dataArr.indexOf(tableNamesList[i])].type = "tableName";
                            }
                        }
                        self.fileteredData = true;
                    }
                    return data;
                },
                beforeReposition: function (offset) {
                    var caretPos = $('#inputor').caret('offset');
                    offset.left = caretPos.left + 6;
                    offset.top = caretPos.top + 16;

                    // position the atwho-container based on width of textarea
                    var inputorLeft = $('#inputor')[0].getBoundingClientRect().left;
                    var inputorWidth = $('#inputor')[0].getBoundingClientRect().width;
                    var cursorLeft = caretPos.left;
                    var boxToCursorDiff = cursorLeft - inputorLeft;
                    var atwhoContainerWidth = $('#atwho-ground-inputor div')[0].getBoundingClientRect().width;
                    var width = boxToCursorDiff + atwhoContainerWidth;

                    if (width < inputorWidth) {
                        return offset;
                    } else {
                        var space = boxToCursorDiff - atwhoContainerWidth;
                        offset.left = offset.left - boxToCursorDiff;
                        if (space > 0) {
                            offset.left = offset.left + space;
                        }
                        return offset;
                    }
                }
            }
        };

        $('#inputor')
            .atwho(atWhoObj);
        // .atwho({
        //     at: " ",
        //     startWithSpace: false,
        //     data: colNamesList,
        //     limit: 5,
        //     maxLen: 20,
        //     minLen: 1,
        //     suffix: '',
        //     callbacks: {
        //         filter: function (query, data, searchKey) {
        //             if (!self.fileteredData1) {
        //                 data.forEach(function (element) {
        //                     console.log(element);
        //                     var arr = element.name.split('.');
        //                     element.tableName = arr[0];
        //                     element.colName = arr[1];
        //                     element.name = arr[1];
        //                     element.type = "colnames";
        //                 });
        //                 self.fileteredData1 = true;
        //             } else {

        //             }
        //             return data;
        //         },
        //         beforeReposition: atWhoObj.beforeReposition
        //     }
        // });
    }


    queryValidator() {
        var query = $('#inputor').val();
        console.log(query);

        $.ajax({
            type: "GET",
            contentType: "application/json",
            data: {
                query: query
            },
            url: 'http://localhost:8080/queryBuilder/isQueryValid',
            dataType: "json",
            success: function (data) {
                console.log(data);
                alert(data.message);
            }
        });
    }

}

export default {
    viewModel: HomeViewModel,
    template: homeTemplate
};