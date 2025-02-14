'use client'; // Direção obrigatória para componentes do lado do cliente

import { useEffect, useState } from 'react';
import jsPDF from 'jspdf';
import Select from 'react-select';

// Definições das ações pré-determinadas
const predefinedActions = [
  { id: 1, description: '(RPA) Navegar para a primeira tela do robo', hours: 2.0 },
  { id: 2, description: '(RPA) Preencher dados na tela de login', hours: 1.5 },
  { id: 3, description: '(RPA) Resolver recaptcha', hours: 1.5 },
  { id: 4, description: '(RPA) Resolver captcha simples', hours: 0.3 },
  { id: 5, description: '(RPA) Navegar para outra tela', hours: 1.0 },
  { id: 6, description: '(RPA) Preencher Campo (cpf, nome, idade, número do processo e etc)', hours: 0.10 },
  { id: 7, description: '(RPA) Ler Campo da tela', hours: 0.1 },
  { id: 8, description: '(RPA) Baixar documento (.pdf, .doc, etc)', hours: 2.0 },
  { id: 9, description: '(RPA) Clique de Botão', hours: 0.50 },
  { id: 10, description: '(API) Ler Campo da API', hours: 1.0 },
  { id: 11, description: '(API) Preencher campo API', hours: 0.5 },
  { id: 12, description: 'Outra ação não catalogada', hours: 0.0 },
  { id: 13, description: '(API) Estudo completo de API de terceiros', hours: 8.0 },
  { id: 14, description: 'Tem VPN?', hours: 3.0 },
  { id: 15, description: 'Aplicação', hours: 0.5 },
];

const valuePerHour = 220;

interface Item {
  description: string;
  hours: number;
  value: number;
}

