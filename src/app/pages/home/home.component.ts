import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  readonly navigationItems = [
    { label: 'News Feed', icon: '📰', badge: 0, active: true },
    { label: 'Mensagens', icon: '💬', badge: 6 },
    { label: 'Fóruns', icon: '🧠', badge: 3 },
    { label: 'Amigos', icon: '🤝' },
    { label: 'Mídia', icon: '🎬' },
    { label: 'Configurações', icon: '⚙️' }
  ];

  readonly feedTabs = ['Recentes', 'Amigos', 'Popular'];
  selectedTab = this.feedTabs[0];

  readonly feedItems = [
    {
      author: 'George Lobko',
      avatar: 'https://i.pravatar.cc/80?img=12',
      role: 'Fotógrafo de esportes de aventura',
      time: '2 horas atrás',
      content:
        'Dei um pulo nos Andes e consegui registrar esse momento incrível do trail. Quem aí encararia essa subida?',
      tags: ['#trailrunning', '#mountainlife', '#endurance'],
      images: [
        {
          url: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=500&q=60',
          alt: 'Atletas descansando em trilha'
        },
        {
          url: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=500&q=60',
          alt: 'Close de tênis de corrida em montanha'
        },
        {
          url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=500&q=60',
          alt: 'Montanha nevada ao fundo'
        }
      ],
      stats: { likes: 6355, comments: 248, shares: 92 },
  accent: 'linear-gradient(135deg, #fff3df 0%, #ffe3c7 100%)'
    },
    {
      author: 'Vitaly Boyko',
      avatar: 'https://i.pravatar.cc/80?img=32',
      role: 'Nutricionista esportivo',
      time: '3 horas atrás',
      content:
        'Estou testando um latte de coco com mix de proteínas vegetais para o elenco. Fórmula leve e cheia de energia para jogos decisivos!',
      tags: ['#nutrição', '#matchday', '#energia'],
      images: [],
      stats: { likes: 2810, comments: 134, shares: 41 },
  accent: 'linear-gradient(135deg, #ffe9d2 0%, #ffd5b0 100%)'
    }
  ];

  readonly stories = [
    {
      title: 'Treino na altitude',
      author: 'Anatoly Prok',
      image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=300&q=60'
    },
    {
      title: 'Arena lotada',
      author: 'Lolita Earns',
      image: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=300&q=60'
    }
  ];

  readonly suggestions = [
    {
      name: 'Nick Shelburne',
      role: 'Comentarista NBA',
      avatar: 'https://i.pravatar.cc/64?img=18'
    },
    {
      name: 'Brittni Lando',
      role: 'Analista de performance',
      avatar: 'https://i.pravatar.cc/64?img=5'
    },
    {
      name: 'Ivan Shevchenko',
      role: 'Coach de eSports',
      avatar: 'https://i.pravatar.cc/64?img=43'
    }
  ];

  readonly recommendations = [
    { title: 'UI/UX', color: 'linear-gradient(135deg, #fff9ed 0%, #ffe3c7 100%)', icon: '🎨' },
    { title: 'Música', color: 'linear-gradient(135deg, #fff3e0 0%, #ffd7b2 100%)', icon: '🎧' },
    { title: 'Culinária', color: 'linear-gradient(135deg, #fff7e6 0%, #ffe0bc 100%)', icon: '🥗' },
    { title: 'Trilhas', color: 'linear-gradient(135deg, #fff2df 0%, #ffd6ad 100%)', icon: '🥾' }
  ];

  readonly footerLinks = ['Sobre', 'Ajuda', 'Políticas', 'Privacidade'];

  handlePost(content: string): void {
    // Espaço reservado para integração futura com o backend
    console.log('Post enviado:', content);
  }

  selectTab(tab: string): void {
    this.selectedTab = tab;
  }

  handleFollow(name: string): void {
    console.log('Seguir usuário:', name);
  }
}
