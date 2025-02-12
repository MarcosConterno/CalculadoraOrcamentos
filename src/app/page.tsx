'use client'; // Direção obrigatória para componentes do lado do cliente

import { useState } from 'react';
import jsPDF from 'jspdf';
import Select from 'react-select'; // Importando o react-select

// Definições das ações pré-determinadas
const predefinedActions = [
  { id: 1, description: '(RPA) Navegar para a primeira tela do robo', hours: 2.0 },
  { id: 2, description: '(RPA) Preencher dados na tela de login', hours: 1.5 },
  { id: 3, description: '(RPA) Resolver recaptcha', hours: 1.5 },
  { id: 4, description: '(RPA) Resolver captcha simples', hours: 0.3 },
  { id: 5, description: '(RPA) Navegar para outra tela', hours: 1.0 },
  { id: 6, description: '(RPA) Interação com a tela', hours: 0.05 },
  { id: 7, description: '(RPA) Ler Campo da tela', hours: 0.1 },
  { id: 8, description: '(RPA) Baixar documento (.pdf, .doc, etc)', hours: 2.0 },
  { id: 9, description: 'Tem VPN?', hours: 3.0 },
  { id: 10, description: '(API) Ler Campo da API', hours: 1.0 },
  { id: 11, description: '(API) Preencher campo API', hours: 0.5 },
  { id: 12, description: 'Outra ação não catalogada', hours: 0.0 },
  { id: 13, description: '(API) Estudo completo de API de terceiros', hours: 8.0 },
  { id: 14, description: '(RPA) Clique de Botão', hours: 0.5 },
];

const valuePerHour = 220;