export default function Home() {
  const [items, setItems] = useState<Item[]>([]);
  const [selectedAction, setSelectedAction] = useState('');
  const [fileContent, setFileContent] = useState('');
  const [projectName, setProjectName] = useState('Orçamento de Projeto'); // Nome do projeto
  const [isDictionaryOpen, setIsDictionaryOpen] = useState(false);

  const toggleDictionary = () => {
    setIsDictionaryOpen(!isDictionaryOpen);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsDictionaryOpen(false);
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if ((event.target as HTMLElement).id === 'dictionary-modal') {
        setIsDictionaryOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  // Função para adicionar um item com base na ação selecionada
  const addItem = (event?: React.KeyboardEvent<HTMLSelectElement> | React.MouseEvent<HTMLButtonElement>) => {
    // Se for um evento de teclado, verifica se a tecla pressionada foi "Enter"
    if (event && "key" in event && event.key !== "Enter") return;

    const action = predefinedActions.find(action => action.id === Number(selectedAction));

    if (action) {
      const newItem = {
        description: action.description,
        hours: Math.round(action.hours * 100) / 100,
        value: Math.round(action.hours * valuePerHour * 100) / 100,
      };
      setItems(prevItems => [...prevItems, newItem]);
    }
  };


  const generatePDF = () => {
    const doc = new jsPDF();

    // Definindo fontes
    doc.setFont('helvetica', 'bold');

    // Título
    doc.setFontSize(18);
    doc.setTextColor(0, 0, 0);
    doc.text(projectName, 105, 20, { align: 'center' });

    let y = 30;

    // Tabela de Itens
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);

    // Cabeçalho da Tabela - Azul claro
    doc.setFillColor(40, 53, 147);  // Azul mais puxado
    doc.rect(10, y, 190, 10, 'F');  // Fundo da célula do cabeçalho

    doc.setTextColor(255, 255, 255);  // Branco para o texto do cabeçalho
    doc.text('Descrição', 15, y + 7);
    doc.text('Horas', 160, y + 7);

    y += 15;

    // Adicionando os itens na tabela
    items.forEach((item, index) => {
      // Alternando a cor de fundo das linhas - tons mais azuis
      const isEven = index % 2 === 0;
      doc.setFillColor(isEven ? 240 : 220, isEven ? 240 : 230, isEven ? 255 : 255); // Azul claro / branco
      doc.rect(10, y, 190, 10, 'F');

      doc.setTextColor(0, 0, 0);  // Texto Preto
      doc.text(item.description, 15, y + 7);
      doc.text(`${item.hours} horas`, 160, y + 7);

      y += 10;

      if (y > 260) {
        doc.addPage();
        y = 20;
      }
    });

    // Cálculos do totalizador
    const totalHours = items.reduce((acc, item) => acc + item.hours, 0);
    const totalValue = items.reduce((acc, item) => acc + item.value, 0);

    const totalWithMinValue = totalValue;
    const totalWithCommission = totalWithMinValue + totalWithMinValue * 0.30;

    // Totalizadores - Estilo destacado com fundo verde
    y += 10;
    doc.setTextColor(0, 0, 0);  // Cor preta para totalizadores
    doc.setFontSize(16);

    // Fundo azul para total de horas
    doc.setFillColor(40, 53, 147);  // Azul mais puxado
    doc.rect(10, y, 190, 10, 'F');
    doc.setTextColor(255, 255, 255);  // Texto Branco
    doc.text(`Total de Horas: ${Math.round(totalHours * 100) / 100} horas`, 105, y + 7, { align: 'center' });
    y += 15;

    // Fundo verde para o total com comissão
    doc.setTextColor(255, 255, 255);  // Texto Branco
    doc.setFillColor(34, 193, 195);  // Verde claro
    doc.rect(10, y, 190, 10, 'F');
    doc.text(`Total: R$ ${totalWithCommission.toFixed(2)}`, 105, y + 7, { align: 'center' });

    y += 15;

    // Mensagem adicional centralizada em vermelho
    doc.setFontSize(12);
    const message = 'Os valores são aproximados, após a confirmação do cliente, outra reunião será feita para análise completa do projeto.';
    const margin = 10;
    const pageWidth = doc.internal.pageSize.width;
    const textWidth = pageWidth - 2 * margin;  // Margem de 10 de cada lado

    const lines = doc.splitTextToSize(message, textWidth);

    // Texto centralizado em vermelho
    doc.setTextColor(255, 0, 0); // Vermelho
    const centerY = y + (lines.length * 7) / 2; // Ajuste para centralizar com base na quantidade de linhas
    doc.text(lines, 105, centerY, { align: 'center' });

    doc.save('orcamento.pdf');
  };

  // Transformando as ações em um formato adequado para o react-select
  const actionOptions = predefinedActions.map(action => ({
    value: action.id,
    label: action.description,
  }));

  // Função para importar o arquivo TXT
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result;
        if (typeof content === 'string') {  // Verifica se content é uma string
          setFileContent(content);
        }
      };
      reader.readAsText(file); // Lê o arquivo como texto
    }
  };

  // Função para processar o conteúdo do arquivo e adicionar itens automaticamente
  const parseFileContent = () => {
    if (!fileContent) {
      alert('Por favor, carregue um arquivo primeiro.');
      return;
    }

    const lines = fileContent.split('\n').map(line => line.trim());

    interface Item {
      description: string;
      hours: number;
      value: number;
    }

    const newItems: Item[] = [];  // Definir explicitamente o tipo como Item[]

    // Processa cada linha do arquivo
    lines.forEach((line) => {
      // Ignorar linhas de comentário que começam com '---'
      if (line.startsWith('---')) {
        return;
      }
      if (line.toLowerCase().includes('primeira tela')) {
        newItems.push({
          description: '(RPA) Navegar para a primeira tela do robo',
          hours: 2.0,
          value: 2.0 * valuePerHour,
        });
      } else if (line.toLowerCase().includes('login e senha')) {
        newItems.push({
          description: '(RPA) Preencher dados na tela de login',
          hours: 1.5,
          value: 1.5 * valuePerHour,
        });
      } else if (line.toLowerCase().includes('recaptcha')) {
        newItems.push({
          description: '(RPA) Resolver recaptcha',
          hours: 1.5,
          value: 1.5 * valuePerHour,
        });
      } else if (line.toLowerCase().includes('captcha simples')) {
        newItems.push({
          description: '(RPA) Resolver captcha simples',
          hours: 0.3,
          value: 0.3 * valuePerHour,
        });
      } else if (line.toLowerCase().includes('nova tela')) {
        newItems.push({
          description: '(RPA) Navegar para outra tela',
          hours: 1.0,
          value: 1.0 * valuePerHour,
        });
      } else if (line.toLowerCase().includes('rpa insere dados')) {
        newItems.push({
          description: '(RPA) Preencher Campo (cpf, nome, idade, número do processo e etc)',
          hours: 0.10,
          value: 0.10 * valuePerHour,
        });
      } else if (line.toLowerCase().includes('leitura de dados')) {
        newItems.push({
          description: '(RPA) Ler Campo da tela',
          hours: 0.1,
          value: 0.1 * valuePerHour,
        });
      } else if (line.toLowerCase().includes('anexar documentos')) {
        newItems.push({
          description: '(RPA) Baixar documento (.pdf, ..doc e etc)',
          hours: 2.0,
          value: 2.0 * valuePerHour,
        });
      } else if (line.toLowerCase().includes('vpn')) {
        newItems.push({
          description: 'Tem VPN?',
          hours: 3.0,
          value: 3.0 * valuePerHour,
        });
      } else if (line.toLowerCase().includes('api ler campo')) {
        newItems.push({
          description: '(API) Ler Campo da API',
          hours: 1.0,
          value: 1.0 * valuePerHour,
        });
      } else if (line.toLowerCase().includes('api autenticacao')) {
        newItems.push({
          description: '(API) Autenticação de API',
          hours: 2.0,
          value: 2.0 * valuePerHour,
        });
      } else if (line.toLowerCase().includes('api insere dados')) {
        newItems.push({
          description: '(API) Preencher campo API (cpf, nome, idade, número do processo e etc)',
          hours: 0.5,
          value: 0.5 * valuePerHour,
        });
      } else if (line.toLowerCase().includes('api estudo')) {
        newItems.push({
          description: '(API) Estudo completo de API de terceiros',
          hours: 8.0,
          value: 8.0 * valuePerHour,
        });
      } else if (line.toLowerCase().includes('clique') || line.toLowerCase().includes('botão')) {
        newItems.push({
          description: '(RPA) Clique de Botão',
          hours: 0.5,
          value: 0.5 * valuePerHour,
        });
      } else if (line.toLowerCase().includes('aplicação')) {
        newItems.push({
          description: 'Aplicação',
          hours: 4.0,
          value: 4.0 * valuePerHour,
        });
      } else {
        newItems.push({
          description: 'Outra ação não catalogada',
          hours: 0.0,
          value: 0.0 * valuePerHour,
        });
      }
    });

    setItems([...items, ...newItems]);
  };

  // Função para exportar os itens como um arquivo JSON
  const exportToJSON = () => {
    const jsonContent = JSON.stringify(items, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'orcamento.json';
    link.click();
  };
const handleEvent = (event: React.MouseEvent<HTMLButtonElement> | React.KeyboardEvent<HTMLSelectElement>) => {
    if ("key" in event) {
        console.log("Tecla pressionada:", event.key);
    } else {
        console.log("Botão clicado");
    }
};


  // Totalizadores
  const totalHours = items.reduce((acc, item) => acc + item.hours, 0);
  const totalValue = items.reduce((acc, item) => acc + item.value, 0);
  const totalWithMinValue = totalValue;
  const totalWithCommission = items.length > 0 ? totalWithMinValue + totalWithMinValue * 0.30 : totalWithMinValue;


  return (
    <div className="container mx-auto p-8 bg-gray-50 rounded-lg shadow-xl">
      <h1 className="text-4xl font-extrabold text-center mb-8 text-indigo-600">Sistema de Orçamento de Projetos</h1>
      {/* Campo de Nome do Projeto */}
      <div className="mb-6">
        <label htmlFor="project-name" className="block text-lg font-semibold text-gray-700">Nome do Projeto</label>
        <input
          type="text"
          id="project-name"
          className="mt-2 p-3 w-full border border-gray-300 rounded-lg"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
        />
      </div>

      {/* Seletor de Ações */}
      <div className="mb-6">
        <label htmlFor="action" className="block text-lg font-semibold text-gray-700 mb-2">
          Escolha uma Ação
        </label>
        <select
          id="action"
          value={selectedAction}
          onChange={(e) => setSelectedAction(e.target.value)}
          onKeyDown={addItem}
          className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-black-700"
        >
          <option value="" disabled>Selecione uma ação...</option>
          {predefinedActions.map(action => (
            <option key={action.id} value={action.id}>{action.description}</option>
          ))}
        </select>
      </div>


      {/* Botões */}
      <div className="flex space-x-4">
        <button 
          onClick={addItem}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none"
        >
          Adicionar Ação
        </button>

        {/* Upload de Arquivo */}
        <label
          htmlFor="file-upload"
          className="px-4 py-2 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 focus:outline-none cursor-pointer"
        >
          Carregar Arquivo
        </label>
        <input
          type="file"
          id="file-upload"
          className="hidden"
          accept=".txt"
          onChange={handleFileUpload}
        />
        <button
          onClick={parseFileContent}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 focus:outline-none"
        >
          Processar Arquivo
        </button>

        {/* Exportação */}
        <button
          onClick={exportToJSON}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg shadow-md hover:bg-gray-700 focus:outline-none"
        >
          Exportar para JSON
        </button>
      </div>

      {/* Botão para Gerar PDF */}
      <button
        onClick={generatePDF}
        className="px-4 mt-2 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 focus:outline-none"
      >
        Gerar PDF
      </button>

      {/* Modal do Dicionário */}
      {isDictionaryOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-3xl text-center relative overflow-auto max-h-[90vh]">
            <h2 className="text-2xl font-bold mb-4">Dicionário de Ações</h2>
            <p className="text-gray-700 mb-4">Aqui estão as definições de cada ação disponível no sistema.</p>
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border border-gray-300 px-4 py-2">NO TXT</th>
                  <th className="border border-gray-300 px-12 py-2">Calculadora</th>
                  <th className="border border-gray-300 px-4 py-2">Horas</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['primeira tela', '(RPA) Navegar para a primeira tela do robo', '2.00 horas'],
                  ['login e senha', '(RPA) Preencher dados na tela de login', '1.50 horas'],
                  ['recaptcha', '(RPA) Resolver recaptcha', '1.50 horas'],
                  ['captcha simples', '(RPA) Resolver captcha simples', '0.30 horas'],
                  ['nova tela', '(RPA) Navegar para outra tela', '1.00 horas'],
                  ['insere dados', '(RPA) Interação com a tela (cpf/nome/idade/número do processo etc)', '0.05 hora'],
                  ['leitura de dados', '(RPA) Ler Campo da tela', '0.10 horas'],
                  ['anexar documentos', '(RPA) Baixar documento (.pdf/.doc e etc)', '2.00 horas'],
                  ['vpn', 'Tem VPN?', '3.00 horas'],
                  ['api ler campo', '(API) Ler Campo da API', '1.00 horas'],
                  ['api insere dados', '(API) Preencher campo API (cpf/nome/idade/número do processo etc)', '0.50 horas'],
                  ['api estudo', '(API) Estudo completo de API de terceiros', '8.00 horas'],
                  ['api autenticacao', '(API) Autenticação de API', '2.00 horas'],
                  ['clique', '(RPA) Clique de Botão', '0.50 horas'],
                  ['aplicação', 'Aplicação', '4.00 horas'],
                  ['', 'Outra ação não catalogada', '0.00 horas']
                ].map(([txt, calc, hrs], index) => (
                  <tr key={index}>
                    <td className="border border-gray-300 px-4 py-2">{txt}</td>
                    <td className="border border-gray-300 px-4 py-2">{calc}</td>
                    <td className="border border-gray-300 px-4 py-2">{hrs}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <button
        onClick={toggleDictionary}
        className="px-4 ml-2 py-2 bg-orange-600 text-white rounded-lg shadow-md hover:bg-green-700 focus:outline-none"
      >
        Dicionário
      </button>

      {/* Tabela */}
      <div className="mt-8">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-indigo-600 text-white">
              <th className="py-2 px-4">Descrição</th>
              <th className="py-2 px-4">Horas</th>
              <th className="py-2 px-4">Valor</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-gray-100' : ''}>
                <td className="py-2 px-4">{item.description}</td>
                <td className="py-2 px-4">{item.hours}</td>
                <td className="py-2 px-4">R$ {item.value.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totalizadores */}
      <div className="mt-8">
        <div className="flex justify-between items-center text-xl font-semibold">
          <div>Total de Horas</div>
          <div>{Math.round(totalHours * 100) / 100} horas</div>
        </div>
        <div className="flex justify-between items-center text-xl font-semibold">
          <div>Total com Comissão</div>
          <div>R$ {totalWithCommission.toFixed(2)}</div>
        </div>
      </div>
    </div >
  );
}