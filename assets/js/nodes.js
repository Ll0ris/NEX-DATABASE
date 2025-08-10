class NodeSystem {
    constructor() {
        this.canvas = document.getElementById('nodeCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.nodes = [];
        this.maxDistance = 150;
        this.nodeCount = 50;
        this.minNodesPerSide = 20;
        
        this.init();
        this.animate();
    }
    
    init() {
        this.resizeCanvas();
        this.createNodes();
        
        window.addEventListener('resize', () => this.resizeCanvas());
    }
    
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    createNodes() {
        const leftZone = 600; // Sol 600px
        const rightZone = window.innerWidth - 600; // Sağ 600px
        
        for (let i = 0; i < this.nodeCount; i++) {
            const isLeftSide = Math.random() < 0.5;
            const isGolden = Math.random() < 0.2; // %20 altın sarısı
            
            const node = {
                x: isLeftSide 
                    ? Math.random() * leftZone
                    : rightZone + Math.random() * 600,
                y: Math.random() * window.innerHeight,
                vx: (Math.random() - 0.5) * 0.3,
                vy: (Math.random() - 0.5) * 0.3,
                radius: Math.random() * 2 + 1.5,
                color: isGolden ? '#caa354' : '#F5F5DC',
                opacity: Math.random() * 0.2 + 0.4,
                isGolden: isGolden,
                isLeftSide: isLeftSide
            };
            
            this.nodes.push(node);
        }
    }
    
    updateNodes() {
        this.nodes.forEach((node, index) => {
            // Hareket
            node.x += node.vx;
            node.y += node.vy;
            
            // Hangi tarafta olduğunu belirle
            const leftBoundary = node.isLeftSide ? 0 : window.innerWidth - 600;
            const rightBoundary = node.isLeftSide ? 600 : window.innerWidth;
            
            // Köşe kontrolü - hem X hem Y sınırlarında
            const isAtHorizontalEdge = (node.x <= leftBoundary + 5 || node.x >= rightBoundary - 5);
            const isAtVerticalEdge = (node.y <= 5 || node.y >= window.innerHeight - 5);
            const isInCorner = isAtHorizontalEdge && isAtVerticalEdge;
            
            if (isInCorner) {
                // Bu taraftaki node sayısını kontrol et
                const nodesOnThisSide = this.nodes.filter(n => n.isLeftSide === node.isLeftSide).length;
                
                if (nodesOnThisSide > this.minNodesPerSide) {
                    // Işınlanma - karşı tarafa geç
                    node.isLeftSide = !node.isLeftSide;
                    
                    if (node.isLeftSide) {
                        // Sola ışınlan
                        node.x = Math.random() * 500 + 50; // 50-550 arası
                    } else {
                        // Sağa ışınlan
                        node.x = window.innerWidth - 550 + Math.random() * 500; // Sağ tarafta 50-550 arası
                    }
                    
                    // Y pozisyonunu ortaya yakın yenile
                    node.y = window.innerHeight * 0.3 + Math.random() * window.innerHeight * 0.4;
                    
                    // Hızı yenile
                    node.vx = (Math.random() - 0.5) * 0.3;
                    node.vy = (Math.random() - 0.5) * 0.3;
                    
                    // Işınlanma efekti için opacity'yi geçici düşür
                    const originalOpacity = node.opacity;
                    node.opacity = 0.1;
                    setTimeout(() => {
                        node.opacity = originalOpacity;
                    }, 300);
                    
                    return; // Bu frame'de başka işlem yapma
                }
            }
            
            // Normal sınır kontrolleri
            // Yatay sınır kontrolü - 600px sınırında sek
            if (node.x <= leftBoundary || node.x >= rightBoundary) {
                node.vx *= -1;
                // Sınır içinde zorla tut
                node.x = Math.max(leftBoundary + 1, Math.min(rightBoundary - 1, node.x));
            }
            
            // Dikey sınır kontrolü - normal sekme
            if (node.y <= 0 || node.y >= window.innerHeight) {
                node.vy *= -1;
                node.y = Math.max(1, Math.min(window.innerHeight - 1, node.y));
            }
        });
    }
    
    drawConnections() {
        for (let i = 0; i < this.nodes.length; i++) {
            for (let j = i + 1; j < this.nodes.length; j++) {
                const node1 = this.nodes[i];
                const node2 = this.nodes[j];
                
                const distance = Math.sqrt(
                    Math.pow(node2.x - node1.x, 2) + 
                    Math.pow(node2.y - node1.y, 2)
                );
                
                if (distance < this.maxDistance) {
                    const opacity = 1 - (distance / this.maxDistance);
                    
                    // Renk kombinasyonlarına göre gradyan oluştur
                    if (node1.isGolden && node2.isGolden) {
                        // İki altın sarısı node - sarı çizgi
                        this.ctx.strokeStyle = `rgba(202, 163, 84, ${opacity * 0.5})`;
                    } else if (node1.isGolden || node2.isGolden) {
                        // Bir altın, bir beyaz - gradyan çizgi
                        const gradient = this.ctx.createLinearGradient(node1.x, node1.y, node2.x, node2.y);
                        gradient.addColorStop(0, node1.isGolden ? 
                            `rgba(202, 163, 84, ${opacity * 0.5})` : 
                            `rgba(245, 245, 220, ${opacity * 0.5})`);
                        gradient.addColorStop(0.5, `rgba(223, 204, 152, ${opacity * 0.6})`); // Orta kısım daha az renkli
                        gradient.addColorStop(1, node2.isGolden ? 
                            `rgba(202, 163, 84, ${opacity * 0.5})` : 
                            `rgba(245, 245, 220, ${opacity * 0.5})`);
                        this.ctx.strokeStyle = gradient;
                    } else {
                        // İki beyaz node - beyaz çizgi
                        this.ctx.strokeStyle = `rgba(245, 245, 220, ${opacity * 0.3})`;
                    }
                    
                    this.ctx.lineWidth = 1;
                    this.ctx.beginPath();
                    this.ctx.moveTo(node1.x, node1.y);
                    this.ctx.lineTo(node2.x, node2.y);
                    this.ctx.stroke();
                }
            }
        }
    }
    
    drawNodes() {
        this.nodes.forEach(node => {
            this.ctx.globalAlpha = node.opacity;
            
            // Daha az glow efekti
            this.ctx.shadowBlur = 4;
            this.ctx.shadowColor = node.color;
            this.ctx.fillStyle = node.color;
            
            this.ctx.beginPath();
            this.ctx.arc(node.x, node.y, node.radius + 0.5, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Ana node
            this.ctx.shadowBlur = 2;
            this.ctx.globalAlpha = node.opacity + 0.1;
            this.ctx.beginPath();
            this.ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.shadowBlur = 0;
        });
        
        this.ctx.globalAlpha = 1;
    }
    
    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.updateNodes();
        this.drawConnections();
        this.drawNodes();
        
        requestAnimationFrame(() => this.animate());
    }
}

// Sayfa yüklendiğinde başlat
document.addEventListener('DOMContentLoaded', () => {
    const nodeSystem = new NodeSystem();
});
