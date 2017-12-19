# QueryBuilderUIAPP

<p>
The Visual Query Builder helps you construct complex database queries with autocomplete Keywords, Table name and Column names
</p>
<p>
And also provides query validation
</p>

<p>
Updated [Atwho.js](https://github.com/ichord/At.js/) to display three columns on autocomplete 
</p>

[Java Code](https://github.com/SandeepJagatha/QueryBuilderApp)


Resource urls:
* http://localhost:8080/queryBuilder/getDatabaseTables
```js
// to get all schemas, tables, columns, views, storedprocedures
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
```
* http://localhost:8080/queryBuilder/isQueryValid
```js
// to validate query
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
```


![alt text](https://github.com/SandeepJagatha/QueryBuilderApp/blob/master/src/main/resources/images/screenshot1.png)
![alt text](https://github.com/SandeepJagatha/QueryBuilderApp/blob/master/src/main/resources/images/screenshot2.png)
![alt text](https://github.com/SandeepJagatha/QueryBuilderApp/blob/master/src/main/resources/images/screenshot3.png)
