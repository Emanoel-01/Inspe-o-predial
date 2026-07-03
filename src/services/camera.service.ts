import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CameraService {
  private stream: MediaStream | null = null;
  private mockIntervalId: any = null;
  simulacaoAtiva = signal(false);

  private criarMockStream(): MediaStream {
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');

    let angle = 0;
    const draw = () => {
      if (!ctx) return;
      // Background
      ctx.fillStyle = '#0f172a'; // slate-900
      ctx.fillRect(0, 0, 640, 480);

      // Grid
      ctx.strokeStyle = '#334155'; // slate-700
      ctx.lineWidth = 1;
      for (let i = 0; i < 640; i += 40) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, 480);
        ctx.stroke();
      }
      for (let j = 0; j < 480; j += 40) {
        ctx.beginPath();
        ctx.moveTo(0, j);
        ctx.lineTo(640, j);
        ctx.stroke();
      }

      // Scanner target
      ctx.strokeStyle = '#0ea5e9'; // sky-500
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(320, 240, 100, 0, Math.PI * 2);
      ctx.stroke();

      // Scanning line
      const lineY = 240 + Math.sin(angle) * 100;
      ctx.strokeStyle = '#38bdf8'; // sky-400
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(220, lineY);
      ctx.lineTo(420, lineY);
      ctx.stroke();

      // Text status
      ctx.fillStyle = '#f8fafc'; // slate-50
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('SIMULAÇÃO DE CÂMERA ATIVA', 320, 80);

      ctx.font = '12px monospace';
      ctx.fillStyle = '#94a3b8'; // slate-400
      ctx.fillText('Nenhum dispositivo físico detectado', 320, 110);
      ctx.fillText('Gerando fluxo de vídeo simulado...', 320, 130);

      // Date & Time
      ctx.fillStyle = '#38bdf8';
      ctx.fillText(new Date().toLocaleString('pt-BR'), 320, 400);

      angle += 0.05;
    };

    draw();

    this.mockIntervalId = setInterval(draw, 1000 / 30); // 30 FPS

    const stream = (canvas as any).captureStream ? (canvas as any).captureStream(30) : null;
    if (stream) {
      return stream;
    }

    throw new Error('Câmera indisponível e simulação não suportada.');
  }

  /**
   * Liga a câmera priorizando a traseira; guarda o stream internamente
   * e retorna o stream para que a UI possa usá-lo se necessário.
   */
   async iniciar(preferirTraseira = true): Promise<MediaStream> {
    if (typeof navigator === 'undefined') {
      throw new Error('Câmera indisponível ou permissão negada');
    }

    // Se já houver um stream ativo, para antes de iniciar
    this.parar();

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.warn('API de mídia indisponível. Iniciando simulação de câmera...');
      try {
        this.stream = this.criarMockStream();
        this.simulacaoAtiva.set(true);
        return this.stream;
      } catch (mockError) {
        console.error('Falha ao iniciar simulação de câmera:', mockError);
        throw new Error('Câmera indisponível ou permissão negada');
      }
    }

    const constraints: MediaStreamConstraints = {
      video: preferirTraseira
        ? { facingMode: { ideal: 'environment' } }
        : { facingMode: 'user' },
      audio: false
    };

    try {
      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.simulacaoAtiva.set(false);
      return this.stream;
    } catch (error) {
      console.warn('Falha ao iniciar câmera traseira ideal. Tentando fallback para qualquer câmera...', error);
      try {
        this.stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        this.simulacaoAtiva.set(false);
        return this.stream;
      } catch (fallbackError) {
        console.warn('Falha geral ao iniciar câmera física. Iniciando simulação de câmera...', fallbackError);
        try {
          this.stream = this.criarMockStream();
          this.simulacaoAtiva.set(true);
          return this.stream;
        } catch (mockError) {
          console.error('Falha ao iniciar simulação de câmera após falha da física:', mockError);
          throw new Error('Câmera indisponível ou permissão negada');
        }
      }
    }
  }

  /**
   * Desliga a câmera: para todas as tracks e limpa o stream interno.
   */
  parar(): void {
    if (this.mockIntervalId) {
      clearInterval(this.mockIntervalId);
      this.mockIntervalId = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach(track => {
        track.stop();
      });
      this.stream = null;
    }
    this.simulacaoAtiva.set(false);
  }

  /**
   * Captura um frame a partir do próprio stream interno (não recebe <video>).
   * Cria um <video> temporário em memória ligado ao stream interno,
   * aguarda a reprodução de um frame, pinta num canvas em memória
   * e resolve em um Blob JPEG com qualidade 0.85.
   */
  async capturarBlob(): Promise<Blob> {
    if (!this.stream) {
      throw new Error('Câmera não iniciada');
    }

    const video = document.createElement('video');
    video.srcObject = this.stream;
    video.playsInline = true;
    video.muted = true;

    await new Promise<void>((resolve, reject) => {
      video.onloadedmetadata = () => {
        video.play()
          .then(() => {
            if (video.videoWidth > 0 && video.videoHeight > 0) {
              resolve();
            } else {
              video.onplaying = () => resolve();
            }
          })
          .catch(reject);
      };
      video.onerror = (err) => reject(new Error('Erro no carregamento do vídeo para captura'));
      
      // Timeout de segurança
      setTimeout(() => reject(new Error('Timeout ao aguardar reprodução do vídeo em memória')), 5000);
    });

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Não foi possível obter o contexto 2D do canvas em memória');
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Limpa referências do vídeo temporário
    video.srcObject = null;
    video.load();

    return new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Falha ao gerar o Blob da imagem capturada'));
          }
        },
        'image/jpeg',
        0.85
      );
    });
  }

  /**
   * Coordenada atual do GPS; retorna null em caso de erro ou permissão negada (nunca lança erro).
   */
  async obterLocalizacao(): Promise<{ lat: number; lng: number; accuracy: number } | null> {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      return null;
    }

    return new Promise<{ lat: number; lng: number; accuracy: number } | null>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        (error) => {
          console.warn('Erro ao obter localização via GPS:', error);
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 8000,
          maximumAge: 0
        }
      );
    });
  }
}
