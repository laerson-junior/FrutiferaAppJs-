const PlantsManager = {
    storageKey: 'safra da serra-fruteiras', // Essa é a chave onde a gente guarda as fruteiras no localStorage
    
    generateId: function() {
        return Date.now(); //  usa o horário atual pra criar um ID único
    },
    
    getAll: function() {
        const plantsJSON = localStorage.getItem(this.storageKey); // Tenta pegar as fruteiras no localStorage
        // Se tiver alguma coisa lá,  transforma em objeto, se não, volta um array vazio
        return plantsJSON ? JSON.parse(plantsJSON) : [];
    },
    
    save: function(plant) {
        const plants = this.getAll(); // Pega todas as plantas que já estão no localStorage
        plant.id = this.generateId(); // Cria um ID único pra nova planta
        plants.push(plant); // Adiciona a nova planta no array
        localStorage.setItem(this.storageKey, JSON.stringify(plants)); // Atualiza o localStorage com a nova planta
        return plant; // Retorna a planta que foi salva
    },
    
    delete: function(id) {
        let plants = this.getAll(); // Pega todas as plantas de novo
        plants = plants.filter(plant => plant.id !== id); // Filtra a planta que  o usuario quer excluir
        localStorage.setItem(this.storageKey, JSON.stringify(plants)); // Atualiza o localStorage depois de excluir
    },
    
    calculateAgeInMonths: function(plantingDate) {
        const today = new Date();
        const plantDate = new Date(plantingDate);
        const diffTime = Math.abs(today - plantDate); // Calcula a diferença de tempo entre hoje e o plantio
        const diffMonths = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 30)); // Converte a diferença pra meses
        return diffMonths; // Retorna a idade da planta em meses
    },
    
    formatDate: function(dateString) {
        const date = new Date(dateString); // Cria um objeto de data com a string
        return date.toLocaleDateString('pt-BR'); // Devolve a data no formato brasileiro
    }
};

const UIController = {
    elements: {
        plantsContainer: document.getElementById('plants-container'), // O local onde  vai exibir as plantas
        plantForm: document.getElementById('plant-form'), // O formulário onde exibe coloca as informações da planta
        plantModal: document.getElementById('plantModal'), // O modal de cadastro das plantas
        noPlantsAlert: document.getElementById('no-plants-alert'), // Alerta quando não tem planta cadastrada
        saveButton: document.getElementById('save-plant') // Botão de salvar no modal
    },
    
    init: function() {
        this.renderPlants(); // Quando a página carregar, já exibe as plantas que estão salvas
        this.setupEventListeners(); // Configura os eventos dos botões
    },
    
    setupEventListeners: function() {
        // ao clicar no botão de salvar, chama a função que vai salvar a planta
        this.elements.saveButton.addEventListener('click', this.handleSavePlant.bind(this));
        
        // Quando o modal for fechado,  reseta o formulário pra adicionar outra planta
        this.elements.plantModal.addEventListener('hidden.bs.modal', () => {
            this.elements.plantForm.reset(); // Reseta o formulário
            document.getElementById('plant-id').value = ''; // Limpa o ID da planta
        });
    },
    
    handleSavePlant: function() {
        // Pega os valores dos campos que o usuário preencheu no formulário
        const commonName = document.getElementById('common-name').value;
        const scientificName = document.getElementById('scientific-name').value;
        const averageProduction = document.getElementById('average-production').value;
        const plantingDate = document.getElementById('planting-date').value;
        const plantImageInput = document.getElementById('plant-image');

        // Função interna que vai salvar a planta
        function salvar(plantImage) {
            const plant = {
                commonName,
                scientificName,
                averageProduction: parseFloat(averageProduction), // Converte a produção média pra número
                plantingDate,
                image: plantImage || '' // Se não tiver imagem, coloca uma string vazia
            };
            PlantsManager.save(plant); // Chama a função de salvar no PlantsManager
            UIController.renderPlants(); // Atualiza a lista de plantas
            const modal = bootstrap.Modal.getInstance(document.getElementById('plantModal'));
            modal.hide(); // Fecha o modal depois que salvar
        }

        // Se o usuário selecionou uma imagem, lê ela antes de salvar
        if (plantImageInput.files && plantImageInput.files[0]) {
            const reader = new FileReader(); // Lê a imagem que foi selecionada
            reader.onload = (e) => {
                salvar(e.target.result); // Salva a planta com a imagem
            };
            reader.readAsDataURL(plantImageInput.files[0]); // Lê a imagem e converte pra base64
        } else {
            salvar(''); // Se não tiver imagem, chama a função de salvar sem imagem
        }
    },
    
    renderPlants: function() {
        const plants = PlantsManager.getAll(); // Pega todas as plantas do localStorage
        this.elements.plantsContainer.innerHTML = ''; // Limpa a área onde as plantas são exibidas

        // Se não houver plantas cadastradas, exibe o alerta
        if (plants.length === 0) {
            this.elements.noPlantsAlert.classList.remove('d-none');
            return; // Se não tiver planta, não faz mais nada
        }

        // Se tiver plantas, esconde o alerta
        this.elements.noPlantsAlert.classList.add('d-none');
        
        // Pra cada planta cadastrada, cria um card e exibe na tela
        plants.forEach(plant => {const ageInMonths = PlantsManager.calculateAgeInMonths(plant.plantingDate); // calcula a idade da planta em meses, com base na data de plantio
            
            const formattedDate = PlantsManager.formatDate(plant.plantingDate); // Formata a data de plantio
            
            const plantCard = document.createElement('div'); // Cria a div do card da planta
            plantCard.className = 'col-md-6 col-lg-4'; // Estiliza o card
            plantCard.innerHTML = `
                <div class="card h-100">
                    ${plant.image ? `<img src="${plant.image}" class="card-img-top" alt="${plant.commonName}">` : ''}
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <h5 class="card-title">${plant.commonName}</h5>
                            <span class="badge bg-success age-badge">${ageInMonths} meses</span> <!-- Exibe a idade da planta -->
                        </div>
                        <h6 class="card-subtitle mb-2 text-muted">${plant.scientificName || 'Nome científico não informado'}</h6>
                        <p class="card-text">
                            <strong>Produção média:</strong> ${plant.averageProduction} Kg/safra<br>
                            <strong>Plantio:</strong> ${formattedDate}
                        </p>
                    </div>
                    <div class="card-footer bg-transparent">
                        <small class="text-muted">ID: ${plant.id}</small> <!-- Mostra o ID da planta -->
                    </div>
                </div>
            `;
            this.elements.plantsContainer.appendChild(plantCard); // Adiciona o card ao contêiner
        });
    }
};

// Quando o conteúdo da página estiver carregado, inicializa o UIController
document.addEventListener('DOMContentLoaded', function() {
    UIController.init();
});