export default function Home() {
  const [items, setItems] = useState([]);
  const [selectedAction, setSelectedAction] = useState('');
  const [fileContent, setFileContent] = useState('');
  const [projectName, setProjectName] = useState('Orçamento de Projeto'); // Nome do projeto

  // Função para adicionar um item com base na ação selecionada
  const addItem = () => {
    const action = predefinedActions.find(action => action.id === selectedAction);

    if (action) {
      const newItem = {
        description: action.description,
        hours: Math.round(action.hours * 100) / 100, // Arredondando as horas para 2 casas decimais
        value: Math.round(action.hours * valuePerHour * 100) / 100, // Arredondando o valor
      };
      setItems([...items, newItem]);
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    
    // Definindo fontes
    doc.setFont('helvetica', 'bold'); // Título em negrito
    
    // Título
    doc.setFontSize(18);
    doc.setTextColor(0, 0, 0);  // Preto para o título
    doc.text(projectName, 105, 20, { align: 'center' }); // Nome do projeto no título
  
    let y = 30;
  
    // Tabela de Itens
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);  // Preto para o texto da tabela
  
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
  
    const totalWithMinValue = totalValue + 220;
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

  // Função para tratar o evento de pressionar a tecla Enter
  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      addItem();
    }
  };

  // Transformando as ações em um formato adequado para o react-select
  const actionOptions = predefinedActions.map(action => ({
    value: action.id,
    label: action.description,
  }));

  // Função para importar o arquivo TXT
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        setFileContent(content); // Guarda o conteúdo do arquivo
      };
      reader.readAsText(file);
    }
  };

  // Função para processar o conteúdo do arquivo e adicionar itens automaticamente
  const parseFileContent = () => {
    if (!fileContent) {
      alert('Por favor, carregue um arquivo primeiro.');
      return;
    }

    const lines = fileContent.split('\n').map(line => line.trim());

    const newItems = [];

    // Processa cada linha do arquivo
    lines.forEach((line) => {
      // Ignorar linhas de comentário que começam com '---'
      if (line.startsWith('---')) {
        return;
      }

      if (line.toLowerCase().includes('clique') || line.toLowerCase().includes('botão')) {
        newItems.push({
          description: '06- (RPA) Interação com a tela (cpf, nome, idade, número do processo e etc)',
          hours: 0.05,
          value: 0.05 * valuePerHour,
        });
      } else if (line.toLowerCase().includes('ler campo') || line.toLowerCase().includes('leitura de informação')) {
        newItems.push({
          description: '07 - (RPA) Ler Campo da tela',
          hours: 0.1,
          value: 0.1 * valuePerHour,
        });
      } else if (line.toLowerCase().includes('preencher')) {
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
      } else if (line.toLowerCase().includes('captcha')) {
        newItems.push({
          description: '(RPA) Resolver captcha simples',
          hours: 0.3,
          value: 0.3 * valuePerHour,
        });
      } else if (line.toLowerCase().includes('vpn')) {
        newItems.push({
          description: 'Tem VPN?',
          hours: 3.0,
          value: 3.0 * valuePerHour,
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

  // Totalizadores
  const totalHours = items.reduce((acc, item) => acc + item.hours, 0);
  const totalValue = items.reduce((acc, item) => acc + item.value, 0);
  const totalWithMinValue = totalValue + 220;
  const totalWithCommission = items.length > 0 ? totalWithMinValue + totalWithMinValue * 0.30 : totalWithMinValue;

  return (
    <div className="container mx-auto p-8 bg-gray-50 rounded-lg shadow-xl">
      <h1 className="text-4xl font-extrabold text-center mb-8 text-indigo-600">Sistema de Orçamento de Projetos</h1>

      {/* Campo de Nome do Projeto */}
      <div className="mb-6">
        <label htmlFor="projectName" className="text-lg font-medium text-gray-700">Nome do Projeto</label>
        <input
          type="text"
          id="projectName"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          className="mt-2 p-3 border rounded-lg w-full"
          placeholder="Digite o nome do projeto"
        />
      </div>

      {/* Seletor de Ação */}
      <div className="mb-6">
        <label htmlFor="actionSelect" className="text-lg font-medium text-gray-700">Escolha uma Ação</label>
        <Select
          id="actionSelect"
          options={actionOptions}
          onChange={(selected) => setSelectedAction(selected?.value || '')}
          placeholder="Selecione uma ação"
          className="mt-2 w-full"
        />
      </div>

      {/* Botões de Adicionar, Carregar Arquivo e Exportar */}
      <div className="flex justify-between">
        <button
          onClick={addItem}
          className="bg-blue-500 text-white py-2 px-4 rounded-lg"
        >
          Adicionar Item
        </button>

        <input
          type="file"
          onChange={handleFileUpload}
          accept=".txt"
          className="border rounded-lg p-2"
        />
        <button
          onClick={parseFileContent}
          className="bg-green-500 text-white py-2 px-4 rounded-lg"
        >
          Processar Arquivo
        </button>
        <button
          onClick={generatePDF}
          className="bg-indigo-500 text-white py-2 px-4 rounded-lg"
        >
          Gerar PDF
        </button>
        <button
          onClick={exportToJSON}
          className="bg-teal-500 text-white py-2 px-4 rounded-lg"
        >
          Exportar JSON
        </button>
      </div>

      {/* Tabela */}
      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Itens Adicionados</h2>
        <table className="table-auto w-full text-left border-collapse">
          <thead>
            <tr>
              <th className="px-4 py-2">Descrição</th>
              <th className="px-4 py-2">Horas</th>
              <th className="px-4 py-2">Valor</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index} className="border-t">
                <td className="px-4 py-2">{item.description}</td>
                <td className="px-4 py-2">{item.hours} horas</td>
                <td className="px-4 py-2">R$ {item.value.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totalizadores */}
      <div className="mt-6">
        <h3 className="text-xl font-semibold">Totalizadores</h3>
        <p>Total de Horas: {Math.round(totalHours * 100) / 100} horas</p>
        <p>Total com Comissão: R$ {totalWithCommission.toFixed(2)}</p>
      </div>
    </div>
  );
}
