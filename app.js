// app.js - Bangladesh Tourism Board Visitor Frontend Logic

document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    loadLiveNotices();
    renderDestinations('all');
    setupDefaultDestinations();
}

// Default Destinations initialization if localStorage is empty
function setupDefaultDestinations() {
    if (!localStorage.getItem('btb_destinations')) {
        const defaultDests = [
            {
                id: 1,
                name: "Cox's Bazar Sea Beach",
                category: "beaches",
                district: "Cox's Bazar",
                image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
                images: [
                    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
                    "https://images.unsplash.com/photo-1544644181-1484b3fdfc62",
                    "https://images.unsplash.com/photo-1506744038136-46273834b3fb"
                ],
                shortDesc: "World's longest natural unbroken sandy sea beach, famous for stunning golden sunsets.",
                fullDesc: "Cox's Bazar is the tourist capital of Bangladesh. Stretching over 120 kilometers, the unbroken sandy beach attracts millions of tourists every year.",
                hotels: [
                    { name: "Sayeman Beach Resort", type: "5-Star Luxury", price: "৳15,000/night" },
                    { name: "Hotel Sea Crown", type: "Beach-facing", price: "৳6,000/night" },
                    { name: "Long Beach Hotel", type: "Premium", price: "৳8,500/night" }
                ]
            },
            {
                id: 2,
                name: "Sajek Valley",
                category: "hills",
                district: "Rangamati",
                image: "https://images.unsplash.com/photo-1544644181-1484b3fdfc62",
                images: [
                    "https://images.unsplash.com/photo-1544644181-1484b3fdfc62",
                    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
                    "https://images.unsplash.com/photo-1506744038136-46273834b3fb"
                ],
                shortDesc: "Kingdom of Clouds in the hill tracts, offering breathtaking views of floating clouds.",
                fullDesc: "Situated in Baghaichhari upazila of Rangamati district, Sajek Valley is famously known as the Queen of Hills at nearly 1,800 feet height.",
                hotels: [
                    { name: "Sajek Resort", type: "Army Managed", price: "৳5,000/night" },
                    { name: "Meghpunji Resort", type: "Eco-cottage", price: "৳4,500/night" }
                ]
            },
            {
                id: 3,
                name: "The Sundarbans",
                category: "forests",
                district: "Bagerhat",
                image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
                images: [
                    "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
                    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
                    "https://images.unsplash.com/photo-1544644181-1484b3fdfc62"
                ],
                shortDesc: "Largest mangrove forest in the world and natural habitat of the Royal Bengal Tiger.",
                fullDesc: "A UNESCO World Heritage Site featuring unique tidal halophytic mangrove forests, spotted deer, and boat safaris.",
                hotels: [
                    { name: "Sundarbans Jungle Resort", type: "Eco Lodge", price: "৳4,000/night" },
                    { name: "Mongla Tourist Lodge", type: "BPC Lodge", price: "৳3,000/night" }
                ]
            }
        ];
        localStorage.setItem('btb_destinations', JSON.stringify(defaultDests));
    }
}

// Live Notices from Firebase Firestore
function loadLiveNotices() {
    const container = document.getElementById('noticeListContainer');
    if (!container) return;

    db.collection('notices').onSnapshot(snapshot => {
        if (snapshot.empty) {
            container.innerHTML = `<p class="text-xs text-slate-400">No active notices available.</p>`;
            return;
        }
        let html = '';
        snapshot.forEach(doc => {
            const n = doc.data();
            html += `
                <div class="flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-950 p-3 rounded-xl border border-slate-800 gap-2">
                    <div>
                        <span class="text-[10px] bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded font-bold uppercase border border-emerald-800/40 mr-2">${n.category || 'General'}</span>
                        <span class="text-xs font-bold text-white">${n.title}</span>
                    </div>
                    <div class="flex items-center gap-3 text-[11px] text-slate-400">
                        <span><i class="fa-solid fa-calendar mr-1"></i> ${n.date || ''}</span>
                        ${n.pdfUrl ? `<button onclick="openPdfModal('${n.pdfUrl}', '${n.title}')" class="px-2.5 py-1 bg-bdRed hover:bg-red-700 text-white rounded-lg font-bold transition">View PDF</button>` : ''}
                    </div>
                </div>
            `;
        });
        container.innerHTML = html;
    });
}

