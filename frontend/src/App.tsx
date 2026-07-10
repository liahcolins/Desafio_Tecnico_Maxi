import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  Users, 
  ArrowRightLeft, 
  FileText, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PlusCircle, 
  Trash2, 
  AlertTriangle,
  Info
} from 'lucide-react';
import { 
  peopleService, 
  transactionsService, 
  totalsService 
} from './services/api';
import type { 
  Person, 
  Transaction, 
  TotalsReport 
} from './services/api';

type ActiveTab = 'totals' | 'people' | 'transactions';
type ToastType = 'success' | 'error';

interface ToastState {
  message: string;
  type: ToastType;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('totals');
  
  // Data States
  const [people, setPeople] = useState<Person[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalsReport, setTotalsReport] = useState<TotalsReport | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Form States - Person
  const [personName, setPersonName] = useState<string>('');
  const [personAge, setPersonAge] = useState<string>('');
  
  // Form States - Transaction
  const [txDescription, setTxDescription] = useState<string>('');
  const [txValue, setTxValue] = useState<string>('');
  const [txType, setTxType] = useState<'despesa' | 'receita'>('despesa');
  const [txPersonId, setTxPersonId] = useState<string>('');

  // UI States
  const [toast, setToast] = useState<ToastState | null>(null);

  // Helper to show toasts
  const showToast = (message: string, type: ToastType) => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Fetch all data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [peopleData, transactionsData, totalsData] = await Promise.all([
        peopleService.getAll(),
        transactionsService.getAll(),
        totalsService.getReport()
      ]);
      setPeople(peopleData);
      setTransactions(transactionsData);
      setTotalsReport(totalsData);
    } catch (err: any) {
      console.error(err);
      showToast('Falha ao sincronizar dados com o servidor backend.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Fetch only totals (useful after updates to keep summary refreshed)
  const refreshTotalsAndTransactions = async () => {
    try {
      const [totalsData, transactionsData, peopleData] = await Promise.all([
        totalsService.getReport(),
        transactionsService.getAll(),
        peopleService.getAll()
      ]);
      setTotalsReport(totalsData);
      setTransactions(transactionsData);
      setPeople(peopleData);
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Person Submit
  const handleAddPerson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!personName.trim()) {
      showToast('O nome é obrigatório.', 'error');
      return;
    }
    const ageNum = parseInt(personAge);
    if (isNaN(ageNum) || ageNum < 0 || ageNum > 150) {
      showToast('Insira uma idade válida entre 0 e 150 anos.', 'error');
      return;
    }

    try {
      const newPerson = await peopleService.create(personName, ageNum);
      showToast(`Pessoa '${newPerson.name}' cadastrada com sucesso!`, 'success');
      setPersonName('');
      setPersonAge('');
      await fetchData();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Erro ao cadastrar pessoa.';
      showToast(msg, 'error');
    }
  };

  // Handle Person Delete
  const handleDeletePerson = async (id: string, name: string) => {
    if (!window.confirm(`Tem certeza de que deseja excluir ${name}? Todas as transações desta pessoa serão apagadas permanentemente.`)) {
      return;
    }

    try {
      await peopleService.delete(id);
      showToast(`Pessoa '${name}' e todas as suas transações foram excluídas.`, 'success');
      await fetchData();
    } catch (err: any) {
      showToast('Erro ao excluir pessoa.', 'error');
    }
  };

  // Handle Transaction Submit
  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!txDescription.trim()) {
      showToast('A descrição é obrigatória.', 'error');
      return;
    }
    const valueNum = parseFloat(txValue.replace(',', '.'));
    if (isNaN(valueNum) || valueNum <= 0) {
      showToast('Insira um valor maior que zero.', 'error');
      return;
    }
    if (!txPersonId) {
      showToast('Selecione a pessoa responsável pela transação.', 'error');
      return;
    }

    // Dynamic Client-side Validation (matching backend rule)
    const selectedPerson = people.find(p => p.id === txPersonId);
    if (selectedPerson && selectedPerson.age < 18 && txType === 'receita') {
      showToast(`A pessoa '${selectedPerson.name}' é menor de idade (${selectedPerson.age} anos) e só pode ter despesas cadastradas.`, 'error');
      return;
    }

    try {
      await transactionsService.create(txDescription, valueNum, txType, txPersonId);
      showToast('Transação cadastrada com sucesso!', 'success');
      setTxDescription('');
      setTxValue('');
      await refreshTotalsAndTransactions();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Erro ao cadastrar transação.';
      showToast(msg, 'error');
    }
  };

  // Automatically switch transaction type to expense if selected person is under 18
  const handlePersonSelectChange = (personId: string) => {
    setTxPersonId(personId);
    const selectedPerson = people.find(p => p.id === personId);
    if (selectedPerson && selectedPerson.age < 18) {
      setTxType('despesa'); // Forçar despesa
    }
  };

  // Format currency helper
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(val);
  };

  // Get selected person details for UI warning
  const selectedPersonForTx = people.find(p => p.id === txPersonId);
  const isSelectedPersonMinor = selectedPersonForTx ? selectedPersonForTx.age < 18 : false;

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="logo-container">
          <div className="logo-icon">
            <Wallet size={20} />
          </div>
          <span className="logo-text">GastosResidenciais</span>
        </div>

        <nav>
          <ul className="nav-links">
            <li 
              className={`nav-item ${activeTab === 'totals' ? 'active' : ''}`}
              onClick={() => setActiveTab('totals')}
            >
              <FileText size={18} />
              <span>Totais & Resumos</span>
            </li>
            <li 
              className={`nav-item ${activeTab === 'people' ? 'active' : ''}`}
              onClick={() => setActiveTab('people')}
            >
              <Users size={18} />
              <span>Pessoas</span>
            </li>
            <li 
              className={`nav-item ${activeTab === 'transactions' ? 'active' : ''}`}
              onClick={() => setActiveTab('transactions')}
            >
              <ArrowRightLeft size={18} />
              <span>Transações</span>
            </li>
          </ul>
        </nav>

        <div className="sidebar-footer">
          <span>Controle de Gastos v1.0.0</span>
        </div>
      </aside>

      {/* Main Content View */}
      <main className="main-content">
        
        {/* VIEW 1: TOTALS AND SUMMARY */}
        {activeTab === 'totals' && (
          <div>
            <div className="view-header">
              <div className="header-title">
                <h1>Painel Financeiro</h1>
                <p>Visão geral de receitas, despesas e saldos individuais e gerais.</p>
              </div>
              <button className="btn btn-secondary" onClick={fetchData}>Sincronizar</button>
            </div>

            {/* Consolidated Widgets */}
            <div className="summary-grid">
              <div className="summary-card revenue">
                <div className="card-info">
                  <span>Total Receitas</span>
                  <h2>{formatCurrency(totalsReport?.grandTotalRevenue ?? 0)}</h2>
                </div>
                <div className="card-icon-wrapper">
                  <TrendingUp size={24} />
                </div>
              </div>

              <div className="summary-card expense">
                <div className="card-info">
                  <span>Total Despesas</span>
                  <h2>{formatCurrency(totalsReport?.grandTotalExpenses ?? 0)}</h2>
                </div>
                <div className="card-icon-wrapper">
                  <TrendingDown size={24} />
                </div>
              </div>

              <div className="summary-card balance">
                <div className="card-info">
                  <span>Saldo Líquido</span>
                  <h2 className={(totalsReport?.grandNetBalance ?? 0) >= 0 ? 'value-revenue' : 'value-expense'}>
                    {formatCurrency(totalsReport?.grandNetBalance ?? 0)}
                  </h2>
                </div>
                <div className="card-icon-wrapper">
                  <DollarSign size={24} />
                </div>
              </div>
            </div>

            {/* Table Detail */}
            <div className="glass-card">
              <div className="card-header">
                <h2>
                  <FileText size={20} className="value-neutral" />
                  Demonstrativo por Pessoa
                </h2>
              </div>

              {loading ? (
                <div className="empty-state">Carregando dados...</div>
              ) : !totalsReport || totalsReport.people.length === 0 ? (
                <div className="empty-state">
                  <Users className="empty-state-icon" />
                  <p>Nenhuma pessoa cadastrada para exibir o demonstrativo.</p>
                  <button className="btn btn-primary" onClick={() => setActiveTab('people')}>
                    <PlusCircle size={16} /> Cadastrar Pessoa
                  </button>
                </div>
              ) : (
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Nome</th>
                        <th>Idade</th>
                        <th>Receitas</th>
                        <th>Despesas</th>
                        <th>Saldo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {totalsReport.people.map((p) => (
                        <tr key={p.id}>
                          <td>{p.name}</td>
                          <td>
                            <span className="badge age-badge">{p.age} anos</span>
                          </td>
                          <td className="value-revenue">{formatCurrency(p.totalRevenue)}</td>
                          <td className="value-expense">{formatCurrency(p.totalExpenses)}</td>
                          <td className={p.balance >= 0 ? 'value-revenue' : 'value-expense'}>
                            {formatCurrency(p.balance)}
                          </td>
                        </tr>
                      ))}
                      {/* Row of grand totals */}
                      <tr className="totals-row">
                        <td>TOTAL GERAL</td>
                        <td>
                          <span className="badge age-badge">{totalsReport.people.length} pes.</span>
                        </td>
                        <td className="value-revenue">{formatCurrency(totalsReport.grandTotalRevenue)}</td>
                        <td className="value-expense">{formatCurrency(totalsReport.grandTotalExpenses)}</td>
                        <td className={totalsReport.grandNetBalance >= 0 ? 'value-revenue' : 'value-expense'}>
                          {formatCurrency(totalsReport.grandNetBalance)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW 2: PEOPLE MANAGEMENT */}
        {activeTab === 'people' && (
          <div>
            <div className="view-header">
              <div className="header-title">
                <h1>Gerenciamento de Pessoas</h1>
                <p>Adicione, liste e remova pessoas do sistema.</p>
              </div>
            </div>

            <div className="split-layout">
              {/* Form Card */}
              <div className="glass-card">
                <div className="card-header">
                  <h2>Cadastrar Nova Pessoa</h2>
                </div>
                <form onSubmit={handleAddPerson} className="form-grid">
                  <div className="form-group">
                    <label htmlFor="pname">Nome Completo</label>
                    <input 
                      id="pname"
                      type="text" 
                      className="form-control" 
                      placeholder="Ex: João da Silva"
                      value={personName}
                      onChange={(e) => setPersonName(e.target.value)}
                      maxLength={100}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="page">Idade</label>
                    <input 
                      id="page"
                      type="number" 
                      className="form-control" 
                      placeholder="Ex: 28"
                      value={personAge}
                      onChange={(e) => setPersonAge(e.target.value)}
                      min="0"
                      max="150"
                    />
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ marginTop: '8px' }}>
                    <PlusCircle size={18} /> Salvar Cadastro
                  </button>
                </form>
              </div>

              {/* List Card */}
              <div className="glass-card">
                <div className="card-header">
                  <h2>Pessoas Cadastradas</h2>
                </div>

                {loading ? (
                  <div className="empty-state">Carregando...</div>
                ) : people.length === 0 ? (
                  <div className="empty-state">
                    <Users className="empty-state-icon" />
                    <p>Nenhuma pessoa cadastrada ainda.</p>
                  </div>
                ) : (
                  <div className="people-grid">
                    {people.map(p => (
                      <div className="person-card" key={p.id}>
                        <div className="person-card-header">
                          <div>
                            <span className="person-name">{p.name}</span>
                            <div className="person-info-row">
                              <span className="badge age-badge">{p.age} anos</span>
                              {p.age < 18 && (
                                <span className="badge expense" style={{fontSize: '0.65rem', padding: '3px 8px'}}>Menor</span>
                              )}
                            </div>
                          </div>
                          <button 
                            className="btn-danger-icon"
                            title="Excluir pessoa e transações"
                            onClick={() => handleDeletePerson(p.id, p.name)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* VIEW 3: TRANSACTION MANAGEMENT */}
        {activeTab === 'transactions' && (
          <div>
            <div className="view-header">
              <div className="header-title">
                <h1>Transações Financeiras</h1>
                <p>Cadastre e liste despesas e receitas residenciais.</p>
              </div>
            </div>

            <div className="split-layout">
              {/* Form Card */}
              <div className="glass-card">
                <div className="card-header">
                  <h2>Lançar Transação</h2>
                </div>
                
                {people.length === 0 ? (
                  <div className="empty-state" style={{padding: '24px 0'}}>
                    <AlertTriangle className="empty-state-icon" style={{color: '#eab308'}} />
                    <p>Você precisa cadastrar pelo menos uma pessoa antes de lançar transações.</p>
                    <button className="btn btn-primary" onClick={() => setActiveTab('people')}>
                      Ir para Pessoas
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleAddTransaction} className="form-grid">
                    <div className="form-group">
                      <label htmlFor="tx-person">Pessoa Responsável</label>
                      <select 
                        id="tx-person"
                        className="form-control"
                        value={txPersonId}
                        onChange={(e) => handlePersonSelectChange(e.target.value)}
                      >
                        <option value="">Selecione uma pessoa...</option>
                        {people.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.age} anos)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Tipo de Lançamento</label>
                      <div className="type-toggle">
                        <button 
                          type="button"
                          className={`toggle-btn ${txType === 'despesa' ? 'active expense' : ''}`}
                          onClick={() => setTxType('despesa')}
                        >
                          <TrendingDown size={16} /> Despesa
                        </button>
                        <button 
                          type="button"
                          disabled={isSelectedPersonMinor}
                          className={`toggle-btn ${txType === 'receita' ? 'active revenue' : ''}`}
                          onClick={() => setTxType('receita')}
                          style={isSelectedPersonMinor ? {opacity: 0.3, cursor: 'not-allowed'} : {}}
                          title={isSelectedPersonMinor ? 'Menores de idade só podem cadastrar despesas' : ''}
                        >
                          <TrendingUp size={16} /> Receita
                        </button>
                      </div>
                    </div>

                    {/* Warning if person is under 18 */}
                    {isSelectedPersonMinor && (
                      <div className="age-rule-alert">
                        <Info size={16} style={{flexShrink: 0, marginTop: '2px'}} />
                        <span>
                          <strong>Atenção:</strong> {selectedPersonForTx?.name} é menor de idade ({selectedPersonForTx?.age} anos). Pela regra de negócio, apenas despesas podem ser cadastradas.
                        </span>
                      </div>
                    )}

                    <div className="form-group">
                      <label htmlFor="tx-desc">Descrição</label>
                      <input 
                        id="tx-desc"
                        type="text" 
                        className="form-control" 
                        placeholder="Ex: Conta de Luz, Salário"
                        value={txDescription}
                        onChange={(e) => setTxDescription(e.target.value)}
                        maxLength={200}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="tx-val">Valor (R$)</label>
                      <input 
                        id="tx-val"
                        type="text" 
                        className="form-control" 
                        placeholder="Ex: 150,00"
                        value={txValue}
                        onChange={(e) => setTxValue(e.target.value)}
                      />
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ marginTop: '8px' }}>
                      <PlusCircle size={18} /> Confirmar Lançamento
                    </button>
                  </form>
                )}
              </div>

              {/* List Card */}
              <div className="glass-card">
                <div className="card-header">
                  <h2>Transações Recentes</h2>
                </div>

                {loading ? (
                  <div className="empty-state">Carregando...</div>
                ) : transactions.length === 0 ? (
                  <div className="empty-state">
                    <ArrowRightLeft className="empty-state-icon" />
                    <p>Nenhuma transação lançada ainda.</p>
                  </div>
                ) : (
                  <div className="transaction-list">
                    {transactions.map(t => (
                      <div className={`transaction-item ${t.type}`} key={t.id}>
                        <div className="transaction-left">
                          <div className="transaction-avatar">
                            {t.type === 'receita' ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                          </div>
                          <div className="transaction-details">
                            <h4>{t.description}</h4>
                            <p>
                              Responsável: <strong>{t.person?.name ?? 'Desconhecido'}</strong>
                            </p>
                          </div>
                        </div>
                        <div className="transaction-right">
                          <span className={`transaction-value ${t.type === 'receita' ? 'value-revenue' : 'value-expense'}`}>
                            {t.type === 'receita' ? '+' : '-'} {formatCurrency(t.value)}
                          </span>
                          <div>
                            <span className={`badge ${t.type}`}>
                              {t.type}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Toast Alert */}
      {toast && (
        <div className={`alert-toast ${toast.type}`}>
          <Info size={18} />
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
