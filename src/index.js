const express = require('express');
const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(express.json());

const customers = [];

//Middleware
function verifyIfExisteAccountCPF(req, res, next) {
    const { cpf } = req.headers;

    const customer = customers.find(customer => customer.cpf === cpf)

    if(!customer) {
        return res.status(400).json({error: "Customer not found!"});
    }

    req.customer = customer; //para recupear o objeto

    return next();

}

/*
- cpf : string
- name : string
- id : uuid
- statement :  []
*/

app.post("/account", (req, res) => {
    const { cpf, name } = req.body;

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