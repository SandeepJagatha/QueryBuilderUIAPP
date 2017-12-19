import ko from 'knockout';

class DataViewModel {

    constructor(route) {
        this.message = ko.observable('Welcome to QueryBuilderApp!');
        this.sampleData = [{name : 'Name 1' , username:'Username 1' , id:1},
        {name : 'Name 2' , username:'Username 2' , id:2},
        {name : 'Name 3' , username:'Username 3' , id:3},
        {name : 'Name 4' , username:'Username 4' , id:4}
       ];
    }
    
    getDatabases() {
        return this.sampleData;
    }
}

export default { viewModel: DataViewModel };