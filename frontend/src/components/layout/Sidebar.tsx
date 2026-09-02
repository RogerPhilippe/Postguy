import React, { useRef, useState } from 'react';
import {
  History,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Clock,
  Folder,
  FolderOpen,
  FolderPlus,
  FolderInput,
  Download,
  Pencil,
  X,
  Check,
  Save,
} from 'lucide-react';
import { useHistoryStore } from '../../store/historyStore';
import { useCollectionsStore } from '../../store/collectionsStore';
import { useTabsStore } from '../../store/tabsStore';
import { HistoryEntry } from '../../types/history';
import { Collection, CollectionItem } from '../../types/collection';
import { RequestConfig } from '../../types/request';
import { formatDate } from '../../utils/formatter';
import { HttpMethod } from '../../types/request';
import { useT } from '../../i18n/useT';
import { downloadJson, sanitizeFilename } from '../../utils/fileExport';

const METHOD_COLORS: Record<HttpMethod, string> = {
  GET: 'text-emerald-400',
  POST: 'text-blue-400',
  PUT: 'text-orange-400',
  DELETE: 'text-red-400',
  PATCH: 'text-purple-400',
  HEAD: 'text-gray-400',
  OPTIONS: 'text-gray-400',
};

const METHOD_BG: Record<HttpMethod, string> = {
  GET: 'bg-emerald-400/10',
  POST: 'bg-blue-400/10',
  PUT: 'bg-orange-400/10',
  DELETE: 'bg-red-400/10',
  PATCH: 'bg-purple-400/10',
  HEAD: 'bg-gray-400/10',
  OPTIONS: 'bg-gray-400/10',
};

