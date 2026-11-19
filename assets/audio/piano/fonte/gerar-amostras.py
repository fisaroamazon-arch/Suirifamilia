"""Renderiza os timbres do jogo com FluidSynth, NumPy e FFmpeg."""
import ctypes as c
from pathlib import Path
import subprocess

import numpy as np


def vincular(biblioteca, nome, retorno, *argumentos):
    metodo = getattr(biblioteca, nome)
    metodo.restype = retorno
    metodo.argtypes = argumentos
    return metodo


def renderizar():
    fonte = Path(__file__).resolve().parent
    biblioteca = c.CDLL('libfluidsynth.so.3')
    ponteiro, inteiro, texto, decimal = c.c_void_p, c.c_int, c.c_char_p, c.c_double

    def fluid(nome, retorno, *argumentos):
        return vincular(biblioteca, nome, retorno, *argumentos)

    criar_configuracao = fluid('new_fluid_settings', ponteiro)
    configurar_numero = fluid('fluid_settings_setnum', inteiro, ponteiro, texto, decimal)
    configurar_inteiro = fluid('fluid_settings_setint', inteiro, ponteiro, texto, inteiro)
    criar_sintetizador = fluid('new_fluid_synth', ponteiro, ponteiro)
    carregar = fluid('fluid_synth_sfload', inteiro, ponteiro, texto, inteiro)
    selecionar = fluid('fluid_synth_program_select', inteiro, ponteiro, inteiro, inteiro, inteiro, inteiro)
    tocar = fluid('fluid_synth_noteon', inteiro, ponteiro, inteiro, inteiro, inteiro)
    silenciar = fluid('fluid_synth_all_sounds_off', inteiro, ponteiro, inteiro)
    escrever = fluid('fluid_synth_write_float', inteiro, ponteiro, inteiro, ponteiro, inteiro,
                     inteiro, ponteiro, inteiro, inteiro)

    configuracao = criar_configuracao()
    taxa = 32000
    configurar_numero(configuracao, b'synth.sample-rate', taxa)
    configurar_inteiro(configuracao, b'synth.reverb.active', 0)
    configurar_inteiro(configuracao, b'synth.chorus.active', 0)
    sintetizador = criar_sintetizador(configuracao)
    banco = carregar(sintetizador, str(fonte / 'TimGM6mb.sf2').encode(), 1)
    assert banco >= 0

    instrumentos = [('piano', 0, 6), ('cordas', 40, 12), ('xilofone', 13, 3)]
    for nome, programa, segundos in instrumentos:
        assert selecionar(sintetizador, 0, banco, 0, programa) == 0
        clipes = []
        for nota in range(36, 85, 6):
            silenciar(sintetizador, 0)
            tamanho = taxa * segundos
            esquerda = np.zeros(tamanho, np.float32)
            direita = np.zeros_like(esquerda)
            assert tocar(sintetizador, 0, nota, 86) == 0
            assert escrever(sintetizador, tamanho, esquerda.ctypes.data, 0, 1,
                            direita.ctypes.data, 0, 1) == 0
            onda = (esquerda + direita) * .5
            pico = np.max(np.abs(onda))
            assert pico > .0001, (nome, nota, pico)
            onda *= .56 / pico
            onda[-320:] *= np.linspace(1, 0, 320)
            clipes.append(onda)

        destino = fonte.parent / f'{nome}.mp3'
        subprocess.run(
            ['ffmpeg', '-loglevel', 'error', '-y', '-f', 'f32le', '-ar', str(taxa),
             '-ac', '1', '-i', 'pipe:0', '-c:a', 'libmp3lame', '-b:a', '56k', str(destino)],
            input=np.concatenate(clipes).tobytes(),
            check=True,
        )


if __name__ == '__main__':
    renderizar()