// Global variable for destination image slider intervals (3.5s auto change)
let destSliderIntervals = {};

function renderDestinations(category = 'all') {
    const grid = document.getElementById('destinationsGrid');
    if (!grid) return;
    
    Object.values(destSliderIntervals).forEach(clearInterval);
    destSliderIntervals = {};

    const destinations = JSON.parse(localStorage.getItem('btb_destinations')) || [];
    const filtered = category === 'all' ? destinations : destinations.filter(d => d.category === category);

    if (filtered.length === 0) {
        grid.innerHTML = `<p class="text-xs text-slate-400 col-span-3 text-center py-10">No destinations found in this category.</p>`;
    } else {
        grid.innerHTML = filtered.map(d => {
            const images = (d.images && d.images.length >= 3) ? d.images : [
                d.image || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e',
                'https://images.unsplash.com/photo-1544644181-1484b3fdfc62',
                'https://images.unsplash.com/photo-1506744038136-46273834b3fb'
            ];

            return `
            <div class="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-lg hover:border-emerald-500/50 transition group">
                <!-- 3-Image Auto Slider Container (3.5s interval) -->
                <div class="h-48 overflow-hidden relative cursor-pointer" onclick="openDestModalById(${d.id})">
                    <div id="dest-slider-${d.id}" class="w-full h-full relative">
                        ${images.map((imgUrl, idx) => `
                            <img src="${imgUrl}" class="dest-slide-img-${d.id} absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${idx === 0 ? 'opacity-100' : 'opacity-0'}" alt="${d.name}">
                        `).join('')}
                    </div>
                    <span class="absolute top-3 left-3 px-2.5 py-1 bg-emerald-950/85 backdrop-blur-md text-emerald-300 text-[10px] font-bold rounded-lg uppercase border border-emerald-800/40 z-10">${d.category}</span>
                    
                    <div class="absolute bottom-2 right-3 z-10 flex gap-1">
                        <span class="dot-${d.id} w-1.5 h-1.5 rounded-full bg-white opacity-100 transition-all"></span>
                        <span class="dot-${d.id} w-1.5 h-1.5 rounded-full bg-white opacity-40 transition-all"></span>
                        <span class="dot-${d.id} w-1.5 h-1.5 rounded-full bg-white opacity-40 transition-all"></span>
                    </div>
                </div>

                <div class="p-5 space-y-2 cursor-pointer" onclick="openDestModalById(${d.id})">
                    <div class="flex justify-between items-center text-xs text-slate-400">
                        <span><i class="fa-solid fa-location-dot text-bdRed mr-1"></i> ${d.district}</span>
                        <span class="text-yellow-400 font-bold font-mono">${d.hotels ? d.hotels.length : 0} Hotels</span>
                    </div>
                    <h3 class="text-lg font-bold text-white">${d.name}</h3>
                    <p class="text-xs text-slate-300 line-clamp-2">${d.shortDesc || ''}</p>
                    <div class="pt-2 flex items-center justify-between text-xs font-bold text-emerald-400">
                        <span>Explore Details & Hotels</span>
                        <i class="fa-solid fa-arrow-right group-hover:translate-x-1 transition"></i>
                    </div>
                </div>
            </div>
            `;
        }).join('');

        // 3.5 Second Auto Slider Timer
        filtered.forEach(d => {
            let currentImgIndex = 0;
            destSliderIntervals[d.id] = setInterval(() => {
                const imgElements = document.querySelectorAll(`.dest-slide-img-${d.id}`);
                const dotElements = document.querySelectorAll(`.dot-${d.id}`);
                
                if (imgElements.length > 0) {
                    imgElements[currentImgIndex].classList.remove('opacity-100');
                    imgElements[currentImgIndex].classList.add('opacity-0');
                    if (dotElements[currentImgIndex]) dotElements[currentImgIndex].classList.replace('opacity-100', 'opacity-40');

                    currentImgIndex = (currentImgIndex + 1) % imgElements.length;

                    imgElements[currentImgIndex].classList.remove('opacity-0');
                    imgElements[currentImgIndex].classList.add('opacity-100');
                    if (dotElements[currentImgIndex]) dotElements[currentImgIndex].classList.replace('opacity-40', 'opacity-100');
                }
            }, 3500);
        });
    }

    document.querySelectorAll('.filter-btn').forEach(btn => {
        if(btn.getAttribute('data-category') === category) {
            btn.className = "px-4 py-2 bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-md filter-btn";
        } else {
            btn.className = "px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition filter-btn";
        }
    });
}