function MethodBadge({ method }: { method: HttpMethod }) {
  return (
    <span
      className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${METHOD_COLORS[method]} ${METHOD_BG[method]}`}
    >
      {method}
    </span>
  );
}

interface SectionHeaderProps {
  icon: React.ReactNode;
  label: string;
  count: number;
  isOpen: boolean;
  onToggle: () => void;
  actions?: React.ReactNode;
}

function SectionHeader({ icon, label, count, isOpen, onToggle, actions }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between px-3 py-2.5 border-b border-border bg-panel sticky top-0 z-[1]">
      <button
        onClick={onToggle}
        className="flex items-center gap-2 min-w-0 text-text-secondary hover:text-text-primary transition-colors"
      >
        <ChevronDown
          size={12}
          className={`flex-shrink-0 transition-transform ${isOpen ? '' : '-rotate-90'}`}
        />
        {icon}
        <span className="text-sm font-medium">{label}</span>
        {count > 0 && (
          <span className="text-xs bg-border text-text-muted rounded-full px-1.5 py-0.5">
            {count}
          </span>
        )}
      </button>
      <div className="flex items-center gap-1">{actions}</div>
    </div>
  );
}

function SaveToCollectionMenu({
  request,
  onClose,
}: {
  request: RequestConfig;
  onClose: () => void;
}) {
  const collections = useCollectionsStore((state) => state.collections);
  const createCollection = useCollectionsStore((state) => state.createCollection);
  const addItem = useCollectionsStore((state) => state.addItem);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const t = useT();

  const saveTo = (collectionId: string) => {
    addItem(collectionId, '', request);
    onClose();
  };

  const handleCreate = () => {
    if (!newName.trim()) return;
    const id = createCollection(newName);
    addItem(id, '', request);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-10" onClick={onClose} />
      <div className="absolute right-2 top-full mt-1 z-20 w-52 bg-panel-light border border-border rounded shadow-lg py-1">
        {collections.length === 0 && !creating && (
          <p className="px-3 py-2 text-xs text-text-muted">{t('sidebar.noCollectionsShort')}</p>
        )}
        {collections.map((c) => (
          <button
            key={c.id}
            onClick={() => saveTo(c.id)}
            className="w-full text-left px-3 py-1.5 text-xs text-text-primary hover:bg-panel truncate"
          >
            {c.name}
          </button>
        ))}
        <div className="border-t border-border mt-1 pt-1 px-2">
          {creating ? (
            <div className="flex items-center gap-1">
              <input
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreate();
                  if (e.key === 'Escape') onClose();
                }}
                placeholder={t('sidebar.collectionNamePlaceholder')}
                className="flex-1 bg-app-bg border border-border rounded px-2 py-1 text-xs text-text-primary focus:outline-none focus:border-accent"
              />
              <button onClick={handleCreate} className="text-emerald-400 hover:text-emerald-300">
                <Check size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setCreating(true)}
              className="w-full flex items-center gap-1.5 px-1 py-1 text-xs text-text-secondary hover:text-text-primary"
            >
              <FolderPlus size={13} />
              {t('sidebar.newCollection')}
            </button>
          )}
        </div>
      </div>
    </>
  );
}

function HistorySection() {
  const history = useHistoryStore((state) => state.history);
  const clearHistory = useHistoryStore((state) => state.clearHistory);
  const activeTabId = useTabsStore((state) => state.activeTabId);
  const updateTabRequest = useTabsStore((state) => state.updateTabRequest);
  const [isOpen, setIsOpen] = useState(true);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [saveMenuFor, setSaveMenuFor] = useState<string | null>(null);
  const t = useT();

  const handleRestoreEntry = (entry: HistoryEntry) => {
    updateTabRequest(activeTabId, entry.request);
  };

  return (
    <div>
      <SectionHeader
        icon={<History size={14} className="text-text-secondary" />}
        label={t('sidebar.history')}
        count={history.length}
        isOpen={isOpen}
        onToggle={() => setIsOpen(!isOpen)}
        actions={
          history.length > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                clearHistory();
              }}
              className="p-1 rounded hover:bg-panel-light text-text-muted hover:text-red-400 transition-colors"
              title={t('sidebar.clearHistory')}
            >
              <Trash2 size={12} />
            </button>
          )
        }
      />
      {isOpen && (
        <>
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 gap-2 text-text-muted">
              <Clock size={22} className="opacity-50" />
              <p className="text-xs text-center px-4">{t('sidebar.noHistory')}</p>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {history.map((entry) => (
                <div
                  key={entry.id}
                  className={`relative px-3 py-2.5 transition-colors ${
                    hoveredId === entry.id ? 'bg-panel-light' : ''
                  }`}
                  onMouseEnter={() => setHoveredId(entry.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  <button onClick={() => handleRestoreEntry(entry)} className="w-full text-left">
                    <div className="flex items-center gap-2 mb-1 pr-5">
                      <MethodBadge method={entry.request.method} />
                      <span
                        className={`text-xs px-1.5 py-0.5 rounded font-mono ${
                          entry.response.status >= 500
                            ? 'text-red-400 bg-red-400/10'
                            : entry.response.status >= 400
                            ? 'text-orange-400 bg-orange-400/10'
                            : entry.response.status >= 300
                            ? 'text-yellow-400 bg-yellow-400/10'
                            : 'text-emerald-400 bg-emerald-400/10'
                        }`}
                      >
                        {entry.response.status}
                      </span>
                    </div>
                    <p className="text-xs font-mono text-text-primary truncate" title={entry.request.url}>
                      {entry.request.url || '(no URL)'}
                    </p>
                    <p className="text-xs text-text-muted mt-0.5">{formatDate(entry.timestamp)}</p>
                  </button>
                  <button
                    onClick={() => setSaveMenuFor(saveMenuFor === entry.id ? null : entry.id)}
                    className="absolute top-2.5 right-2 p-1 rounded text-text-muted hover:text-accent hover:bg-panel transition-colors"
                    title={t('sidebar.saveToCollection')}
                  >
                    <Save size={12} />
                  </button>
                  {saveMenuFor === entry.id && (
                    <SaveToCollectionMenu
                      request={entry.request}
                      onClose={() => setSaveMenuFor(null)}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function CollectionRow({ collection }: { collection: Collection }) {
  const renameCollection = useCollectionsStore((state) => state.renameCollection);
  const deleteCollection = useCollectionsStore((state) => state.deleteCollection);
  const removeItem = useCollectionsStore((state) => state.removeItem);
  const activeTabId = useTabsStore((state) => state.activeTabId);
  const updateTabRequest = useTabsStore((state) => state.updateTabRequest);
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(collection.name);
  const t = useT();

  const handleOpenItem = (item: CollectionItem) => {
    updateTabRequest(activeTabId, item.request);
  };

  const commitRename = () => {
    renameCollection(collection.id, name);
    setEditing(false);
  };

  return (
    <div>
      <div className="group flex items-center gap-1.5 px-3 py-2 hover:bg-panel-light transition-colors">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1.5 flex-1 min-w-0 text-left"
        >
          {expanded ? (
            <FolderOpen size={13} className="text-accent flex-shrink-0" />
          ) : (
            <Folder size={13} className="text-text-muted flex-shrink-0" />
          )}
          {editing ? (
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commitRename();
                if (e.key === 'Escape') setEditing(false);
              }}
              onBlur={commitRename}
              className="flex-1 bg-app-bg border border-border rounded px-1.5 py-0.5 text-xs text-text-primary focus:outline-none focus:border-accent"
            />
          ) : (
            <span className="text-xs text-text-primary truncate">{collection.name}</span>
          )}
          {collection.items.length > 0 && (
            <span className="text-[10px] text-text-muted flex-shrink-0">
              {collection.items.length}
            </span>
          )}
        </button>
        <div className="hidden group-hover:flex items-center gap-0.5 flex-shrink-0">
          <button
            onClick={() => downloadJson(`${sanitizeFilename(collection.name)}.json`, { name: collection.name, items: collection.items })}
            className="p-1 rounded text-text-muted hover:text-text-primary hover:bg-panel"
            title={t('sidebar.exportCollection')}
          >
            <Download size={11} />
          </button>
          <button
            onClick={() => setEditing(true)}
            className="p-1 rounded text-text-muted hover:text-text-primary hover:bg-panel"
            title={t('sidebar.rename')}
          >
            <Pencil size={11} />
          </button>
          <button
            onClick={() => deleteCollection(collection.id)}
            className="p-1 rounded text-text-muted hover:text-red-400 hover:bg-panel"
            title={t('sidebar.deleteCollection')}
          >
            <Trash2 size={11} />
          </button>
        </div>
      </div>
      {expanded && (
        <div className="pl-6">
          {collection.items.length === 0 ? (
            <p className="text-xs text-text-muted px-3 py-2">{t('sidebar.collectionEmpty')}</p>
          ) : (
            collection.items.map((item) => (
              <div
                key={item.id}
                className="group/item flex items-center gap-1.5 px-3 py-1.5 hover:bg-panel-light transition-colors"
              >
                <button
                  onClick={() => handleOpenItem(item)}
                  className="flex items-center gap-2 flex-1 min-w-0 text-left"
                >
                  <MethodBadge method={item.request.method} />
                  <span className="text-xs font-mono text-text-primary truncate" title={item.name}>
                    {item.name}
                  </span>
                </button>
                <button
                  onClick={() => removeItem(collection.id, item.id)}
                  className="opacity-0 group-hover/item:opacity-100 p-1 rounded text-text-muted hover:text-red-400 flex-shrink-0"
                  title={t('sidebar.removeFromCollection')}
                >
                  <X size={11} />
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function CollectionsSection() {
  const collections = useCollectionsStore((state) => state.collections);
  const createCollection = useCollectionsStore((state) => state.createCollection);
  const importCollection = useCollectionsStore((state) => state.importCollection);
  const [isOpen, setIsOpen] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const t = useT();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCreate = () => {
    if (!newName.trim()) {
      setCreating(false);
      return;
    }
    createCollection(newName);
    setNewName('');
    setCreating(false);
  };

  const handleImportFiles = async (files: FileList | null) => {
    if (!files) return;
    for (const file of Array.from(files)) {
      try {
        const parsed = JSON.parse(await file.text());
        importCollection(parsed);
      } catch {
        // Skip files that aren't valid collection exports
      }
    }
    setIsOpen(true);
  };

  return (
    <div>
      <SectionHeader
        icon={<Folder size={14} className="text-text-secondary" />}
        label={t('sidebar.collections')}
        count={collections.length}
        isOpen={isOpen}
        onToggle={() => setIsOpen(!isOpen)}
        actions={
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              multiple
              hidden
              onChange={(e) => {
                handleImportFiles(e.target.files);
                e.target.value = '';
              }}
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              className="p-1 rounded hover:bg-panel-light text-text-muted hover:text-accent transition-colors"
              title={t('sidebar.importCollection')}
            >
              <FolderInput size={13} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(true);
                setCreating(true);
              }}
              className="p-1 rounded hover:bg-panel-light text-text-muted hover:text-accent transition-colors"
              title={t('sidebar.newCollection')}
            >
              <FolderPlus size={13} />
            </button>
          </>
        }
      />
      {isOpen && (
        <>
          {creating && (
            <div className="flex items-center gap-1 px-3 py-2 border-b border-border/50">
              <input
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreate();
                  if (e.key === 'Escape') setCreating(false);
                }}
                onBlur={handleCreate}
                placeholder={t('sidebar.collectionNamePlaceholder')}
                className="flex-1 bg-app-bg border border-border rounded px-2 py-1 text-xs text-text-primary focus:outline-none focus:border-accent"
              />
            </div>
          )}
          {collections.length === 0 && !creating ? (
            <div className="flex flex-col items-center justify-center py-8 gap-2 text-text-muted">
              <Folder size={22} className="opacity-50" />
              <p className="text-xs text-center px-4">{t('sidebar.noCollections')}</p>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {collections.map((c) => (
                <CollectionRow key={c.id} collection={c} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const t = useT();

  if (isCollapsed) {
    return (
      <div className="w-10 flex flex-col items-center border-r border-border bg-panel">
        <button
          onClick={onToggle}
          className="mt-4 p-2 rounded hover:bg-panel-light text-text-muted hover:text-text-primary transition-colors"
          title={t('sidebar.expandSidebar')}
        >
          <ChevronRight size={16} />
        </button>
        <div className="mt-4 flex flex-col gap-3">
          <Folder size={16} className="text-text-muted" />
          <History size={16} className="text-text-muted" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-64 flex flex-col border-r border-border bg-panel overflow-hidden">
      <div className="flex items-center justify-end px-2 py-1.5 border-b border-border flex-shrink-0">
        <button
          onClick={onToggle}
          className="p-1 rounded hover:bg-panel-light text-text-muted hover:text-text-primary transition-colors"
          title={t('sidebar.collapseSidebar')}
        >
          <ChevronLeft size={14} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        <CollectionsSection />
        <HistorySection />
      </div>
    </div>
  );
}
