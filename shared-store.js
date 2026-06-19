(function () {
  const STORAGE_KEY = "securegate-store-v1";

  const seedData = {
    residents: {
      "A-302": { name: "Ananya Patel" },
      "B-504": { name: "Vivek Kumar" },
      "C-110": { name: "Sneha Nair" }
    },
    visitors: [
      {
        id: "visitor-1",
        name: "Rohit Sharma",
        flat: "A-302",
        status: "approved",
        createdAt: "2026-06-16T10:12:00",
        photoData: ""
      },
      {
        id: "visitor-2",
        name: "Meena Delivery",
        flat: "B-504",
        status: "waiting",
        createdAt: "2026-06-16T10:18:00",
        photoData: ""
      },
      {
        id: "visitor-3",
        name: "Rakesh Electrician",
        flat: "C-110",
        status: "rejected",
        createdAt: "2026-06-16T09:46:00",
        photoData: ""
      }
    ],
    complaints: [
      {
        id: "complaint-1",
        flat: "A-302",
        residentName: "Ananya Patel",
        text: "Water leakage near parking area",
        createdAt: "2026-06-16T09:20:00"
      },
      {
        id: "complaint-2",
        flat: "B-504",
        residentName: "Vivek Kumar",
        text: "Lift in Tower B is slow",
        createdAt: "2026-06-16T09:45:00"
      },
      {
        id: "complaint-3",
        flat: "C-110",
        residentName: "Sneha Nair",
        text: "Light not working near Gate 2",
        createdAt: "2026-06-16T10:00:00"
      }
    ]
  };

  function clone(data) {
    return JSON.parse(JSON.stringify(data));
  }

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(seedData));
        return clone(seedData);
      }
      return { ...clone(seedData), ...JSON.parse(raw) };
    } catch (_error) {
      return clone(seedData);
    }
  }

  function save(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return clone(data);
  }

  function formatTime(isoText) {
    const date = new Date(isoText);
    return Number.isNaN(date.getTime())
      ? isoText
      : date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  const store = {
    ensureSeed() {
      load();
    },
    getData() {
      return load();
    },
    getResident(flat) {
      return load().residents[flat] || null;
    },
    addVisitorRequest({ name, flat, photoData }) {
      const data = load();
      const item = {
        id: `visitor-${Date.now()}`,
        name,
        flat,
        status: "waiting",
        createdAt: new Date().toISOString(),
        photoData: photoData || ""
      };
      data.visitors.unshift(item);
      save(data);
      return item;
    },
    getVisitorById(id) {
      return load().visitors.find((visitor) => visitor.id === id) || null;
    },
    getLatestVisitorForFlat(flat) {
      const visitors = load().visitors.filter((visitor) => visitor.flat === flat);
      return visitors[0] || null;
    },
    getPendingVisitorForFlat(flat) {
      return load().visitors.find((visitor) => visitor.flat === flat && visitor.status === "waiting") || null;
    },
    updateVisitorStatus(id, status) {
      const data = load();
      const item = data.visitors.find((visitor) => visitor.id === id);
      if (!item) return null;
      item.status = status;
      item.updatedAt = new Date().toISOString();
      save(data);
      return item;
    },
    addComplaint({ flat, residentName, text }) {
      const data = load();
      const item = {
        id: `complaint-${Date.now()}`,
        flat,
        residentName,
        text,
        createdAt: new Date().toISOString()
      };
      data.complaints.unshift(item);
      save(data);
      return item;
    },
    getSummary() {
      const data = load();
      return {
        visitors: data.visitors.length,
        approved: data.visitors.filter((item) => item.status === "approved").length,
        complaints: data.complaints.length
      };
    },
    formatTime,
    subscribe(listener) {
      window.addEventListener("storage", listener);
    }
  };

  window.SecureGateStore = store;
})();
