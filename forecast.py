from scipy.io import wavfile
import numpy as np
from scipy.fftpack import fft
from scipy import signal
import pandas as pd
import keras

L = 48000
new_sample_rate = 8000
model_lstm = keras.models.load_model('../output_yesno/cnn.model')

def elaborate(formData, toplot=False):
    x=[]
    sample_rate, samples = wavfile.read(formData)
    #print("sample_rate: ",sample_rate," len(samples) ",len(samples))
    samples = getCentered1Sec(filename="fromWeb", samples=samples, sample_rate=sample_rate)

    freqs, times, specgram = log_specgram(samples, sample_rate=sample_rate)
    if(toplot==True):
        # plot specgram
        plot_specgram(spectrogram=specgram, filename="fromWeb", sample_rate=sample_rate, samples=samples, freqs=freqs, times=times)
    
    resampled = signal.resample(samples, new_sample_rate)
    freqs, times, specgram = log_specgram(resampled, sample_rate=new_sample_rate)
    
    # plot resampled specgram
    if(toplot==True):
        plot_specgram(spectrogram=specgram, filename="fromWeb"+ " - " + str(new_sample_rate), sample_rate=new_sample_rate, samples=resampled, freqs=freqs, times=times)
    x.append(specgram)
     
    x = np.array(x)
    x = x.reshape(tuple(list(x.shape) + [1]))
    #print("x shape ************ : ", x.shape, type(x))
     
    pred = model_lstm.predict(x)
    print(pred)
    #print(x)
    #print(x.shape)
    indexPredicted = np.argmax(pred, axis=1)
    if(indexPredicted==0):
        result = "no"
    elif(indexPredicted==2):
        result = "yes"
    else:
        result = "doubt"
        
    result={"result":result, "pred":pd.Series(pred[0]).to_json(orient='values')}
    return result

def pad_audio(samples, L=16000):
    if len(samples) >= L: 
        print("pad_audio nopad", samples.shape, samples)
        return samples
    else:
        print("samples shape in pad_audio",samples.shape)
        print(len(samples.shape))
        if (len(samples.shape) > 1):
            samples = samples[:,0]
        print("pad_audio 1 pad", samples.shape, samples)
        out = np.pad(samples, pad_width=(L - len(samples), 0), mode='constant', constant_values=(0, 0))
        print("pad_audio 2 pad", out.shape, out)
        print(out)
        return out

def chop_audio(samples, L=16000, num=1):
    """
    for i in range(num):
        beg = np.random.randint(0, len(samples) - L)
        yield samples[beg: beg + L]
    """
    return samples[0:L]

def custom_fft(y, fs):
    T = 1.0 / fs
    N = y.shape[0]
    yf = fft(y)
    xf = np.linspace(0.0, 1.0/(2.0*T), N//2)
    # FFT is simmetrical, so we take just the first half
    # FFT is also complex, to we take just the real part (abs)
    vals = 2.0/N * np.abs(yf[0:N//2])
    return xf, vals

def log_specgram(audio, sample_rate, window_size=20,
                 step_size=10, eps=1e-10):
    nperseg = int(round(window_size * sample_rate / 1e3))
    noverlap = int(round(step_size * sample_rate / 1e3))
    #print("nperseg:{}, noverlap:{} ".format(nperseg, noverlap))
    freqs, times, spec = signal.spectrogram(audio,
                                    fs=sample_rate,
                                    window='hann',
                                    nperseg=nperseg,
                                    noverlap=noverlap,
                                    detrend=False)
    specgram = np.log(spec.T.astype(np.float32) + eps)
    #print("specgram shape: ", specgram.shape)
    return freqs, times, specgram

def getCentered1Sec(filename, samples, sample_rate, plot=False):

    length = samples.shape[0] / sample_rate
    #print(sample_rate, samples.shape, length)
    #print(np.max(samples), np.argmax(samples))
    indexMax=np.argmax(samples)
    indexLeft = int(indexMax - sample_rate / 2)
    addToRight = 0
    if (indexLeft< 0 ):
        addToRight = -indexLeft
        indexLeft = 0
    indexRight = int(indexMax + sample_rate / 2 + addToRight)
    if(indexRight > len(samples)):
        indexRight = len(samples)
    #print("IndexLeft:{} IndexRight:{}".format(indexLeft, indexRight))
    centered = samples[indexLeft: indexRight]
    #print(len(centered))
    centered = pad_audio(centered, L=sample_rate)
    if(plot==True):
        timeOrig = np.linspace(0., length, samples.shape[0])

        lengthCentered = centered.shape[0] / sample_rate
        print("lengthCentered", lengthCentered)
        timeCentered = np.linspace(0., lengthCentered, centered.shape[0])

        fig = plt.figure(figsize=(14, 8))

        ax1 = fig.add_subplot(211)
        ax1.set_title(filename + "Orig")
        ax1.plot(timeOrig, samples[:])

        ax2 = fig.add_subplot(212)
        ax2.set_title(filename + "Centered")
        ax2.plot(timeCentered, centered[:])
    return centered

def plot_specgram(spectrogram, filename, sample_rate, samples, freqs, times):
    fig = plt.figure(figsize=(14, 8))
    ax1 = fig.add_subplot(211)
    ax1.set_title('Raw wave of ' + filename)
    ax1.set_ylabel('Amplitude')
    ax1.plot(np.linspace(0, sample_rate/len(samples), sample_rate), samples)

    ax2 = fig.add_subplot(212)
    ax2.imshow(spectrogram.T, aspect='auto', origin='lower', 
               extent=[times.min(), times.max(), freqs.min(), freqs.max()])
    ax2.set_yticks(freqs[::16])
    ax2.set_xticks(times[::16])
    ax2.set_title('Spectrogram of ' + filename)
    ax2.set_ylabel('Freqs in Hz')
    ax2.set_xlabel('Seconds')