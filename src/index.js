const express = require('express');
const { get } = require('express/lib/response');
const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(express.json());

const customers = []; //array onde as contas dos clientes ficarão armazenadas.

//Middleware
function verifyIfExisteAccountCPF(req, res, next) {
    const { cpf } = req.headers;

    const customer = customers.find(customer => customer.cpf === cpf)

     /*
        método find retorna o primeiro item do array que atende a condição
    */

    if(!customer) {
        return res.status(400).json({error: "Customer not found!"});
    }

    req.customer = customer; //para recupear o objeto

    return next();
}

function getBalance(statement) {
    const balance = statement.reduce((acc, operation) => {
        if(operation.type === 'credit') {
            return acc + operation.amount;
        } else {
            return acc - operation.amount;
        }
    }, 0);

    return balance;
}

/*
- cpf : string
- name : string
- id : uuid
- statement :  []
*/

app.post("/account", (req, res) => {
    const { cpf, name } = req.body; //nome da variável entre {} quer dizer que foi feito um destruction atribuindo o valor da propriedade dentro da requisição e com o mesmo nome dado a variável. Eu acho... hauhauhauhau

    const customerAlreadyExists = customers.some(customer => customer.cpf === cpf)

    if(customerAlreadyExists) {
        return res.status(400).json({error: "Customer already exists!"});
    }

    customers.push({
        cpf,
        name,
        id: uuidv4(),
        statement: [],
    });

    return res.status(201).send();
});

app.get("/statement", verifyIfExisteAccountCPF,(req, res) => {    
    const { customer } = req; //dessa forma recupero o objeto passado no middleware

    return res.json(customer.statement)
})

app.post("/deposit", verifyIfExisteAccountCPF, (req, res) => {
    const { description, amount } = req.body;    
    const { customer } = req;
    const statementOperation = {
        description,
        amount,
        created_at: new Date(),
        type: "credit"
    }

    customer.statement.push(statementOperation);

    return res.status(201).send();
})

app.post("/withdraw", verifyIfExisteAccountCPF, (req, res) => {
    const { amount } = req.body;
    const { customer } = req;
    const balance = getBalance(customer.statement);

    if(balance < amount) {
        return res.status(400).json({error: "Insufficient funds!"})
    }

    const statementOperation = {        
        amount,
        created_at: new Date(),
        type: "debit"
    };

    customer.statement.push(statementOperation);

    return res.status(201).send()
})

app.get("/statement/date", verifyIfExisteAccountCPF, (req, res) => {
    const { customer } = req;
    const { date } = req.query;

    const dateFormat = new Date(date + " 00:00");
    //hack para fazer busca pela data intependente da hora

    const statement = customer.statement.filter((statement) => statement.created_at.toDateString() === new Date(dateFormat).toDateString())

    return res.json(statement)
})

app.put("/account", verifyIfExisteAccountCPF, (req, res) => {
    const { name } = req.body;
    const { customer } = req;

    customer.name = name;

    return res.status(201).send();
});

app.get("/account", verifyIfExisteAccountCPF, (req, res) => {    
    const { customer } = req;    

    return res.json(customer);
});

app.delete("/account", verifyIfExisteAccountCPF, (req, res) => {    
    const { customer } = req;  

    const indexCustomer = customers.findIndex(customerIndex => customerIndex.cpf === customer.cpf);
    //O que está acontecendo acima? o findIndex procura no array customers, em cada item do array (que no caso é o customerIndex). Ai confere o elemento.cpf é igual ao customer.cpf que no caso foi indicado pela pessoa fazendo a requisição. Desta forma encontra-se o indice exato da conta para ser deletada com o splice
    
    customers.splice(indexCustomer, 1)

    return res.status(200).json(customers);
})

app.get("/balance", verifyIfExisteAccountCPF, (req, res) => {
    const { customer } = req;

    const balance = getBalance(customer.statement);

    return res.json(balance)
})

app.listen(3333);

/*
METODOS

- GET : Buscar uma informação dentro do servidor;
- POST : Inserir uma informação no servidor;
- PUT : Alterar uma informação no servidor;
- PATCH : Alterar uma informação específica;
- DELETE : Deletar uma informação no servidor.

- - -  - - - - - - - - - - - - - - - - - - - - 
Tipos de Parâmetros

Route Params => Identificar um recurso editar/deletar/buscar;
Query Params => Paginação / Filtro
Body Params => Os objetos inserção/alterção (JSON)


app.get("/courses", (request, response) => {
    const query = request.query;
    console.log(query)
    return response.json(["Curso 1", "Curso 2", "Curso 3"]);
});

app.post("/courses", (request, response) => {
    const body = request.body;
    console.log(body)
    return response.json(["Curso 1", "Curso 2", "Curso 3", "Curso 4"]);
});

app.put("/courses/:id", (request, response) => {
    const {id} = request.params;
    console.log(id)
    return response.json(["Curso 6", "Curso 2", "Curso 3", "Curso 4"]);
});

app.patch("/courses/:id", (request, response) => {
    return response.json(["Curso 6", "Curso 7", "Curso 3", "Curso 4"]);
});

app.delete("/courses/:id", (request, response) => {
    return response.json(["Curso 6", "Curso 2", "Curso 4"]);
})

app.listen(3333);
*/