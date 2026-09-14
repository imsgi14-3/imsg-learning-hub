var LocalDB = (function() {
    var DB_NAME = "IMSG_LearningHub";
    var DB_VERSION = 1;
    var db = null;
    var cache = {};
    var ready = false;
    var readyCallbacks = [];

    var STORES = [
        "questions", "classes", "assignments", "teachers",
        "attendance", "allAttempts", "conceptStats",
        "studentAccounts", "principalAccount", "deletedIds",
        "syncQueue"
    ];

    function open(callback) {
        if (ready) { if (callback) callback(); return; }
        var request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = function(e) {
            var database = e.target.result;
            for (var i = 0; i < STORES.length; i++) {
                if (!database.objectStoreNames.contains(STORES[i])) {
                    database.createObjectStore(STORES[i], { keyPath: "id" });
                }
            }
            if (!database.objectStoreNames.contains("syncQueue")) {
                database.createObjectStore("syncQueue", { keyPath: "timestamp" });
            }
        };
        request.onsuccess = function(e) {
            db = e.target.result;
            ready = true;
            loadAllToCache(function() {
                for (var i = 0; i < readyCallbacks.length; i++) readyCallbacks[i]();
                readyCallbacks = [];
                if (callback) callback();
            });
        };
        request.onerror = function(e) {
            console.error("IndexedDB open error:", e);
            ready = true;
            if (callback) callback();
        };
    }

    function onReady(callback) {
        if (ready) { callback(); } else { readyCallbacks.push(callback); }
    }

    function loadAllToCache(callback) {
        var stores = STORES.slice();
        var loaded = 0;
        function done() {
            loaded++;
            if (loaded >= stores.length && callback) callback();
        }
        for (var i = 0; i < stores.length; i++) {
            loadStore(stores[i], done);
        }
    }

    function loadStore(storeName, callback) {
        if (!db) { cache[storeName] = null; if (callback) callback(); return; }
        try {
            var tx = db.transaction(storeName, "readonly");
            var store = tx.objectStore(storeName);
            var request = store.getAll();
            request.onsuccess = function(e) {
                cache[storeName] = e.target.result || [];
                if (callback) callback();
            };
            request.onerror = function() {
                cache[storeName] = null;
                if (callback) callback();
            };
        } catch(e) {
            cache[storeName] = null;
            if (callback) callback();
        }
    }

    function get(storeName, callback) {
        if (cache[storeName] !== undefined && cache[storeName] !== null) {
            callback(cache[storeName]);
            return;
        }
        if (db) {
            loadStore(storeName, function() {
                callback(cache[storeName] || []);
            });
        } else {
            callback([]);
        }
    }

    function getOne(storeName, id, callback) {
        get(storeName, function(items) {
            for (var i = 0; i < items.length; i++) {
                if (items[i].id === id) { callback(items[i]); return; }
            }
            callback(null);
        });
    }

    function put(storeName, item, callback) {
        if (!cache[storeName]) cache[storeName] = [];
        var found = false;
        for (var i = 0; i < cache[storeName].length; i++) {
            if (cache[storeName][i].id === item.id) {
                cache[storeName][i] = item;
                found = true;
                break;
            }
        }
        if (!found) cache[storeName].push(item);
        persistStore(storeName, callback);
    }

    function putAll(storeName, items, callback) {
        cache[storeName] = items;
        persistStore(storeName, callback);
    }

    function remove(storeName, id, callback) {
        if (cache[storeName]) {
            cache[storeName] = cache[storeName].filter(function(item) {
                return item.id !== id;
            });
        }
        persistStore(storeName, callback);
    }

    function clear(storeName, callback) {
        cache[storeName] = [];
        persistStore(storeName, callback);
    }

    function persistStore(storeName, callback) {
        if (!db) { if (callback) callback(); return; }
        try {
            var tx = db.transaction(storeName, "readwrite");
            var store = tx.objectStore(storeName);
            store.clear();
            var items = cache[storeName] || [];
            for (var i = 0; i < items.length; i++) {
                store.put(items[i]);
            }
            tx.oncomplete = function() { if (callback) callback(); };
            tx.onerror = function() { if (callback) callback(); };
        } catch(e) {
            console.error("IndexedDB persist error for " + storeName + ":", e);
            if (callback) callback();
        }
    }

    function addToSyncQueue(entry, callback) {
        if (!cache.syncQueue) cache.syncQueue = [];
        entry.timestamp = entry.timestamp || Date.now();
        entry.id = "sync-" + entry.timestamp + "-" + Math.random().toString(36).substr(2, 5);
        cache.syncQueue.push(entry);
        persistStore("syncQueue", callback);
    }

    function getSyncQueue(callback) {
        callback(cache.syncQueue || []);
    }

    function clearSyncQueue(callback) {
        cache.syncQueue = [];
        persistStore("syncQueue", callback);
    }

    function migrateFromLocalStorage() {
        var MIGRATION_KEY = "learningHub_idb_migrated";
        if (localStorage.getItem(MIGRATION_KEY)) return;

        var keys = {
            "learningHub_questions": "questions",
            "learningHub_classes": "classes",
            "learningHub_assignments": "assignments",
            "learningHub_teachers": "teachers",
            "learningHub_attendance": "attendance",
            "learningHub_attempts": "allAttempts",
            "learningHub_concepts": "conceptStats",
            "learningHub_students": "studentAccounts",
            "learningHub_deleted": "deletedIds",
            "learningHub_principal": "principalAccount"
        };

        for (var lsKey in keys) {
            var storeName = keys[lsKey];
            var raw = localStorage.getItem(lsKey);
            if (raw) {
                try {
                    var parsed = JSON.parse(raw);
                    if (storeName === "principalAccount") {
                        cache[storeName] = [parsed];
                    } else if (Array.isArray(parsed)) {
                        cache[storeName] = parsed;
                    } else if (typeof parsed === "object") {
                        cache[storeName] = [parsed];
                    }
                } catch(e) {}
            }
        }

        persistAllStores(function() {
            localStorage.setItem(MIGRATION_KEY, "true");
        });
    }

    function persistAllStores(callback) {
        var remaining = STORES.length;
        function done() { remaining--; if (remaining <= 0 && callback) callback(); }
        for (var i = 0; i < STORES.length; i++) {
            if (cache[STORES[i]] && cache[STORES[i]].length > 0) {
                persistStore(STORES[i], done);
            } else {
                done();
            }
        }
    }

    function getCache() { return cache; }
    function isReady() { return ready; }

    return {
        open: open,
        onReady: onReady,
        get: get,
        getOne: getOne,
        put: put,
        putAll: putAll,
        remove: remove,
        clear: clear,
        addToSyncQueue: addToSyncQueue,
        getSyncQueue: getSyncQueue,
        clearSyncQueue: clearSyncQueue,
        migrateFromLocalStorage: migrateFromLocalStorage,
        getCache: getCache,
        isReady: isReady
    };
})();
