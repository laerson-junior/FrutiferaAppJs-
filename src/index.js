const PlantsManager = {
    storageKey: 'brejo-paraibano-fruteiras',
    
    generateId: function() {
        return Date.now();
    },
    
    getAll: function() {
        const plantsJSON = localStorage.getItem(this.storageKey);
        return plantsJSON ? JSON.parse(plantsJSON) : [];
    },
    
    save: function(plant) {
        const plants = this.getAll();
        
        if (plant.id) {
            const index = plants.findIndex(p => p.id === plant.id);
            if (index !== -1) {
                plants[index] = plant;
            }
        } else {
            plant.id = this.generateId();
            plants.push(plant);
        }
        
        localStorage.setItem(this.storageKey, JSON.stringify(plants));
        return plant;
    },
    
    delete: function(id) {
        let plants = this.getAll();
        plants = plants.filter(plant => plant.id !== id);
        localStorage.setItem(this.storageKey, JSON.stringify(plants));
    },
    
    calculateAgeInMonths: function(plantingDate) {
        const today = new Date();
        const plantDate = new Date(plantingDate);
        const diffTime = Math.abs(today - plantDate);
        const diffMonths = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 30));
        return diffMonths;
    },
    
    formatDate: function(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR');
    }
};

const UIController = {
    elements: {
        plantsContainer: document.getElementById('plants-container'),
        plantForm: document.getElementById('plant-form'),
        plantModal: document.getElementById('plantModal'),
        noPlantsAlert: document.getElementById('no-plants-alert'),
        saveButton: document.getElementById('save-plant')
    },
    
    init: function() {
        this.renderPlants();
        this.setupEventListeners();
    },
    
    setupEventListeners: function() {
        this.elements.saveButton.addEventListener('click', this.handleSavePlant.bind(this));
        
        this.elements.plantModal.addEventListener('hidden.bs.modal', () => {
            this.elements.plantForm.reset();
            document.getElementById('plant-id').value = '';
        });
    },
    
    handleSavePlant: function() {
        const commonName = document.getElementById('common-name').value;
        const scientificName = document.getElementById('scientific-name').value;
        const averageProduction = document.getElementById('average-production').value;
        const plantingDate = document.getElementById('planting-date').value;
        const plantId = document.getElementById('plant-id').value;
        
        if (!commonName || !averageProduction || !plantingDate) {
            alert('Por favor, preencha todos os campos obrigatórios.');
            return;
        }
        
        const plant = {
            id: plantId || null,
            commonName,
            scientificName,
            averageProduction: parseFloat(averageProduction),
            plantingDate
        };
        
        PlantsManager.save(plant);
        this.renderPlants();
        
        const modal = bootstrap.Modal.getInstance(this.elements.plantModal);
        modal.hide();
    },
    
    renderPlants: function() {
        const plants = PlantsManager.getAll();
        this.elements.plantsContainer.innerHTML = '';
        
        if (plants.length === 0) {
            this.elements.noPlantsAlert.classList.remove('d-none');
            return;
        }
        
        this.elements.noPlantsAlert.classList.add('d-none');
        
        plants.forEach(plant => {
            const ageInMonths = PlantsManager.calculateAgeInMonths(plant.plantingDate);
            const formattedDate = PlantsManager.formatDate(plant.plantingDate);
            
            const plantCard = document.createElement('div');
            plantCard.className = 'col-md-6 col-lg-4';
            plantCard.innerHTML = `
                <div class="card h-100">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <h5 class="card-title">${plant.commonName}</h5>
                            <span class="badge bg-success age-badge">${ageInMonths} meses</span>
                        </div>
                        <h6 class="card-subtitle mb-2 text-muted">${plant.scientificName || 'Nome científico não informado'}</h6>
                        <p class="card-text">
                            <strong>Produção média:</strong> ${plant.averageProduction} Kg/safra<br>
                            <strong>Plantio:</strong> ${formattedDate}
                        </p>
                    </div>
                    <div class="card-footer bg-transparent">
                        <small class="text-muted">ID: ${plant.id}</small>
                    </div>
                </div>
            `;
            
            this.elements.plantsContainer.appendChild(plantCard);
        });
    }
};

document.addEventListener('DOMContentLoaded', function() {
    UIController.init();
});
