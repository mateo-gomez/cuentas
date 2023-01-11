export default {
    income: 3000000,
    outcome: -2000000,
    balance: 1000000,

    accounts: ["Todas las cuentas", "bancolombia", "rappicard"],

    transactions: [
        {
            timestamp: 1673139385096,
            value: -200000,
            cuenta: "bancolombia",
            type: "outcome",
            category: "Mercado",
            description: "Mercado del mes",
        },
        {
            timestamp: 1673139385034,
            value: -100000,
            cuenta: "bancolombia",
            type: "outcome",
            category: "Ropa",
            description: "Camiseta",
        },
        {
            timestamp: 1673139382345,
            value: 1500000,
            cuenta: "bancolombia",
            type: "income",
            category: "Nómina",
            description: "Salario",
        },
    ],
}