function filterDestinations(category) {
    renderDestinations(category);
}

// Destination Details Modal
function openDestModalById(id) {
    const destinations = JSON.parse(localStorage.getItem('btb_destinations')) || [];
    const d = destinations.find(item => item.id === id);
    if (!d) return;

    const content = document.getElementById('detailsModalContent');
    const gpsContainer = document.getElementById('gpsNavButtonContainer');

    content.innerHTML = `
        <div class="space-y-4">
            <div class="h-64 rounded-2xl overflow-hidden relative">
                <img src="${d.image || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e'}" class="w-full h-full object-cover" alt="${d.name}">
                <span class="absolute top-3 left-3 px-3 py-1 bg-emerald-950/85 backdrop-blur-md text-emerald-300 text-xs font-bold rounded-xl uppercase border border-emerald-800/40">${d.category}</span>
            </div>
            <div>
                <div class="flex items-center gap-2 text-xs text-slate-400 mb-1">
                    <span><i class="fa-solid fa-location-dot text-bdRed"></i> ${d.district}</span>
                </div>
                <h2 class="text-2xl font-extrabold text-white">${d.name}</h2>
                <p class="text-xs text-slate-300 mt-2 leading-relaxed">${d.fullDesc || d.shortDesc || ''}</p>
            </div>

            <div class="border-t border-slate-800 pt-4">
                <h3 class="text-sm font-bold text-white mb-3 flex items-center gap-2">
                    <i class="fa-solid fa-hotel text-amber-400"></i> Recommended Hotels & Resorts
                </h3>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    ${d.hotels && d.hotels.length > 0 ? d.hotels.map(h => `
                        <div class="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                            <div class="font-bold text-white text-xs">${h.name}</div>
                            <div class="text-[11px] text-emerald-400">${h.type || 'Standard'}</div>
                            <div class="text-[11px] text-yellow-400 font-mono">${h.price || 'Contact for price'}</div>
                        </div>
                    `).join('') : '<p class="text-xs text-slate-500">No hotels added yet.</p>'}
                </div>
            </div>
        </div>
    `;

    if (gpsContainer) {
        gpsContainer.innerHTML = `
            <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(d.name + ' ' + d.district + ' Bangladesh')}" target="_blank" class="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition shadow">
                <i class="fa-solid fa-location-arrow"></i> Live GPS Nav
            </a>
        `;
    }

    document.getElementById('detailsModal').classList.remove('hidden');
}

function closeDetailsModal() {
    document.getElementById('detailsModal').classList.add('hidden');
}

// Board Members Modal
function openBoardModal() {
    const grid = document.getElementById('boardMembersGrid');
    if (!grid) return;
    const members = JSON.parse(localStorage.getItem('btb_board_members')) || [
        { name: "Chairman, BTB", role: "Chief Executive Officer", contact: "chairman@tourism.gov.bd" },
        { name: "Director (Planning)", role: "Head of Planning & Development", contact: "planning@tourism.gov.bd" }
    ];

    grid.innerHTML = members.map(m => `
        <div class="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
            <div class="text-sm font-bold text-white">${m.name}</div>
            <div class="text-xs text-emerald-400 font-semibold">${m.role}</div>
            <div class="text-xs text-slate-400"><i class="fa-solid fa-envelope mr-1 text-bdRed"></i> ${m.contact}</div>
        </div>
    `).join('');

    document.getElementById('boardModal').classList.remove('hidden');
}

function closeBoardModal() {
    document.getElementById('boardModal').classList.add('hidden');
}

// PDF Modal
function openPdfModal(url, title) {
    document.getElementById('pdfModalTitle').textContent = title;
    document.getElementById('pdfFrame').src = url;
    document.getElementById('pdfModal').classList.remove('hidden');
}

function closePdfModal() {
    document.getElementById('pdfModal').classList.add('hidden');
    document.getElementById('pdfFrame').src = '';
}

// Mobile Menu Toggle
function toggleMobileMenu() {
    const menu = document.getElementById('mobileMenu');
    if (menu) {
        menu.classList.toggle('hidden');
    }
}