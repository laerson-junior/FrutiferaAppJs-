const PlantsManager = {
    storageKey: 'safra da serra-fruteiras', // Aqui guardamos as fruteiras no localStorage. É o "banco de dados" do navegador
    
    generateId: function() {
        return Date.now(); // Gera um ID único baseado no horário atual. Isso garante que o ID será sempre único.
    },
    
    getAll: function() {
        const plantsJSON = localStorage.getItem(this.storageKey); // Pega o item no localStorage usando a chave 'safra da serra-fruteiras'
        // Se tiver alguma coisa lá, transforma em objeto, se não, retorna um array vazio
        return plantsJSON ? JSON.parse(plantsJSON) : [];
    },
    
    save: function(plant) {
        const plants = this.getAll(); // Pega todas as plantas que já estão salvas no localStorage
        plant.id = this.generateId(); // A cada nova planta cadastrada, cria um ID único
        plants.push(plant); // Adiciona essa nova planta ao array
        localStorage.setItem(this.storageKey, JSON.stringify(plants)); // Salva a lista de plantas novamente no localStorage
        return plant; // Retorna a planta que foi salva
    },
    
    delete: function(id) {
        let plants = this.getAll(); // Pega todas as plantas novamente
        plants = plants.filter(plant => plant.id !== id); // Filtra a planta que vai ser excluída com base no ID
        localStorage.setItem(this.storageKey, JSON.stringify(plants)); // Atualiza o localStorage sem a planta excluída
    },
    
    calculateAgeInMonths: function(plantingDate) {
        const today = new Date(); // Pega a data atual
        const plantDate = new Date(plantingDate); // Pega a data de plantio da planta
        const diffTime = Math.abs(today - plantDate); // Calcula a diferença de tempo entre hoje e o plantio
        const diffMonths = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 30)); // Converte essa diferença para meses (aproximadamente)
        return diffMonths; // Retorna a idade da planta em meses
    },
    
    formatDate: function(dateString) {
        const date = new Date(dateString); // Cria um objeto de data com a string de entrada
        return date.toLocaleDateString('pt-BR'); // Converte a data para o formato brasileiro (dd/mm/aaaa)
    }
};

const UIController = {
    elements: {
        plantsContainer: document.getElementById('plants-container'), //  mostra as fruteiras
        plantForm: document.getElementById('plant-form'), //  Oformulário onde vamos adicionar as informações da planta
        plantModal: document.getElementById('plantModal'), // Modal de cadastro das plantas
        noPlantsAlert: document.getElementById
